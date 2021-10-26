#! /bin/bash
USER=hertzpi

# give $USER the power
sudo adduser $USER pi
sudo adduser $USER adm
sudo adduser $USER dialout
sudo adduser $USER cdrom
sudo adduser $USER sudo
sudo adduser $USER audio
sudo adduser $USER video
sudo adduser $USER plugdev
sudo adduser $USER games
sudo adduser $USER users
sudo adduser $USER netdev
sudo adduser $USER input
sudo adduser $USER spi
sudo adduser $USER i2c
sudo adduser $USER gpio

# install deps
sudo apt-get install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox xterm -y
sudo apt-get install chromium-browser htop -y

# copy files
sudo cp ./pi-files/openbox.conf /etc/xdg/openbox/autostart
sudo cp ./pi-files/sudoers.conf /etc/sudoers.d/10-display-client
sudo cp ./pi-files/boot-config.txt /boot/config.txt

# enable xautostart
echo "[[ -z \$DISPLAY && \$XDG_VTNR -eq 1 ]] && startx -- " >> /home/$USER/.bash_profile
