controller
==========

Language indentification displays logic controller.

This code base has been developed by [ZKM | Hertz-Lab](https://zkm.de/en/about-the-zkm/organization/hertz-lab) as part of the project [»The Intelligent Museum«](#the-intelligent-museum). 

Copyright (c) 2021 ZKM | Karlsruhe.  
Copyright (c) 2021 Dan Wilcox.  

BSD Simplified License.

Description
-----------

The LID display logic controller acts as an OSC (Open Sound Control) server which implements a state machien to control interaction.  

Dependencies
------------

  * Python 3
  * [python-osc library](https://github.com/attwad/python-osc)

Setup
-----

Install Python 3, if not already available. For instance, on macOS using [Homebrew](http://brew.sh):

```shell
brew install python3
```

Create a virtual environment for the script's dependencies and activate it:

```shell
python3 -m venv venv-controller
source venv-controller/bin/activate
```

Install the dependent library via pip:

```shell
pip3 install python-osc
```

Running
-------

Make sure to activate the virtual environment before the first run in a new commandline session:

    source venv-controller/bin/activate

Next, start the controller on the commandline via:

    ./controller.py

It can simply sit in the background and automatically handles OSC communication with clients.

To stop the controller, use CTRL+C to issue an interrupt signal.

When finished, deactivate the virtual environment with:

    deactivate
