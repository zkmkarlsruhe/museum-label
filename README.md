AI-assisted Museum Label
========================

Auto-adaptive, AI-supported museum label with language identification

This code base has been developed by [ZKM | Hertz-Lab](https://zkm.de/en/about-the-zkm/organization/hertz-lab) as part of the project [»The Intelligent Museum«](#the-intelligent-museum). 

Please raise issues, ask questions, throw in ideas or submit code, as this repository is intended to be an open platform to collaboratively improve language identification.

Copyright (c) 2021 ZKM | Karlsruhe.  
Copyright (c) 2021 Paul Bethge.  
Copyright (c) 2021 Dan Wilcox.  

BSD Simplified License.

Overview
--------

Basic interaction:

1. Visitor walks up to installation & stands in front of text label
2. Text label prompts visitor to speak in their native language
3. Visitor speaks and text label listens
4. Installation shows which language it heard and adjusts digital info displays
5. Repeat steps 3 & 4

Components:

* Server
  - controller: installation logic controller OSC server
  - LanguageIdentifier: live audio language identifier
  - baton: OSC to websocket relay server
* Display
  - web clients: digital info display, interaction prompt, etc
  - tfluna: sensor read script which sends events over OSC

Communication overview:

~~~
LanguageIdentifier <-OSC-> controller -OSC-> baton <-websocket-> web clients
tfluna --------------OSC-------^
proximity -----------OSC-------^
~~~

![system diagram](doc/system%20diagram.pdf)

Quick Start
-----------

Quick server startup for testing on macOS:

* Clone this repo
* Build LanguageIdentifier, see `LanguageIdentifier/README.md`
* Install server dependencies:
~~~
cd ../museum-label
make server
~~~
* Start server:
~~~
./server.sh
~~~

### With TF-Luna Sensor

If the TF-Luna sensor and USB serial port adapter are available, the display component can be run directly to start the sensor and open webclient in the browser:
~~~
./display.sh
~~~

See `tfluna/README.md` for additional details.

### Without TF-Luna Sensor

If the TF-Luna sensor is not available, the system can be given simulated sensor events.

The proximity loaf sketch is a proximity sensor simulator which sends proximity sensor values (normalized 0-1) to the controller server. 

* Install [loaf](http://danomatika.com/code/loaf)
* Start loaf.app and drag `proximity/main.lua` onto the loaf window

Open webclient index.html files in a web browser. You may need to disable your local browser file restrictions to load all files.

Dependencies
------------

General dependency overview:

* Python 3 & various libaries
* openFrameworks

See README.md files for the individual components for details.

Display
-------

The display component runs the proximity sensor and acts as the front end for the museum label.

_The default system is a Raspberry Pi but the display can also be run on macOS with the TF-Luna sensor connected via a USB serial port adapter._

Available html front-ends are located in the `html` directory:

* demo0: very basic depected language display
* demo1: displays a greeting in the detected language
* demo2: displays example museum label text in the detected language
* prompt: interaction logic prompt, ie. "Please speak in your native language."
* textlabel: integrated prompt and museum label (current prototype)

Setting up a Raspberry Pi 4...

### Initial OS Setup

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

### Install

#### System

~~~
sudo apt install vim
~~~

#### museum-label

Clone this repository to `~/`:

~~~
cd ~/
git clone https://git.zkm.de/Hertz-Lab/Research/intelligent-museum/museum-label.git
~~~

#### TF-Luna

Prepare script dependencies:

~~~
cd museum-label
make display
~~~

### Setup

#### Enable serial for TF-Luna

See Setup section in `tfluna/README.md`.

#### Autostart scripts


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

#### Enable Screen Sharing

Enable the VNC server on the RPI for remote management:

https://www.jimbobbennett.io/screen-sharing-a-raspberry-pi-from-a-mac/

Server
------

The server component runs the language identification from audio input, the logic controller, and web components.

_The default system is currently macOS but should work in Linux as well._

Setting up macOS on a Mac mini...

### Apache

macOS 11 deprecates Apache and it will be removed in future OS versions, so we install from Homebrew

* https://getgrav.org/blog/macos-bigsur-apache-multiple-php-ver
* https://wpbeaches.com/installing-configuring-apache-on-macos-using-homebrew/

First, unload built-in Apache just in case:

~~~
sudo launchctl unload -w /System/Library/LaunchDaemons/org.apache.httpd.plist
~~~

#### Install

_Assumes user account is "intelligentmuseum"._

Install:
~~~
brew install httpd
~~~

Edit `/usr/local/etc/httpd/httpd.conf` and change:

~~~
Listen 80
~~~

uncomment:

~~~
LoadModule rewrite_module libexec/apache2/mod_rewrite.so
~~~

change the user & group:

~~~
User intelligentmuseum
Group staff
~~~

and add:

~~~
ServerName localhost
~~~

and change the server document directory:

~~~
DocumentRoot "/Users/intelligentmuseum/Sites"
<Directory "/Users/intelligentmuseum/Sites">
...
    AllowOverride All
~~~

uncomment:

~~~
# Fancy directory listings
Include /opt/homebrew/etc/httpd/extra/httpd-autoindex.conf
~~~

and add the following to the end:

~~~
# Fancy Indexing
<IfModule mod_autoindex.c>
IndexOptions FancyIndexing IconHeight=24 IconWidth=24
</IfModule>
~~~

Last, make user `Sites` directory for webserver root:

    mkdir -p ~/Sites

### Apache control

Starting:

    brew services start httpd

Stopping:

    brew services stop httpd

Restart apache after making any changes:

    brew services restart httpd

Scripts & Automation
--------------------

Main scripts wrap starting the display or server:

* display.sh: starts sensor sender and chromium
* server.sh: starts websocket relay, logic controller, and language identifier

### Run

Two scripts automate starting each system in a loop to handle crashes:

* scripts/rundisplay: runs display.sh in a loop
* scripts/runserver: runs server.sh in a loop
* scripts/killdisplay: kills the main display script
* scripts/killserver: kills the main server script

### Cron

Two simple cronjobs can be enabled to start & stop each system using the run scripts.

For example, add following to `crontab -e` if this repo is cloned to the Desktop of the "intelligentmuseum" user on macOS:

~~~
# key
# min hour day month dayofweek

# start at 9 am
0 9 * * * /Users/intelligentmuseum/Desktop/museum-label/scripts/runserver
# stop at 2 am
0 2 * * * /Users/intelligentmuseum/Desktop/museum-label/scripts/killserver
~~~

Optionally, to be safe and restart everything at midnight, add the following to crontab via `crontab -e`:

~~~
@daily root /sbin/reboot
~~~
