Mac Setup
=========

Setting up macOS on a Mac mini to run the museum-label server component.

_Setting up Apache is suggested for production environments. For testing, the local Python webserver is sufficient._

Apache
------

macOS 11 deprecates Apache and it will be removed in future OS versions, so we install from Homebrew

* https://getgrav.org/blog/macos-bigsur-apache-multiple-php-ver
* https://wpbeaches.com/installing-configuring-apache-on-macos-using-homebrew/

First, unload built-in Apache just in case:

~~~
sudo launchctl unload -w /System/Library/LaunchDaemons/org.apache.httpd.plist
~~~

### Install

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

Apache control
--------------

Starting:

    brew services start httpd

Stopping:

    brew services stop httpd

Restart apache after making any changes:

    brew services restart httpd

To check config file for errors:

    apachectl configtest

Apache errors
-------------

If Apache doesn't seem to be running and the following error ocurrs starting it:

~~~
Error: Failure while executing; `/bin/launchctl bootstrap gui/502 /Users/intelligentmuseum/Library/LaunchAgents/homebrew.mxcl.httpd.plist` exited with 5.
~~~

Try making sure the default Apache installed with macOS is not running:
~~~
brew services stop httpd
sudo apachectl -k stop
brew services start httpd
~~~

Reference: https://stackoverflow.com/a/71664267
