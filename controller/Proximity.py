# Copyright (c) 2021 ZKM | Hertz-Lab
# Dan Wilcox <dan.wilcox@zkm.de>
#
# BSD Simplified License.
# For information on usage and redistribution, and for a DISCLAIMER OF ALL
# WARRANTIES, see the file, "LICENSE.txt," in this distribution.
#
# This code has been developed at ZKM | Hertz-Lab as part of „The Intelligent
# Museum“ generously funded by the German Federal Cultural Foundation.

from Timer import SimpleTimer

# proximity sensor with enter/exit debounce timer
class Proximity:

    # create with callback to invoke,
    # optionally set debounce timeouts in s, threshold 0-1, and/or verbose printing
    def __init__(self, callback, timeoutenter=0.5, timeoutexit=5, threshold=0.5, verbose=False):
        self.value = 0                   # current value 0-1
        self.threshold = threshold       # activation threshold
        self.timerenter = None           # enter debounce timer
        self.timerexit = None            # exit debounce timer
        self.timeoutenter = timeoutenter # enter timeout in seconds
        self.timeoutexit = timeoutexit   # exit timeout in seconds
        self.callback = callback
        self.verbose = verbose

    # update sensor value, starts debounce timer if above threshold
    def update(self, value):
        if value >= self.threshold:
            # enter?
            if self.timerenter is None:
                self.timerenter = SimpleTimer(self.timeoutenter, self._timeout)
                if self.verbose:
                    print("Proximity: started enter timer")
        else:
            # exit?
            if self.timerexit is None:
                self.timerexit = SimpleTimer(self.timeoutenter, self._timeout)
                if self.verbose:
                    print("Proximity: started enter timer")
        self.value = value

    # cancel debounce timers
    def cancel(self):
        if self.timerenter:
            self.timerenter.cancel()
            self.timerenter = None
            if self.verbose:
                print("Proximity: enter timer cancelled")
        if self.timerexit:
            self.timerexit.cancel()
            self.timerexit = None
            if self.verbose:
                print("Proximity: exit timer cancelled")

    # returns True if proximity is "close"
    def is_close(self):
        return self.value >= self.threshold

    def _timeout(self):
        if self.verbose:
            print("Proximity: timeout reached, value {self.value}")
        if self.timerenter:
            self.timerenter = None
        if self.timerexit:
            self.timerexit = None
        self.callback()
