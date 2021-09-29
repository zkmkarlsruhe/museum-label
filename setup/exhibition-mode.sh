#!/bin/bash

# autostart
AUTOSTARTFILE="/etc/xdg/lxsession/LXDE-pi/autostart"

## add chrome
CHROME="/usr/bin/chromium-browser "
CHROMEPARAMS=" --kiosk  --disable-restore-session-state http://10.10.0.123:8081"
##TODO check if $CHROME is already present
echo $CHROME $CHROMEPARAMS | sudo tee -a $AUTOSTARTFILE
