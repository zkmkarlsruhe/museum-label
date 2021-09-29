#!/bin/bash
path=$(dirname $(realpath $0))
apppath=$path/mini.py
cd $path 
homedir=$(eval echo ~$(whoami))
user=$(whoami)

# https://raspberrypi.stackexchange.com/a/48258 
sudo systemctl mask serial-getty@ttyAMA0.service 
sudo adduser $user dialout

# install requirements
sudo apt update && sudo apt upgrade -y
sudo apt install python-pip -y
pip3 install -r requirements.txt

# remove any existing tfmini service and restart daemon
./remove_service.sh

# fill in the service template with user and path
cp tfmini.service.default tfmini.service
sed -i s?'USER'?$user? tfmini.service
sed -i s?'PATH'?$apppath? tfmini.service

# create a symbolic link and start the service
sudo ln -s $path/tfmini.service /etc/systemd/system/
sudo systemctl enable tfmini
sudo systemctl start tfmini
sudo service tfmini status