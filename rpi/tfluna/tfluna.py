#! /usr/bin/env python3
#
# Copyright (c) 2020 ZKM | Museums Technik
# Daniel Heiss <heiss@zkm.de>
# Marc Schütze <mschuetze@zkm.de>
#
# Copyright (c) 2021 ZKM | Hertz-Labor
# Dan Wilcox <dan.wilcox@zkm.de>
# Paul Bethge <bethge@zkm.de>
#
# BSD Simplified License.
# For information on usage and redistribution, and for a DISCLAIMER OF ALL
# WARRANTIES, see the file, "LICENSE.txt," in this distribution.
#
# This code has been developed at ZKM | Hertz-Lab as part of „The Intelligent
# Museum“ generously funded by the German Federal Cultural Foundation.
# -*- coding: utf-8 -*

import serial
import time
import sys
import signal
import argparse
import socket
from pythonosc import udp_client

##### parser

parser = argparse.ArgumentParser(description='''
Sends TF Luna LIDAR proximity distance measurements over OSC (default) or UDP.

Distance format is cm integer or normalized float (inverted, 1 near to 0 far).

Message format: message [id] distance

  Ex. OSC: "/tfluna" distance

  Ex. UDP: "tfluna" distance

The default "tfluna" message can be overridden via --message. An additional
device identifier can be added with --id:

  $ --message /proximity --id 2
  OSC: "/proximity" 2 distance
''', formatter_class=argparse.RawTextHelpFormatter)
parser.add_argument(
    "dev", type=str, nargs="?", metavar="DEV",
    default="/dev/ttyAMA0", help="serial port device, default: dev/ttyAMA0")
parser.add_argument(
    "-u", "--udp", action="store_true", dest="udp",
    default=False, help="send raw UDP message instead of OSC")
parser.add_argument(
    "-d", "--destination", dest="destination", metavar="HOST",
    default="127.0.0.1", help="destination hostname or IP address, default: 127.0.0.1")
parser.add_argument(
    "-p", "--port", type=int, dest="port", metavar="PORT",
    default="5005", help="destination port to send to, default: 5005")
parser.add_argument(
    "-i", "--interval", type=float, dest="interval", metavar="INTERVAL",
    default=0.1, help="read interval in seconds, default: 0.1")
parser.add_argument(
    "-e", "--epsilon", type=int, dest="epsilon", metavar="EPSILON",
    default=1, help="min distance change in cm to send a message, default: 2")
parser.add_argument(
    "-m", "--max-distance", type=int, dest="max_distance", metavar="MAX_DISTANCE",
    default=200, help="max allowed distance in cm, rest is clipped")
args = parser.add_argument(
    "-n", "--normalize", action="store_true", dest="normalize",
    help="send normalized values instead of cm: 1 near to 0 far (max distance)")
args = parser.add_argument(
    "--message", type=str, nargs="+", dest="message", metavar="MESSAGE",
    default=None, help="set OSC message address or UDP message text")
args = parser.add_argument(
    "--id", type=int, dest="devid", metavar="DEVID",
    default=None, help="set device identifier to include in message: message id distance")
args = parser.add_argument(
    "-v", "--verbose", action="store_true", dest="verbose",
    help="enable verbose printing")

##### math

# map a value within an input range min-max to an output range
def map_value(value, inmin, inmax, outmin, outmax):
    # the following is borrowed from openframeworks ofMath.cpp
    if abs(inmin - inmax) < 0.0001:
        return outmin
    else:
        outval = ((value - inmin) / (inmax - inmin) * (outmax - outmin) + outmin)
        if outmax < outmin:
            if outval < outmax:
                outval = outmax
            elif outval > outmin:
                outval = outmin
        else:
            if outval > outmax:
                outval = outmax
            elif outval < outmin:
                outval = outmin
        return outval

# clamp a value to an output range min-max
def clamp_value(value, outmin, outmax):
    return max(min(value, outmax), outmin)

### UDP

class UDPSender:

    # init with address pair: (host, port)
    def __init__(self, addr):
        self.client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        self.client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.addr = addr
        self.message = "distance" # message text

    # send distance value
    def send(self, distance, devid=None):
        message = self.message
        if devid != None:
            message = " " + str(devid)
        message = (message + " " + str(distance)).encode()
        self.client.sendto(message, self.addr)

    # print settings
    def print(self):
        host,port = self.addr
        print(f"udp sender: {host} {port}")
        print(f"udp sender: sending {self.message}")

