AI-assited Museum Label
=======================

Auto-adaptive, AI-supported museum label with language identification

This code base has been developed by [ZKM | Hertz-Lab](https://zkm.de/en/about-the-zkm/organization/hertz-lab) as part of the project [»The Intelligent Museum«](#the-intelligent-museum). 

Please raise issues, ask questions, throw in ideas or submit code, as this repository is intended to be an open platform to collaboratively improve language identification.

Copyright (c) 2021 ZKM | Karlsruhe.  
Copyright (c) 2021 Paul Bethge.  
Copyright (c) 2021 Dan Wilcox.  

BSD Simplified License.

_The following are bare bone notes which will be updated soon._

Implementations
---------------

### LID digitial display system

Basic interaction:

1. visitor walks up to installation
2. installation prompts visitor to speak in their native language
3. visitor speaks and installation listens
4. installation shows which language it heard and adjusts digital info displays

Components:

* controller: installation logic controller OSC server
* LanguageIdentifier: live audio language identifier
* baton: OSC to websocket relay server
* web clients: digital info display, interaction prompt, etc

Communication overview:

~~~
LanguageIdentifier <-OSC-> controller -OSC-> baton <-websocket-> web clients
proximity -----------OSC-------^
~~~

Quick startup (on macOS):

~~~
cd ../digital-displays
loaf proximity &

./run.sh
~~~

Open webclient index.html files in a web browser.

The proximity loaf sketch is a proximity sensor simualtor which sends proximity sensor values (normalized 0-1) to the controller server.

Display
-------

Clone this repository to `~/` then set up automation...

### Autostart scripts

Run non-GUI script at user login using cron: `crontab -e`

~~~
@reboot /home/pi/script
~~~

Run GUI script using LXDE autostart:

~~~
mkdir -p ~/.config/lxsession/LXDE-pi
echo "@sh /home/pi/script" > ~/.config/lxsession/LXDE-pi/autostart
~~~

Run script in lxterminal via XDG desktop entry:

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

Server
------

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
