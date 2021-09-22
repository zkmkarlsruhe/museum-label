## Hardware requirements
1. Power: 5V mini USB with 3 Ampere output

### install Raspberry PI OS

1. download the image from [the original site](https://www.raspberrypi.org/software/operating-systems/#raspberry-pi-os-32-bit)

2. install the image
- Option 1: get raspberry pi imager
- Option 2: 
  ```shell
  sudo fdisk -l
  sudo dd if=YOUR/RASBERRY.img of=/dev/SOMEdiskPARTION
  ```

3. Setup PI OS
- Insert SD CARD
- power on
- follow instructions (password, WLAN, updates, ...)
- reboot and check

4. More setup stuff
* sudo raspi-config
    * change default password
    * change keyboard layout
    * enable ssh
* sudo apt update & sudo apt upgrade
* sudo apt install curl git
* sudo adduser hertzpi
* sudo adduser hertzpi sudo
* change to user hertzpi
* git clone #REPO#
* sudo raspi-config -> Boot Options -> B1 -> B2
* cd display-client
* sudo pi-setup.sh