### OSC

class OSCSender:

    # init with address pair: (host, port)
    def __init__(self, addr):
        host,port = addr
        self.client = udp_client.SimpleUDPClient(host, port)
        self.addr = addr
        self.address = "/distance" # OSC address

    # send distance value
    def send(self, distance, devid=None):
        if devid == None:
            self.client.send_message(self.address, distance)
        else:
            self.client.send_message(self.address, devid, distance)

    # print settings
    def print(self):
        host,port = self.addr
        print(f"osc sender: {host} {port}")
        print(f"osc sender: sending {self.address}")

### TFLuna

class TFLuna:

    # init with dev path/name and optional baud rate, device identifier, or verbosity
    def __init__(self, dev, rate=115200, devid=None, verbose=True):
        self.serial = serial.Serial(dev, rate)
        self.devid = devid      # optional device identifier, unrelated to serial dev
        self.prev_distance = 0  # previous distance in cm
        self.max_distance = 200 # distance threshold in cm
        self.epsilon = 2        # change threshold in cm
        self.interval = 0.1     # sleep idle time in s
        self.normalize = False  # normalize measured distance?
        self.is_running = True
        self.senders = []
        self.verbose = verbose
        if self.verbose:
            print(f"tfluna: created {dev} {rate}")

    # add a distance sender which implements the following method:
    # send(self, distance, devid=None)
    def add_sender(self, sender):
        self.senders.append(sender)

    # open serial port for reading
    def open(self):
        if not self.serial.is_open:
            self.serial.open()
            if self.verbose:
                print("tfluna: open")

    # close serial port
    def close(self):
        if self.serial.is_open:
            self.serial.close()
            if self.verbose:
                print("tfluna: close")

    # start synchronous run loop
    def start(self):
        self.is_running = True
        if self.verbose:
            print("tfluna: start")
        while self.is_running:
            self.update()
            time.sleep(self.interval)
        self.is_running = False
        if self.verbose:
            print("tfuna: stop")

    # stop synchronous run loop
    def stop(self):
        self.is_running = False

    # read one chunk of data, parse into distance value, and send
    def update(self):
        count = self.serial.in_waiting
        if count > 4:
            recv = self.serial.read(4)
            self.serial.reset_input_buffer()

            # check if input is valid
            if recv[0] == 89 and recv[1] == 89:
                #print(f"{str(recv[0])} {str(recv[1])} {str(recv[2])} {str(recv[3])}")

                # interpret upper two bytes as one 16 bit int
                low = int(recv[2])
                high = int(recv[3])
                distance = clamp_value(low + high * 256, 0, self.max_distance)
            
                # ignore if difference from prev value is too small
                if abs(distance - self.prev_distance) < self.epsilon:
                    return
                self.prev_distance = distance

                # map to normalized range? 0 far to 1 near
                if self.normalize:
                    distance = map_value(distance, 0, self.max_distance, 1, 0)

                # send
                if self.verbose:
                    print(f"tfluna: {distance}")
                for sender in self.senders:
                    sender.send(distance, self.devid)

    # print settings
    def print(self):
        print(f"tfluna: max distance {self.max_distance}")
        print(f"tfluna: epsilon {self.epsilon}")
        print(f"tfluna: interval {self.interval}")
        print(f"tfluna: normalize {self.normalize}")

##### signal

# signal handler for nice exit
def sigint_handler(signum, frame):
    tfluna.stop()

##### main

if __name__ == '__main__':

    # parse
    args = parser.parse_args()

    # sensor
    tfluna = TFLuna(dev=args.dev, verbose=args.verbose)
    tfluna.max_distance = args.max_distance
    tfluna.epsilon = args.epsilon
    tfluna.interval = args.interval
    tfluna.normalize = args.normalize
    if args.verbose:
        tfluna.print()

    # sender(s)
    sender = None
    if args.udp:
        sender = UDPSender(addr=(args.destination, args.port))
        if args.message == None:
            sender.message = "tfluna"
        else:
            sender.message = " ".join(args.message)
    else:
        sender = OSCSender(addr=(args.destination, args.port))
        if args.message == None:
            sender.address = "/tfluna"
        else:
            sender.address = " ".join(args.message)
    tfluna.add_sender(sender)
    if args.verbose:
        sender.print()

    # start
    signal.signal(signal.SIGINT, sigint_handler)
    try:
        tfluna.open()
        tfluna.start()
    finally:
        tfluna.close()
