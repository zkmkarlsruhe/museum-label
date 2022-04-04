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
WEBPORT=8080

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
check_arg() {
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

# get the pid by script name, ie. get_pid controller.py -> 16243
# $1 script or process name
get_pid() {
  if [ $PLATFORM = darwin ] ; then
    # pidof is not part of BSD and Darwin is BSD-based
    echo $(ps -ef | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f3)
  else
    # pidof doesn't seem to return pids of python scripts by name
    echo $(ps ax | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f1)
  fi
}

# kill process ids silently
# $@ process ids
kill_pids() {
  kill $@ 2>/dev/null || true
}

# kill script or process if already running
# $1 script or process name
# $2 verbose, set true to print when killing process
kill_prev() {
  local pid=$(get_pid $1)
  if [ "$pid" != "" ] ; then
    if [ $2 ] ; then
      echo "killing previous process: $pid"
    fi
    kill_pids $pid
    sleep 1
  fi
}

# called if script receives Ctrl-C
handle_sigint() {
  if [ "$SENSOR_PID" != "" ] ; then
    kill_pids $SENSOR_PID
  fi
}

##### parse command line arguments

HELP="USAGE: $(basename $0) [OPTIONS] [ARGS]

  run to museum label client-side sensor and display,
  quit script to shut everything down

Options:
  -h,--help       display this help message
  --host STR      osc and websocket host
                  ie. ws://####:8081, default: $HOST
  --port INT      osc port, default: $PORT
  --wsport INT    websocket port
                  ie. ws://localhost:####, default: $WSPORT
  --webport INT   webserver port
                  ie. http://localhost:####, default: $WEBPORT
  --no-sensor     run in loop without sensor
  -v,--verbose    enable verbose sensor printing

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
      check_arg "--host" $1
      HOST=$1
      ;;
    --port)
      shift 1
      check_arg "--port" $1
      PORT=$1
      ;;
    --wsport)
      shift 1
      check_arg "--wsport" $1
      WSPORT=$1
      ;;
    --webport)
      shift 1
      check_arg "--webport" $1
      WEBPORT=$1
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
  echo "sensor:  $SENSOR_DEV"
  echo "host:    $HOST"
  echo "port:    $PORT"
  echo "wsport:  $WSPORT"
  echo "webport: $WEBPORT"
  echo "verbose: $VERBOSE"
  echo "sensor args: $@ "
fi

# run label in browser
echo "===== label"
$LABEL --host $HOST --webport $WEBPORT --wsport $WSPORT start &

# run sensor & wait
if [ "$SENSOR_DEV" = "" ] || [ ! -e $SENSOR_DEV ] ; then
  echo "===== no sensor"
  echo "sensor not found, running loop"
  while true ; do
    sleep 1
  done
else
  echo "===== sensor"
  kill_prev tfluna.py true
  $SENSOR $VERBOSE --max-distance 250 -e 1 -d $HOST -p $PORT --message "/proximity" -n $@ $SENSOR_DEV
fi

# stop
echo "===== stopping display"
$LABEL stop
sleep 1
