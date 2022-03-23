Raspberry Pi Setup
==================

Setting up a Raspberry Pi 4 to run the museum-label display component

Initial OS Setup
----------------

_Assuming normal Raspberry Pi OS image._

Set Country

Country: United States  
Language: American English  
Timezone: Chicago?  

Default pi user password: PASSWORD

Attach network connection and update

Restart

Set actual timezone:

1. Open Pi menu->Preferences->Raspberry Pi Configuration
2. Select Localisation tab and press Set Timezone...
3. Choose Area: Europe, Location: Berlin

Install
-------

### System

~~~
sudo apt install vim
~~~

### museum-label

Clone this repository to `~/`:

~~~
cd ~/
git clone https://git.zkm.de/Hertz-Lab/Research/intelligent-museum/museum-label.git
~~~

### TF-Luna

Prepare script dependencies:

~~~
cd museum-label
make display
~~~

Setup
-----

### Enable serial for TF-Luna

See Setup section in `tfluna/README.md`.

### Autostart scripts

Run GUI script in lxterminal via XDG desktop entry:

~~~
mkdir -p ~/.config/autostart
touch ~/.config/autostart/museumlabel.desktop
~~~

add the following to `~/.config/autostart/museumlabel.desktop` which runs the `rundisplay` script after the user logs into LXDE:

~~~
[Desktop Entry]
Type=Application
Version=1.0
Name=IntelligentTextLabel
Exec=/usr/bin/lxterminal -e /home/pi/museum-label/scripts/rundisplay
Categories=Utilities
~~~

### Enable Screen Sharing

Enable the VNC server on the RPI for remote management:

https://www.jimbobbennett.io/screen-sharing-a-raspberry-pi-from-a-mac/
