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
WEBPORT=8080
WSPORT=8081
DIR=museum-label/textlabel

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

##### parse command line arguments

USAGE="$(basename $0) [OPTIONS] COMMAND [CLIENT]"
HELP="USAGE: $USAGE

  run digital textlabel in chromium on Linux or default browser on macOS,
  assumes webserver and websocket are running on the same host

Options:
  -h,--help       display this help message
  --host STR      webserver and websocket host address
                  ie. ws://####:8081 default: $HOST
  --webport INT   webserver port
                  ie. http://localhost:###, default: $WEBPORT
  --wsport INT    websocket host port
                  ie. ws://localhost:####, default: $WSPORT

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
    --webport)
      shift 1
      checkarg "--webport" $1
      WEBPORT=$1
      ;;
    --wsport)
      shift 1
      checkarg "--wsport" $1
      WSPORT=$1
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

URL=http://${HOST}:${WEBPORT}/${DIR}/?host=${HOST}:${WSPORT}

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
