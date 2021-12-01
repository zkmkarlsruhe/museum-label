#! /bin/sh

DIR=$(dirname "$0")
SCRIPT="$PATH"/tfluna
SNAME=tfluna

cd $DIR

# https://raspberrypi.stackexchange.com/a/48258 
sudo systemctl mask serial-getty@ttyAMA0.service 
sudo adduser $USER dialout

# install requirements
sudo apt update && sudo apt upgrade -y
sudo apt install python-pip -y
pip3 install -r requirements.txt

# remove any existing tfluna service and restart daemon
./remove_service.sh

# fill in the service template with user and path
cp $SNAME.service.default $SNAME.service
sed -i s?'USER'?$USER? $SNAME.service
sed -i s?'PATH'?$SCRIPT? $SNAME.service

# create a symbolic link and start the service
sudo ln -s $DIR/$SNAME.service /etc/systemd/system/
sudo systemctl enable $SNAME
sudo systemctl start $SNAME
sudo service $SNAME status