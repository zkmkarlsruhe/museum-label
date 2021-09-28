# -*- coding: utf-8 -*
import serial
import time
import sys
import argparse

# https://stackoverflow.com/questions/1969240/mapping-a-range-of-values-to-another
def translate(value, leftMin, leftMax, rightMin, rightMax):
    # Figure out how 'wide' each range is
    leftSpan = leftMax - leftMin
    rightSpan = rightMax - rightMin

    # Convert the left range into a 0-1 range (float)
    valueScaled = float(value - leftMin) / float(leftSpan)

    # Convert the 0-1 range into a value in the right range.
    return rightMin + (valueScaled * rightSpan)

# -----------------------------------------------------------------------------------
# open serial port
# because we use hardware serial pins for UART0 this is static and will never change
# -----------------------------------------------------------------------------------
ser = serial.Serial("/dev/ttyAMA0", 115200)

def getTFminiData(client, args):

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

                max_distance = 800
                if distance > max_distance:
                    distance = max_distance
                
                distance = translate(distance, 0, max_distance, 0, 1)

                if args.use_osc:
                    client.send_message("/listen", distance)
                else:
                    client.sendto(distance, (args.destination, args.port))

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
    parser.add_argument('-u', '--use_osc', type=bool, default=True, dest='use_osc', help='', metavar='USE_OSC')
    args = parser.parse_args()
    print(vars(args))

    if args.use_osc:
        from pythonosc import udp_client
        client = udp_client.SimpleUDPClient(args.ip, args.port)
        
    else:
        import socket
        # init UDP socket 
        client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        client.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)



    for x in range(10):
        time.sleep(1)
    
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
