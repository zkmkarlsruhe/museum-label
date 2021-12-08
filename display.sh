#! /bin/sh
#
# RPI Linux run script to start display client-side system,
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

LABEL=rpi/textlabel.sh
SENSOR=rpi/tfluna/tfluna

# osc and websocket
HOST=localhost
PORT=5005
WSPORT=8081

# sensor
SENSOR_DEV=/dev/ttyAMA1
VERBOSE=""

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
  # pidof doesn't seem to return pids of python scripts by name
  echo $(ps ax | grep "$1" | grep -wv grep | tr -s ' ' | cut -d ' ' -f2)
}

##### parse command line arguments

HELP="USAGE: $(basename $0) [OPTIONS]

  run to client-side sensor and display,
  quit Chromium to shut everything down

Options:
  -h,--help         display this help message
  --host STR        osc and websocket host address
                    ie. ws://####:8081, default: $HOST
  --wsport INT      websocket host port
                    ie. ws://localhost:####, default: $WSPORT
  --port INT        osc host port, default: $PORT
  -v,--verbose      enable verbose sensor printing
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

echo "host:    $HOST"
echo "port:    $PORT"
echo "wsport:  $WSPORT"
echo "verbose: $VERBOSE"

##### main

cd $(dirname $0)

# start sensor
$SENSOR $VERBOSE --max-distance 250 -e 1 -d $HOST -p $PORT --message /proximity -n $SENSOR_DEV &
sleep 1
SENSOR_PID=$(getpid mini.py)
echo "sensor: $SENSOR_PID"

# run label & wait
$LABEL --host $HOST --port $WSPORT start

# stop, no -INT as script doesn't currently handle INT signal
kill $SENSOR_PID 2>/dev/null || true

