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

# proximity sensor with debounce timer
class Proximity:

    # create with callback to invoke,
    # optionally set debounce timeout in s, threshold 0-1, and/or verbose printing
    def __init__(self, callback, timeout=2, threshold=0.5, verbose=False):
        self.value = 0             # current value 0-1
        self.threshold = threshold # activation threshold
        self.timer = None          # debounce timer
        self.timeout = timeout     # debounce timeout in seconds
        self.callback = callback
        self.verbose = verbose

    # update sensor value, starts debounce timer if above threshold
    def update(self, value):
        if value >= self.threshold and self.timer is None:
            self.timer = SimpleTimer(self.timeout, self._timeout)
            if self.verbose:
                print("Proximity: started timer")
        self.value = value

    # cancel debounce timer
    def cancel(self):
        if self.timer is None:
            return
        self.timer.cancel()
        self.timer = None
        if self.verbose:
            print("Proximity: timer cancelled")

    # returns True if proximity is "close"
    def is_close(self):
        return self.value >= self.threshold

    def _timeout(self):
        if self.verbose:
            print("Proximity: timeout reached, value {self.value}")
        self.timer = None
        self.callback()
