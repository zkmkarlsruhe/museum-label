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
WEBSERVER=./webserver.py

# LanguageIdentifier
CONFIDENCE=0.5
THRESHOLD=10
INPUTDEV=
INPUTCHAN=1

# osc and websocket host address
HOST=127.0.0.1
WSPORT=8081

# controller
VERBOSE=
TBFLAGS=

# webserver
NOWEBSERVER=false

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

handle_sigint() {
  killall LanguageIdentifier 2>/dev/null || true
}

##### parse command line arguments

HELP="USAGE: $(basename $0) [OPTIONS]

  run museum label server-side language identification & logic,
  quit LanguageIdentifier app to shut everything down

Options:
  -h,--help              display this help message
  --host STR             controller osc and websocket host address
                         ie. ws://####:8081, default: $HOST
  --wsport INT           websocket host port
                         ie. ws://localhost:####, default: $WSPORT
  -l,--list              list audio input devices and exit
  --inputdev INT         audio input device number, default $INPUTDEV
  --inputchan INT        audio input device channel, default $INPUTCHAN
  -c,--confidence FLOAT  langid min confidence 0 - 1, default $CONFIDENCE
  -t,--threshold INT     langid volume threshold 0 - 100, default $THRESHOLD
  --tb-url               optional ThingsBoard url for sensor event sending
  --tb-message           optional ThingsBoard message for sensor event sending
  --no-webserver         run without local python webserver
  -v,--verbose           enable verbose controller printing
"

while [ "$1" != "" ] ; do
  case $1 in
    -h|--help)
      echo "$HELP"
      exit 0
      ;;
    --host)
      shift 1
      checkarg "--host" $1
      HOST=$1
      ;;
    --wsport)
      shift 1
      checkarg "--wsport" $1
      WSPORT=$1
      ;;
    -l|--list)
      $LANGID -l
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
    --tb-url)
      shift 1
      checkarg "--tb-url" $1
      TBFLAGS="$TBFLAGS --tb-url $1"
      ;;
    --tb-message)
      shift 1
      checkarg "--tb-message" $1
      TBFLAGS="$TBFLAGS --tb-message $1"
      ;;
    --no-webserver)
      NOWEBSERVER=true
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

trap "handle_sigint" INT

cd $(dirname "$0")

echo "===== museum label server ====="
date
if [ "$VERBOSE" != "" ] ; then
  echo "host:       $HOST"
  echo "wsport:     $WSPORT"
  echo "inputdev:   $INPUTDEV"
  echo "inputchan:  $INPUTCHAN"
  echo "confidence: $CONFIDENCE"
  echo "threshold:  $THRESHOLD"
  echo "tb flags:   $TBFLAGS"
  echo "no server:  $NOWEBSERVER"
  echo "verbose:    true"
fi

# leave empty for default device
if [ "$INPUTDEV" != "" ] ; then
  INPUTDEV="--inputdev $INPUTDEV"
fi

# start webserver
if [ $NOWEBSERVER = false ] ; then
  echo "===== webserver"
  WEBSERVER_PID=$(getpid webserver.py)
  if [ "$WEBSERVER_PID" != "" ] ; then
    echo "killing previous process: $WEBSERVER_PID"
    kill -INT $WEBSERVER_PID 2>/dev/null || true
    WEBSERVER_PID=
    sleep 1
  fi
  $WEBSERVER &
  sleep 1
  WEBSERVER_PID=$(getpid webserver.py)
  if [ "$VERBOSE" != "" ] ; then
    echo "webserver: $WEBSERVER_PID"
  fi
fi

# start baton
echo "===== baton"
BATON_PID=$(getpid baton.py)
if [ "$BATON_PID" != "" ] ; then
  echo "killing previous process: $BATON_PID"
  kill -INT $BATON_PID 2>/dev/null || true
  BATON_PID=
  sleep 1
fi
$BATON --wshost $HOST --wsport $WSPORT &
sleep 2
BATON_PID=$(getpid baton.py)
if [ "$VERBOSE" != "" ] ; then
  echo "baton: $BATON_PID"
fi

# start controller
echo "===== controller"
CTLR_PID=$(getpid controller.py)
if [ "$CTLR_PID" != "" ] ; then
  echo "killing previous process: $CTLR_PID"
  kill -INT $CTLR_PID 2>/dev/null || true
  CTLR_PID=
  sleep 1
fi
$CTLR --recvaddr $HOST $VERBOSE $TBFLAGS &
sleep 2
CTLR_PID=$(getpid controller.py)
if [ "$VERBOSE" != "" ] ; then
  echo "controller: $CTLR_PID"
fi

# run langid & wait
echo "===== langid"
$LANGID $INPUTDEV --inputchan $INPUTCHAN \
        -s "$HOST:5005" -c $CONFIDENCE -t $THRESHOLD \
        --nolisten --autostop -e `pwd`/scripts/sendlangs.sh

# stop
echo "===== stopping server"
kill $CTLR_PID 2>/dev/null || true
kill $BATON_PID 2>/dev/null || true
if [ $NOWEBSERVER = false ] ; then
  kill $WEBSERVER_PID 2>/dev/null || true
fi
sleep 1
