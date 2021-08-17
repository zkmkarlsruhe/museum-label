# 7 Zoll Display #

### PI Set-up ###

Prepare SD Card:

* sudo dd if=raspbian-stretch-lite.img of=/dev/mmcblk0

Prepare PI:

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

# Digitalized Museum Information

With this prototype we want to digitalize the information flow for the visitors using simple displays.
There are a lot of use cases for such displays.

### Use Cases

- smart, multi-lingual exhibit information: make exhibit information accesible in most common languages.
- general information: inform about upcoming events or display a heatmap of the current visitor flow
- simple text: make information more available by translating them into simple text

### Low Level Decisions

- Those Peripheral Displays (PD) require a wireless, low-bandwidth, secure communication protocol.
- To keep things as modular as possible the PDs should not have any logic. 
- PDs should act as consumers with a one-sided connection.
- They are controlled by a producer that determines which text to display.

#### People we miss out on

- people with seeing disabilities
- people who can not read
