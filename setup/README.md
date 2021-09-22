## Hardware requirements
1. Power: 5V mini USB with 3 Ampere output
2. SD Card Reader
3. keyboard
4. mouse

### Basic Raspberry PI OS Setup

1. download the image from [the original site](https://www.raspberrypi.org/software/operating-systems/#raspberry-pi-os-32-bit)

2. install the image
      - Option 1: get raspberry pi imager
      - Option 2: 
        ```shell
        sudo fdisk -l
        sudo dd if=YOUR/RASBERRY.img of=/dev/SOMEdiskPARTION
        ```

3. first check
      - Insert SD CARD
      - power on
      - follow instructions (keyboard, WLAN, updates, ...)
      - reboot and check again

### Custom PI OS

1. add user with pw: lidR0x
      ```shell
      sudo adduser hertzpi
      sudo adduser hertzpi sudo
      ```
      ```shell
      su - hertzpi
      ```
2. boot Options
      ```shell
      sudo raspi-config 
      ```
      choose: 1 -> S5 -> B1 or B2
3. repository
      ```shell
      git clone #REPO#
      cd display-client/setup
      sudo pi-setup.sh
      ```
