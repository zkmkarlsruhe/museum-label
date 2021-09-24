#!/bin/bash
path=$(dirname $(realpath $0))
cd $path 
homedir=$(eval echo ~$(whoami))
user=$(whoami)

sudo systemctl mask serial-getty@ttyAMA0.service # https://raspberrypi.stackexchange.com/a/48258 

sudo adduser $user dialout
sudo apt update && sudo apt upgrade -y
sudo apt install python-pip -y
pip install -r requirements.txt

sudo rm /etc/systemd/system/tfmini.service
sudo systemctl daemon-reload
cp tfmini.service.default tfmini.service
sed -i s/pi/$user/g tfmini.service

sudo ln -s $path/tfmini.service /etc/systemd/system/
sudo systemctl enable tfmini
sudo systemctl start tfmini
