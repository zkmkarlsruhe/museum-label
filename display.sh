#! /bin/sh
#
# RPI Linux run script to start display client-side system,
# quit sensor script to shut everything down
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

LABEL=./textlabel.sh
SENSOR=tfluna/tfluna

# osc and websocket
HOST=127.0.0.1
PORT=5005
WSPORT=8081

# sensor
SENSOR_DEV=
VERBOSE=

# platform specifics
case "$(uname -s)" in
  Linux*)
    PLATFORM=linux
    SENSOR_DEV=/dev/ttyAMA1
    ;;
  Darwin*)
    PLATFORM=darwin
    # open tfluna usb adapter on first tty.usbserial-###
    SENSOR_DEV=$(ls /dev/tty.usbserial-* | head -n 1)
    ;;
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
  $LABEL stop
}

##### parse command line arguments

HELP="USAGE: $(basename $0) [OPTIONS] [ARGS]

  run to museum label client-side sensor and display,
  quit chromium to shut everything down

Options:
  -h,--help         display this help message
  --host STR        osc and websocket host address
                    ie. ws://####:8081, default: $HOST
  --wsport INT      websocket host port
                    ie. ws://localhost:####, default: $WSPORT
  --port INT        osc host port, default: $PORT
  -v,--verbose      enable verbose sensor printing

Arguments:
  Additional arguments are passed to the tfluna sensor script
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
    --port)
      shift 1
      checkarg "--port" $1
      PORT=$1
      ;;
    --wsport)
      shift 1
      checkarg "--wsport" $1
      WSPORT=$1
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

echo "===== museum label display ====="
date
if [ "$VERBOSE" != "" ] ; then
  echo "host:    $HOST"
  echo "port:    $PORT"
  echo "wsport:  $WSPORT"
  echo "verbose: $VERBOSE"
  echo "sensor args $@ "
fi

# run label in browser
echo "===== label"
$LABEL --host $HOST --port $WSPORT start &

# run sensor & wait
echo "===== sensor"
SENSOR_PID=$(getpid tfluna.py)
if [ "$SENSOR_PID" != "" ] ; then
  echo "killing previous process: $SENSOR_PID"
  kill -INT $SENSOR_PID 2>/dev/null || true
  SENSOR_PID=
  sleep 1
fi
$SENSOR $VERBOSE --max-distance 250 -e 1 -d $HOST -p $PORT --message "/proximity" -n $@ $SENSOR_DEV

# stop
echo "===== stopping display"
$LABEL stop
sleep 1
