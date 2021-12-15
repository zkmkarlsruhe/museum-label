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

# simple asyncio timer
# from https://stackoverflow.com/a/45430833
class SimpleTimer:

	# start timer with timeout interval and callback function to invoke
    def __init__(self, timeout, callback):
        self._timeout = timeout
        self._callback = callback
        self._task = asyncio.create_task(self._job())

    def __del__(self):
    	self.cancel()

    # cancel timer
    def cancel(self):
        self._task.cancel()

    async def _job(self):
        await asyncio.sleep(self._timeout)
        await self._callback()

# reusable timer
class Timer:

    # create with timer timeout interval and callback function to invoke,
    # optionally set name and verbose printing
    def __init__(self, timeout, callback, name="Timer", verbose=False):
        self._timer = None # timer
        self.timeout = timeout   # timeout in seconds
        self.callback = callback # event callback
        self.name = name         # identifier
        self.verbose = verbose   # verbose printing?

    # (re)start timer
    def start(self):
        if self._timer:
            self._timer.cancel()
        self._timer = SimpleTimer(self.timeout, self._timeout)
        if self.verbose:
            print(self.name + ": started")

    # cancel timer
    def cancel(self):
        if self._timer:
            self._timer.cancel()
            if self.verbose:
                print(self.name + ": cancelled")
        self._timer = None

    # returns True if timer is running
    def is_running(self):
        return self._timer != None

    def _timeout(self):
        if self.verbose:
            print(self.name + ": timeout")
        self._timer = None
        self.callback()
