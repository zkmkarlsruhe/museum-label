#! /usr/bin/env python3
#
# Copyright (c) 2020 ZKM | Museums Technik
# Daniel Heiss <heiss@zkm.de>
# Marc Schütze <mschuetze@zkm.de>
#
# Copyright (c) 2021 KM | Hertz-Labor
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

##### parser

parser = argparse.ArgumentParser(description="TF Luna LIDAR sensor")
parser.add_argument(
    "dev", metavar="DEV",
    default="/dev/ttyAMA0", help="serial port dev (default \"/dev/ttyAMA0\")")
parser.add_argument(
    "-u", "--use_udp", action="store_true", dest="use_udp",
    default=False, help="whether to use osc or udp")
parser.add_argument(
    "-d", "--destination", dest="destination", metavar="HOST",
    default="127.0.0.1", help="destination hostname or IP address")
parser.add_argument(
    "-p", "--port", type=int, dest="port", metavar="PORT",
    default="5005", help="destination port to send to")
parser.add_argument(
    "-i", "--interval", type=float, dest="interval", metavar="INTERVAL",
    default=0.1,  help="interval in seconds (default 0.1 sec)")
parser.add_argument(
    "-e", "--epsilon", type=float, dest="epsilon", metavar="EPSILON",
    default=0.001, help="minimum difference for sending a message")
parser.add_argument(
    "-m", "--max_distance", type=int, dest="max_distance", metavar="MAX_DISTANCE",
    default=200, help="maximum allowed distance in cm (rest is clipped)")
args = parser.add_argument(
    "-n", "--normalize", action="store_true", dest="normalize",
    help="send normalized values? 0 max distance - 1 close (default false)")
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

    def __init__(self, addr, verbose=True):
        import socket
        self.client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        self.client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.addr = addr # address pair tuple: (host, port)
        self.verbose = verbose
        if self.verbose:
            print(f"udp sender: created {addr}")

    def send(distance):
        message = str(distance).encode()
        self.client.sendto(message, addr)
        if self.verbose:
            print(f"udp sender: sent {message}")

### OSC

class OSCSender:

    def __init__(self, addr, verbose=True):
        from pythonosc import udp_client
        host,port = addr
        self.client = udp_client.SimpleUDPClient(host, port)
        self.verbose = verbose
        if self.verbose:
            print(f"osc sender: created {addr}")

    def send(distance):
        client.send_message("/proximity", distance)
        if self.verbose:
            print(f"osc sender: sent {message}")

### TFLuna

class TFLuna:

    def __init__(self, dev, rate=115200, verbose=True):
        self.serial = serial.Serial(dev, rate)
        self.prev_distance = -1 # previous distance in cm
        self.max_distance = 200 # distance threshold in cm
        self.epsilon = 0.01     # change threshold
        self.interval = 0.1     # sleep idle time in s
        self.normalize = False  # normalize measured distance?
        self.is_running = True
        self.senders = []
        self.verbose = verbose
        if self.verbose:
            print(f"tf luna: created {dev} {rate}")

    # add a distance sender which implements a send(distance) method
    def add_sender(sender):
        self.senders.push_back(sender)

    # open serial port for reading
    def open(self):
        if not self.serial.is_open:
            self.serial.open()

    # close serial port
    def close(self):
        if self.serial.is_open:
            self.serial.close()

    # start synchronous run loop
    def start(self):
        self.is_running = True
        while self.is_running:
            self.update()
            time.sleep(self.interval)
        self.is_running = False

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
            
                # map the range to 0.0 (far away) and 1.0 (closest)
                if self.normalize:
                    distance = map_value(distance, 0, self.max_distance, 1, 0)

                # send if difference from prev value is large enough
                if abs(distance - self.prev_distance) >= self.epsilon:
                    if self.verbose:
                        print(f"{distance}")
                    for sender in self.senders:
                        sender.send(distance)
                    self.prev_distance = distance

##### signal

# signal handler for nice exit
def sigint_handler(signum, frame):
    tfluna.stop()

##### main

if __name__ == '__main__':

    # parse
    args = parser.parse_args()
    if args.verbose:
        print(vars(args))

    # sender(s)
    sender = None
    if args.use_udp:
        sender = UDPSender((args.destination, args.port), args.verbose)
    else:
        sender = OSCSender((args.destination, args.port), args.verbose)

    # sensor
    tfluna = TFLuna(dev=args.dev, verbose=args.verbose)
    tfluna.max_distance = args.max_distance
    tfluna.epsilon = args.epsilon
    tfluna.interval = args.interval
    tfluna.normalize = args.normalize

    # start
    signal.signal(signal.SIGINT, sigint_handler)
    try:
        tfluna.open()
        tfluna.start()
    finally:
        tfluna.close()
