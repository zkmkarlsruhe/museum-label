#! /bin/sh

SNAME=tfluna

rm $SNAME.service

sudo systemctl stop $SNAME
sudo systemctl disable $SNAME

sudo rm /etc/systemd/system/$SNAME

sudo systemctl daemon-reload
sudo systemctl reset-failed