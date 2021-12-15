# Copyright (c) 2021 ZKM | Hertz-Lab
# Dan Wilcox <dan.wilcox@zkm.de>
#
# BSD Simplified License.
# For information on usage and redistribution, and for a DISCLAIMER OF ALL
# WARRANTIES, see the file, "LICENSE.txt," in this distribution.
#
# This code has been developed at ZKM | Hertz-Lab as part of „The Intelligent
# Museum“ generously funded by the German Federal Cultural Foundation.

from Timer import Timer

# proximity sensor with enter/exit debounce timers
# * enter: trigger callback, then wait before checking for exit
# * exit: wait, then trigger callback at timeout
class Proximity:

    # create with callback to invoke,
    # optionally set threshold 0-1, and/or verbose printing
    def __init__(self, callback, threshold=0.5, verbose=False):
        self.value = 0             # current value 0-1
        self.threshold = threshold # activation threshold
        self.is_there = False      # is something there?
        self.enter_timer = Timer(0.5, self._enter) # enter debounce timer
        self.exit_timer  = Timer(5,   self._exit)  # exit debounce timer
        self.callback = callback
        self.verbose = verbose

    def __del__(self):
        self.cancel()

    # update sensor value, starts debounce timers
    def update(self, value):
        self.value = value
        if self.value >= self.threshold:
            if self.is_there is False:
                self.exit_timer.cancel()
                self.is_there = True
                print(f"Proximity: enter {self.value}")
                self.callback() # enter event
                self.enter_timer.start()
        else:
            if self.is_there is True:
                self.enter_timer.cancel()
                self.is_there = False
                self.exit_timer.start()
        #print(f"Proximity: {round(self.value, 2)} {self.is_there}")

    # cancel debounce timers
    def cancel(self):
        self.enter_timer.cancel()
        self.exit_timer.cancel()

    # returns True if proximity is "close"
    def is_close(self):
        return self.value >= self.threshold

    def _enter(self):
        pass

    def _exit(self):
        print(f"Proximity: exit {self.value}")
        self.callback() # exit event
