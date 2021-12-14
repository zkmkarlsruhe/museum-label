#! /bin/sh
#
# macOS/Linux run script to start server-side system,
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

BATON=baton/baton
CTLR=controller/controller
LANGID=LanguageIdentifier/langid

# LanguageIdentifier
CONFIDENCE=0.5
THRESHOLD=10
INPUTDEV=0
INPUTCHAN=1

# osc and websocket host address
HOST=localhost

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
  --host STR             controller osc and websocket host address
                         ie. ws://####:8081, default: $HOST
  -l,--list              list audio input devices and exit
  --inputdev INT         audio input device number, default $INPUTDEV
  --inputchan INT        audio input device channel, default $INPUTCHAN
  -c,--confidence FLOAT  langid min confidence 0 - 1, default $CONFIDENCE
  -t,--threshold INT     langid volume threshold 0 - 100, default $THRESHOLD
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
    --host)
      shift 1
      checkarg "--host" $1
      HOST=$1
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

##### main

cd $(dirname "$0")

echo "===== intelligent text label server ====="
date
if [ "$VERBOSE" != "" ] ; then
  echo "host:       $HOST"
  echo "inputdev:   $INPUTDEV"
  echo "inputchan:  $INPUTCHAN"
  echo "confidence: $CONFIDENCE"
  echo "threshold:  $THRESHOLD"
  echo "verbose:    true"
fi

# start baton
echo "===== baton"
$BATON --wshost $HOST &
sleep 1
BATON_PID=$(getpid baton.py)
if [ "$VERBOSE" != "" ] ; then
  echo "baton: $BATON_PID"
fi

# start controller
echo "===== controller"
$CTLR --recvaddr $HOST $VERBOSE &
sleep 1
CTLR_PID=$(getpid controller.py)
if [ "$VERBOSE" != "" ] ; then
  echo "controller: $CTLR_PID"
fi

# run langid & wait
echo "===== langid"
$LANGID --inputdev $INPUTDEV --inputchan $INPUTCHAN \
        -s "$HOST:5005" -c $CONFIDENCE -t $THRESHOLD \
        --nolisten --autostop -e `pwd`/scripts/sendlangs.sh

# stop
echo "===== stopping server"
kill -INT $CTLR_PID 2>/dev/null || true
kill -INT $BATON_PID 2>/dev/null || true
