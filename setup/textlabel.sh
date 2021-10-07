#! /bin/sh

##### variables

CHROME=/usr/bin/chromium-browser

HOST=10.10.0.137
DIR=digital-displays/textlabel
URL=http://${HOST}/${DIR}/?host=${HOST}

##### parse command line arguments
USAGE="$(basename $0) [OPTIONS] COMMAND"
HELP="USAGE: $USAGE

  control digital text label in web browser

Options:
  -h,--help              display this help message

Commands:
  start                  start digital text label
  stop                   stop digital text label
"

while [ "$1" != "" ] ; do
  case $1 in
    -h|--help)
      echo "$HELP"
      exit 0
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
    $CHROME --kiosk --noerrdialogs --disable-restore-session-state $URL
    ;;
  stop)
    ;;
esac

