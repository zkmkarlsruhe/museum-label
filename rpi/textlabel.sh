#! /bin/sh
#
# open digital textlabel in chromium browser
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

##### variables

CHROME=/usr/bin/chromium-browser

HOST=localhost
PORT=8081
DIR=digital-displays/textlabel

##### parse command line arguments

USAGE="$(basename $0) [OPTIONS] COMMAND"
HELP="USAGE: $USAGE

  control digital textlabel in chromium browser

Options:
  -h,--help    display this help message
  --host       websocket host ie. ws://####:8081 default: localhost
  --port       websocket port ie. ws://localhost:####, default: 8081

Commands:
  start        start digital text label
  stop         stop digital text label
"

while [ "$1" != "" ] ; do
  case $1 in
    -h|--help)
      echo "$HELP"
      exit 0
      ;;
    --host)
      shift 1
      HOST="$1"
      ;;
    --port)
      shift 1
      if [ $1 -lt 1024 ] ; then
        echo "invalid port, must be <= 1024"
        exit 1
      fi
      PORT="$1"
      ;;
    *)
      break
      ;;
  esac
  shift 1
done

CMD=$1
if [ "$CMD" = "" ] ; then
  echo "$USAGE"
  echo "command required"
  exit 1
fi

##### main

case $CMD in
  start)
    URL=http://${HOST}/${DIR}/?host=${HOST}
    echo "opening $URL"
    $CHROME --kiosk --noerrdialogs --disable-restore-session-state $URL
    ;;
  stop)
    pkill -o chromium
    ;;
esac
