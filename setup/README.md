# 7" Smart Display Setup

This is a small guide of how to setup the smart display. Applications that run on the Pi can be installed by following the guides in the subfolders, e.g. sending distance measures with the TF Luna sensor over UDP. 

## Hardware requirements
1. Raspberry Pi 3
2. Power: 5V mini USB with 3 Ampere output
3. SD Card Reader
4. 32 GB SD card
5. Display
6. keyboard
7. mouse

### Basic Raspberry Pi OS Setup

We have created a base image which includes the instructions from [Custom Pi OS](#Custom-PI-OS).

1. Download the [base image](https://cloud.zkm.de/index.php/f/31946774)

2. install the image
      - Option 1: get [Raspberry Pi Imager](https://www.raspberrypi.org/software/)
      - Option 2: 
        ```shell
        sudo fdisk -l
        sudo dd if=YOUR/RASPBERRY.img of=/dev/SOMEdiskPARTION
        ```

#### Custom Pi OS
download the image from [the original site](https://www.raspberrypi.org/software/operating-systems/#raspberry-pi-os-32-bit). Did not test the Lite image yet, but may work very well.

0. insert SD card and follow instructions (keyboard, WLAN, updates, ...)

1. add user with pw: lidR0x

      ```shell
      sudo adduser hertzpi
      sudo adduser hertzpi sudo
      ```
      login as that user
      ```shell
      su - hertzpi
      ```
2. boot Options
      ```shell
      sudo raspi-config 
      ```
      choose: 1 -> S5 -> B1 or B2
3. clone this repository
      ```shell
      git clone https://git.zkm.de/Hertz-Lab/Research/intelligent-museum/digital-displays.git
      cd display-client/setup
      ```
4. user setup
      ```shell
      sudo pi-setup.sh
      ```
      __note__: you can change the user in the script!
4. reboot


#### Saving the image
```shell
sudo fdisk -l
sudo dd bs=4M if=/dev/SOMEdiskPARTION | gzip > baseRPI-`date +%d%m%y`.img.gz
```