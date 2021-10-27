#! /bin/sh
#
# run script to start server-side system,
# quit LanguageIdentifier app to shut everything down
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

# stop on error
set -e

##### variables

BATON=../baton/baton
CTLR=./controller/controller
LID=../LanguageIdentifier/lid

# LanguageIdentifier
CONFIDENCE=0.5
THRESHOLD=10
INPUTDEV=0
INPUTCHAN=1

# osc and websocket recv address
RECVADDR=localhost

# controller
VERBOSE=""

# platform specifics
case "$(uname -s)" in
  Linux*)  PLATFORM=linux   ;;
  Darwin*) PLATFORM=darwin  ;;
  CYGWIN*) PLATFORM=windows ;;
  MINGW*)  PLATFORM=windows ;;
  *)       PLATFORM=unknown ;;
esac

##### functions

# check argument and exit with error if not set
# $1 argument name in error print
# $2 argument
checkarg() {
  local arg=$2
  local failed=false
  if [ "$arg" = "" ] ; then
    failed=true
  elif [ "${arg%${arg-?}}"x = '-x' ] ; then
    failed=true
  fi
  if [ "$failed" = true ] ; then
    echo "$1 option requires an argument"
    exit 1
  fi
}

# get the pid by script name, ie. getpidof controller.py -> 16243
# $1 script or process name
getpid() {
  if [ $PLATFORM = darwin ] ; then
    # pidof is not part of BSD and Darwin is BSD-based
    echo $(ps -ef | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f3)
  else
    # pidof doesn't seem to return pids of python scripts by name
    echo $(ps ax | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f2)
  fi
}

##### parse command line arguments

HELP="USAGE: $(basename $0) [OPTIONS]

  run server-side language identification & logic,
  quit LanguageIdentifier app to shut everything down

Options:
  -h,--help              display this help message
  -c,--confidence FLOAT  langid min confidence 0 - 1, default $CONFIDENCE
  -t,--threshold INT     langid volume threshold 0 - 100, default $THRESHOLD
  -l,--list              list audio input devices and exit
  --inputdev INT         audio input device number, default $INPUTDEV
  --inputchan INT        audio input device channel, default $INPUTCHAN
  --recvaddr STR         controller osc and websocket receive address
                         ie. ws://####:8081, default: $RECVADDR
  -v,--verbose           enable verbose controller printing
"

while [ "$1" != "" ] ; do
  case $1 in
    -h|--help)
      echo "$HELP"
      exit 0
      ;;
    -c|--confidence)
      shift 1
      checkarg "-c,--confidence" $1
      CONFIDENCE=$1
      ;;
    -t|--threshold)
      shift 1
      checkarg "-t,--threshold" $1
      THRESHOLD=$1
      ;;
    -l|--list)
      $LID -l
      exit 0
      ;;
    --inputdev)
      shift 1
      checkarg "--inputdev" $1
      INPUTDEV=$1
      ;;
    --inputchan)
      shift 1
      checkarg "--inputchan" $1
      INPUTCHAN=$1
      ;;
    --recvaddr)
      shift 1
      checkarg "--recvaddr" $1
      RECVADDR=$1
      ;;
    -v|--verbose)
      VERBOSE="-v"
      ;;
    *)
      break
      ;;
  esac
  shift 1
done

echo "confidence: $CONFIDENCE"
echo "threshold:  $THRESHOLD"
echo "inputdev:   $INPUTDEV"
echo "inputchan:  $INPUTCHAN"
echo "recvaddr:   $RECVADDR"
echo "verbose:    $VERBOSE"

##### main

# start baton
$BATON --wshost $RECVADDR &
sleep 1
BATON_PID=$(getpid baton.py)
echo "baton: $BATON_PID"

# start controller
$CTLR --recvaddr $RECVADDR $VERBOSE &
sleep 1
CTLR_PID=$(getpid controller.py)
echo "controller: $BATON_PID"

# run lid & wait
$LID --inputdev $INPUTDEV --inputchan $INPUTCHAN \
    -s "$RECVADDR:5005" -c $CONFIDENCE -t $THRESHOLD \
    --nolisten --autostop

# stop
kill -INT $CTLR_PID
kill -INT $BATON_PID
