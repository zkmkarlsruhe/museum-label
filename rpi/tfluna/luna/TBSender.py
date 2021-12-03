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

# TODO: thread sending otherwise requests.post will block?

import requests

# ThingsBoard message sender
class TBSender:

    # init with thingsboard url (including access token)
    def __init__(self, url):
        self.url = url
        self.message = "isThere" # message name
        self.is_there = False # is someone/something there? ie. blocking sensor

    # send event on change
    def send(self, distance, tfluna):
        is_there = distance < tfluna.max_distance
        if is_there == self.is_there:
            return
        self.is_there = is_there
        try:
            payload = {self.message: self.is_there}
            req = requests.post(self.url, json=payload)
            if req.status_code != 200:
                print(f"tb sender: send error {req.status_code}")
        except Exception as e:
            print(f"tb sender: send error: {e}")

    # print settings
    def print(self):
        print(f"tb sender: {self.url}")
        print(f"tb sender: sending {self.message}")
