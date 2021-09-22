controller
==========

Language indentification displays logic controller.

This code base has been developed by [ZKM | Hertz-Lab](https://zkm.de/en/about-the-zkm/organization/hertz-lab) as part of the project [»The Intelligent Museum«](#the-intelligent-museum). 

Copyright (c) 2021 ZKM | Karlsruhe.  
Copyright (c) 2021 Dan Wilcox.  

BSD Simplified License.

Description
-----------

The LID display logic controller acts as an OSC (Open Sound Control) server which implements a state machine to control interaction.

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

Create a virtual environment and install the script's dependencies:

```shell
make
```

Running
-------

Next, start the server on the commandline via the virtual environment wrapper script:

    ./controller

It can simply sit in the background and automatically handles OSC communication with clients.

To stop the controller, use CTRL+C to issue an interrupt signal.

### Calling Python script directly

The Python script can be called directly without the wrapper script, but requires manually enabling or disabling the virtual environment:

Aactivate the virtual environment before the first run in a new commandline session:

    source venv-controller/bin/activate

Use:

    ./controller.py

When finished, deactivate the virtual environment with:

    deactivate
