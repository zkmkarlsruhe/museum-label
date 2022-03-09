#! /bin/sh
#
# open digital textlabel in chromium on Linux or default browser on macOS
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
DIR=museum-label/textlabel

# platform specifics
case "$(uname -s)" in
  Linux*)  PLATFORM=linux   ;;
  Darwin*) PLATFORM=darwin  ;;
  CYGWIN*) PLATFORM=windows ;;
  MINGW*)  PLATFORM=windows ;;
  *)       PLATFORM=unknown ;;
esac

##### parse command line arguments

USAGE="$(basename $0) [OPTIONS] COMMAND"
HELP="USAGE: $USAGE

  run digital textlabel in chromium on Linux or default browser on macOS

Options:
  -h,--help    display this help message
  --host       websocket host ie. ws://####:8081 default: localhost
  --port       websocket port ie. ws://localhost:####, default: 8081

Commands:
  start        start digital text label
  stop         stop digital text label
  status       returns 0 if chromium is running or 1 if not:
               textlabel.sh status && echo \"running\"
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

URL=http://${HOST}/${DIR}/?host=${HOST}

if [ $PLATFORM = darwin ] ; then
  # open in default browser on macOS
  case $CMD in
    start)
      open $URL
      ;;
    stop)
      ;;
    status)
      exit 0
      ;;
  esac
else
  # open in Chromium on Linux
  case $CMD in
    start)
      $CHROME --kiosk --noerrdialogs --disable-restore-session-state --use-gl=egl \
              $URL 2> /dev/null
      ;;
    stop)
      pkill -o chromium
      ;;
    status)
      if pgrep chromium >/dev/null ; then exit 0 ; fi
      exit 1
      ;;
  esac
fi
