#!/bin/bash

sudo cp /boot/config.txt /boot/config.txt.bak
sudo cp /boot/cmdline.txt /boot/cmdline.txt.bak

isInFile=$(cat /boot/config.txt | grep -c "dtoverlay=pi3-miniuart-bt")
if [ $isInFile -eq 0 ]; then
   echo "dtoverlay=pi3-miniuart-bt" | sudo tee -a /boot/config.txt
fi

isInFile=$(cat /boot/config.txt | grep -c "dtoverlay=pi3-disable-bt")
if [ $isInFile -eq 0 ]; then
   echo "dtoverlay=pi3-miniuart-bt" | sudo tee -a /boot/config.txt
fi


echo "dwc_otg.lpm_enable=0 root=PARTUUID=df073b0a-02 rootfstype=ext4 elevator=deadline fsck.repair=yes rootwait" | sudo tee /boot/cmdline.txt

echo "DO A REBOOT"
