#! /bin/sh
#
# run to start basic localhost system for testing,
# quit LanguageIdentifier app to shutdwn everything
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

set -e

##### variables

BATON=../baton/baton
CTLR=./controller/controller
LID=../LanguageIdentifier/lid

INPUTDEV=0
INPUTCHAN=1
CONFIDENCE=0.5
THRESHOLD=10

# platform specifics
case "$(uname -s)" in
	Linux*)  PLATFORM=linux   ;;
	Darwin*) PLATFORM=darwin  ;;
	CYGWIN*) PLATFORM=windows ;;
	MINGW*)  PLATFORM=windows ;;
	*)       PLATFORM=unknown ;;
esac

##### functions

# get the pid by script name, ie. getpidof controller.py -> 16243
# $1 script or process name
function getpid() {
	if [ $PLATFORM = darwin ] ; then
		# pidof is not part of BSD and Darwin is BSD-based
		echo $(ps -ef | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f3)
	else
		# assume pidof is available...
		echo $(pidof "$1")
	fi
}

##### main

# start baton
$BATON &
sleep 1
BATON_PID=$(getpid baton.py)
echo "baton: $BATON_PID"

# start controller
$CTLR &
sleep 1
CTLR_PID=$(getpid controller.py)
echo "controller: $BATON_PID"

# run lid & wait
$LID --inputdev $INPUTDEV --inputchan $INPUTCHAN \
	  -s "127.0.0.1:5005" -c $CONFIDENCE -t $THRESHOLD \
	  --nolisten --autostop

# stop
kill -INT $CTLR_PID
kill -INT $BATON_PID
