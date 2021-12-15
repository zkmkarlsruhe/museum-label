# Copyright (c) 2021 ZKM | Hertz-Lab
# Dan Wilcox <dan.wilcox@zkm.de>
#
# BSD Simplified License.
# For information on usage and redistribution, and for a DISCLAIMER OF ALL
# WARRANTIES, see the file, "LICENSE.txt," in this distribution.
#
# This code has been developed at ZKM | Hertz-Lab as part of „The Intelligent
# Museum“ generously funded by the German Federal Cultural Foundation.

import numbers
from enum import Enum

from pythonosc.dispatcher import Dispatcher
from pythonosc.udp_client import SimpleUDPClient

from Timer import Timer
from Proximity import Proximity

# returns True is x is a number
def isnumber(x):
    return isinstance(x, numbers.Number)

# returns ~True if x is a string
def isstring(x):
    return isinstance(x, str)

# state machine states
class State(Enum):
    WAIT    = 1, # waiting for interaction
    LISTEN  = 2, # listening for audio input
    DETECT  = 3, # detecting language from audio input
    SUCCESS = 4, # success: detected a known lang
    FAIL    = 5, # fail: detected noise but not a language
    TIMEOUT = 6  # fail: detection timed out, no language found

# lang detection status
class Lang:

    maxTries = 3 # max detection tries before timeout

    def __init__(self):
        self.index = 0
        self.name = "noise"
        self.tries = 0 # current number of detection tries

    def set(self, index, name):
        self.index = index
        self.name = name

    def reset_noise(self):
        self.tries = 0

    def is_noise(self):
        return (self.index == 0 or self.name == "noise")

    def __str__(self):
        return f"{self.index} {self.name}"

# state machine logic class using callbacks
class Logic:

    # init with osc client addresses
    def __init__(self, langident_addr, websocket_addr, listen_timeout, activity_timeout, verbose=False):
        self.state = State.WAIT # current state
        self.lang = Lang() # lang detection status
        self.proximity = Proximity(self.timeout_proximity, verbose=verbose)
        self.listenTimer = Timer(listen_timeout, self.timeout_listen, name="ListenTimer", verbose=verbose)
        self.activityTimer = Timer(activity_timeout, self.timeout_activity, name="ActivityTimer", verbose=verbose)
        self.verbose = verbose
        # osc server
        self.dispatcher = Dispatcher()
        self.dispatcher.map("/proximity", self.osc_receive_proximity)
        self.dispatcher.map("/detecting", self.osc_receive_detecting)
        self.dispatcher.map("/lang",      self.osc_receive_lang)
        # osc clients
        addr, port = langident_addr
        self.langIdentClient = SimpleUDPClient(addr, port)
        addr, port = websocket_addr
        self.websocketClient = SimpleUDPClient(addr, port)
        # optional thingsboard client
        self.tbsender = None

    # stop detection on exit
    def __del__(self):
        self.proximity.cancel()
        self.listenTimer.cancel()
        self.activityTimer.cancel()
        self.osc_send_listen(0)
        self.osc_send_state(State.WAIT)

    # set new state, returns False if already current state
    def _state_set(self, state):
        if self.state == state: return False
        self.state = state
        if self.verbose: print(self.state)
        self.osc_send_state()
        return True

    # ----- states -----

    def state_set_wait(self):
        if not self._state_set(State.WAIT): return
        self.osc_send_listen(0)
        self.listenTimer.cancel()
        self.activityTimer.cancel()

    def state_set_listen(self):
        if not self._state_set(State.LISTEN): return
        self.osc_send_listen(1)
        self.activityTimer.start()

    def state_set_detect(self):
        if not self._state_set(State.DETECT): return
        self.activityTimer.start()

    def state_set_success(self):
        if not self._state_set(State.SUCCESS): return
        self.activityTimer.cancel()
        self.listenTimer.start()

    def state_set_fail(self):
        if not self._state_set(State.FAIL): return
        self.activityTimer.cancel()
        self.listenTimer.start()

    def state_set_timeout(self):
        if not self._state_set(State.TIMEOUT): return
        self.osc_send_listen(0) # stop listening entirely before retstarting
        self.listenTimer.start()

    # ----- sending osc -----

    def osc_send_listen(self, enable):
        print(f"sending /listen {enable}")
        self.langIdentClient.send_message("/listen", enable)

    def osc_send_lang(self, address, args):
        print(f"sending /lang {args}")
        self.websocketClient.send_message("/lang", args)

    def osc_send_state(self):
        state = "wait"
        if self.state == State.LISTEN:    state = "listen"
        elif self.state == State.DETECT:  state = "detect"
        elif self.state == State.SUCCESS: state = "success"
        elif self.state == State.FAIL:    state = "fail"
        elif self.state == State.TIMEOUT: state = "timeout"
        print(f"sending /state {state}")
        self.websocketClient.send_message("/state", state)

    # ----- receiving osc -----

    def osc_receive_proximity(self, address, *args):
        if len(args) == 1 and isnumber(args[0]):
            if self.verbose:
                print(f"{address}: {round(args[0], 2)}")
            self.proximity.update(args[0])
            if self.tbsender:
                self.tbsender.send(self.proximity.is_close())

    def osc_receive_detecting(self, address, *args):
        if self.verbose:
            print(f"{address}: {args}")
        if len(args) == 1 and isnumber(args[0]):
            print(f"detecting {args[0]}")
            if self.state == State.WAIT:
                return
            if args[0] == True:
                self.state_set_detect()

    def osc_receive_lang(self, address, *args):
        if self.verbose:
            print(f"{address}: {args}")
        if self.state == State.WAIT:
            return
        if len(args) == 3 and isnumber(args[0]) and isstring(args[1]):
            self.lang.set(args[0], args[1])
            print(f"lang {self.lang}")
            if self.lang.is_noise():
                self.lang.tries += 1
                if self.lang.tries >= Lang.maxTries:
                    self.state_set_fail()
                else:
                    if self.verbose:
                        print(f"detection tries {self.lang.tries}")
                    self.osc_send_listen(1)
                    return
            else:
                self.state_set_success()
            self.osc_send_lang(address, args)
            self.lang.reset_noise()

    # ----- timeout callbacks -----

    def timeout_proximity(self):
        if self.proximity.is_close():
            if self.state == State.WAIT:
                # person walks up
                self.state_set_listen()
        else:
            # person left
            self.state_set_wait()

    # restart listening
    def timeout_listen(self):
        self.state_set_listen()

    # listening timeout out
    def timeout_activity(self):
        self.state_set_timeout()
