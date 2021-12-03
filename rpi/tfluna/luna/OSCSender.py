#! /usr/bin/env python3
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

from pythonosc import udp_client

# Open Sound Control message sender
class OSCSender:

    # init with address pair: (host, port)
    def __init__(self, addr):
        host,port = addr
        self.client = udp_client.SimpleUDPClient(host, port)
        self.addr = addr
        self.address = "/distance" # OSC address

    # send distance value
    def send(self, distance, tfluna):
        args = [tfluna.devid, distance] if tfluna.devid else distance
        self.client.send_message(self.address, args)

    # print settings
    def print(self):
        host,port = self.addr
        print(f"osc sender: {host} {port}")
        print(f"osc sender: sending {self.address}")
