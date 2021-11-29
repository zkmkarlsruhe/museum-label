#! /usr/bin/env python3
# -*- coding: utf-8 -*
import serial
import time
import sys
import argparse

# map a value within an input range min-max to an output range
def mapValue(value, inmin, inmax, outmin, outmax):
    # the following is borrowed from OpenFrameworks ofMath.cpp
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
def clampValue(value, outmin, outmax):
    return max(min(value, outmax), outmin)

# -----------------------------------------------------------------------------------
# open serial port
# because we use hardware serial pins for UART0 this is static and will never change
# -----------------------------------------------------------------------------------
ser = serial.Serial("/dev/ttyAMA0", 115200)

def getTFminiData(client, args):

    last_distance = -1
    max_distance = args.max_distance

    while True:
        
        count = ser.in_waiting
        
        if count > 4:
            recv = ser.read(4)
            ser.reset_input_buffer()
            
            # print(str(recv[0]) + " " +  str(recv[1]) + " " +str(recv[2]) + " " +str(recv[3]) )

            # check if input is valid
            if recv[0] == 89 and recv[1] == 89: 
   
                # interpret upper two bytes as one 16bit int
                low = int(recv[2])
                high = int(recv[3])
                distance = clampValue(low + high * 256, 0, max_distance)
                
                # map the range to 0.0 (far away) and 1.0 (closest)
                distance = mapValue(distance, 0, max_distance, 1, 0)

                # check if difference is large enough
                if abs(distance - last_distance) >= args.epsilon:

                    if args.verbose:
                        print(f"normalized: {distance}")

                    # choose a protocol
                    if args.use_udp:
                        message = str(distance).encode()
                        client.sendto(message, (args.destination, args.port))
                    else:
                        client.send_message("/proximity", distance)

                last_distance = distance

        time.sleep(args.interval)

# -----------------------------------------------------------------------------------
# main
# parse args
# open udp socket
# init serial
# start endless reading loop
# -----------------------------------------------------------------------------------
if __name__ == '__main__':

    parser = argparse.ArgumentParser(description='TF Luna Lidar sensor')
    parser.add_argument('-u', '--use_udp', action='store_true',default=False, dest='use_udp', help='whether to use osc or udp')
    parser.add_argument('-d', '--destination', default='127.0.0.1', dest='destination', help='destination hostname or IP', metavar='HOST')
    parser.add_argument('-p', '--port', type=int, default='5005', dest='port', help='destination port to send to', metavar='PORT')
    parser.add_argument('-i', '--interval', type=float, default=0.1, dest='interval', help='interval in seconds (default: 0.1 sec)', metavar='INTERVAL')
    parser.add_argument('-e', '--epsilon', type=float, default=0.001, dest='epsilon', help='minimum difference for sending a package', metavar='EPSILON')
    parser.add_argument('-m', '--max_distance', type=int, default=200, dest='max_distance', help='maximum allowed distance in cm (rest is capped)', metavar='MAX_DISTANCE')
    args = parser.add_argument('-v', '--verbose', action="store_true", dest="verbose", help="enable verbose printing")
    args = parser.parse_args()
    print(vars(args))

    if args.use_udp:
        import socket
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    else:
        from pythonosc import udp_client
        client = udp_client.SimpleUDPClient(args.destination, args.port)

    try:
        if ser.is_open == False:
            print("try to open serial port")
            ser.open()
        else:
            print("open")
    
        getTFminiData(client, args)
    
    except KeyboardInterrupt:   # Ctrl+C
        if ser != None:
            ser.close()

