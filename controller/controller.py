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
import argparse

from pythonosc.osc_server import AsyncIOOSCUDPServer

from Logic import Logic

##### parser

parser = argparse.ArgumentParser(description="language identification display logic controller")

parser.add_argument(
    "--recvaddr", action="store", dest="recvaddr",
    default="127.0.0.1", help="osc receive addr, default: 127.0.0.1")
parser.add_argument(
    "--recvport", action="store", dest="recvport",
    default=5005, type=int, help="osc receive port, default: 5005")

parser.add_argument(
    "--lidaddr", action="store", dest="lidaddr",
    default="127.0.0.1", help="LanguageIdentifier app osc addr, default: 127.0.0.1")
parser.add_argument(
    "--lidport", action="store", dest="lidport",
    default=9898, type=int, help="LanguageIdentifier app osc port, default: 9898")

parser.add_argument(
    "--wsaddr", action="store", dest="wsaddr",
    default="127.0.0.1", help="baton websocket relay osc addr, default: 127.0.0.1")
parser.add_argument(
    "--wsport", action="store", dest="wsport",
    default=9999, type=int, help="baton websocket relay osc port, default: 9999")

parser.add_argument(
    "-a,--activity-timeout", action="store", dest="atimeout",
    default=30, type=int, help="general interaction activity timeout in s, default: 30")

parser.add_argument(
    "-l,--listen-timeout", action="store", dest="ltimeout",
    default=30, type=int, help="listen timeout in s, default: 30")

parser.add_argument("-v", "--verbose", action="store_true", dest="verbose",
    help="enable verbose printing")

# parse
args = parser.parse_args()

##### signal

# signal handler for nice exit
def sigint_handler():
    print("\ncaught signal, exiting...")
    asyncio.get_running_loop().stop()

##### main

# signal handling
loop = asyncio.get_event_loop()
loop.add_signal_handler(signal.SIGINT, sigint_handler)

# logic instance
logic = Logic(langident_addr=(args.lidaddr, args.lidport),
              websocket_addr=(args.wsaddr, args.wsport),
              listen_timeout=args.ltimeout, activity_timeout=args.atimeout,
              verbose=args.verbose)

# start server
server = AsyncIOOSCUDPServer((args.recvaddr, args.recvport), logic.dispatcher, loop)
loop.run_until_complete(server.create_serve_endpoint())
print(f"recv <- osc {args.recvaddr}:{args.recvport}")
print(f"send lid -> osc {args.lidaddr}:{args.lidport}")
print(f"send ws  -> osc {args.wsaddr}:{args.wsport}")

try:
    loop.run_forever()
except KeyboardInterrupt:
    pass
