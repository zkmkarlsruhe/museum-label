#! /usr/bin/env python3
#
# Copyright (c) 2021 ZKM | Hertz-Lab
# Dan Wilcox <dan.wilcox@zkm.de>
#
# BSD Simplified License.
# For information on usage and redistribution, and for a DISCLAIMER OF ALL
# WARRANTIES, see the file, "LICENSE.txt," in this distribution.
#
# This code has been developed at ZKM | Hertz-Lab as part of „The Intelligent
# Museum“ generously funded by the German Federal Cultural Foundation.

import asyncio
import signal

from pythonosc.osc_server import AsyncIOOSCUDPServer

from Logic import Logic

##### variables

# general interaction activity timeout in s
activity_timeout = 30

# listen timeout in s
listen_timeout = 30

# print verbose event info?
verbose = True

# osc receiver
local_addr = ("127.0.0.1", 5005)

# osc clients
langident_addr=("127.0.0.1", 9898)
websocket_addr=("127.0.0.1", 9999)

##### signal

# signal handler for nice exit
def sigint_handler():
    print("\ncaught signal, exiting...")
    asyncio.get_running_loop().stop()

##### main

loop = asyncio.get_event_loop()
loop.add_signal_handler(signal.SIGINT, sigint_handler)

logic = Logic(langident_addr=langident_addr, websocket_addr=websocket_addr,
              listen_timeout=listen_timeout, activity_timeout=activity_timeout,
              verbose=verbose)

server = AsyncIOOSCUDPServer(local_addr, logic.dispatcher, loop)
loop.run_until_complete(server.create_serve_endpoint())

try:
    loop.run_forever()
except KeyboardInterrupt:
    pass
