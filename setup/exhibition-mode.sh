#! /bin/sh

# autostart
AUTOSTARTFILE="/etc/xdg/lxsession/LXDE-pi/autostart"

## add start script
STARTCMD="$(dirname $0)/textlabel.sh start"

##TODO check if $CHROME is already present

echo $STARTCMD | sudo tee -a $AUTOSTARTFILE

