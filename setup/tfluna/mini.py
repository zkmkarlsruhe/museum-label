# -*- coding: utf-8 -*
import serial
import time
import sys
import argparse
import socket

# -----------------------------------------------------------------------------------
# open serial port
# because we use hardware serial pins for UART0 this is static and will never change
# -----------------------------------------------------------------------------------
ser = serial.Serial("/dev/ttyAMA0", 115200)

def getTFminiData(sock, args):

    while True:
        
        count = ser.in_waiting
        
        if count > 4:
        
            recv = ser.read(4)
            ser.reset_input_buffer()
            
            #print(recv)

            if recv[0] == 'Y' and recv[1] == 'Y' and not recv[2] == 'Y': # 0x59 is 'Y'
   
                low = int(recv[2].encode('hex'), 16)
                high = int(recv[3].encode('hex'), 16)
                distance = low + high * 256
                message = "mutech audiotrigger tfmini " + str(distance)
                sock.sendto(message, (args.destination, args.port))

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
    parser.add_argument('-i', '--interval', type=float, default=0.1, dest='interval', help='interval in seconds (default: 0.1 sec)', metavar='INTERVAL')
    parser.add_argument('-d', '--destination', default='127.0.0.1', dest='destination', help='destination hostname or IP', metavar='HOST')
    parser.add_argument('-p', '--port', type=int, default='12345', dest='port', help='destination port to send to', metavar='PORT')
    args = parser.parse_args()
    print(vars(args))

    # init UDP socket 
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    #sock.bind((args.destination, args.port))
    
    try:
        if ser.is_open == False:
            print("try to open serial port")
            ser.open()
        else:
            print("open")
    
        getTFminiData(sock, args)
    
    except KeyboardInterrupt:   # Ctrl+C
        if ser != None:
            ser.close()
