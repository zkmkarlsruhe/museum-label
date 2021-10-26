#!/bin/bash

# grab the PARTUUID from the old cmdline.txt
PARTUUID=$(grep -E -o 'root=[^ ]*' /boot/cmdline.txt | head -1)" "
echo "PARTUUID: $PARTUUID"

# backup the old configs
DATE=$(date +%d-%m_%H-%M-%S)
sudo cp /boot/config.txt /boot/config.txt.$DATE.bak
sudo mv /boot/cmdline.txt /boot/cmdline.txt.$DATE.bak

# make sure settings are set 
isInFile=$(cat /boot/config.txt | grep -c "dtoverlay=pi3-miniuart-bt")
if [ $isInFile -eq 0 ]; then
   echo "dtoverlay=pi3-miniuart-bt" | sudo tee -a /boot/config.txt
fi
isInFile=$(cat /boot/config.txt | grep -c "dtoverlay=pi3-disable-bt")
if [ $isInFile -eq 0 ]; then
   echo "dtoverlay=pi3-disable-bt" | sudo tee -a /boot/config.txt
fi

# write to new cmdline.txt
echo "$PARTUUID rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait" | sudo tee /boot/cmdline.txt

echo "DO A REBOOT"
