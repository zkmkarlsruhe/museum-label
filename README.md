Digitalized Museum Information
==============================

With this prototype we want to digitize the information flow for the visitors using simple displays.
There are a lot of use cases for such displays.

Use Cases
---------

* smart, multi-lingual exhibit information: make exhibit information accesible in most common languages.
* general information: inform about upcoming events or display a heatmap of the current visitor flow
* simple text: make information more available by translating them into simple text

### Low Level Decisions

* Those Peripheral Displays (PD) require a wireless, low-bandwidth, secure communication protocol.
* To keep things as modular as possible the PDs should not have any logic. 
* PDs should act as consumers with a one-sided connection.
* They are controlled by a producer that determines which text to display.

### People we miss out on

* people with seeing disabilities
* people who can not read

Implementations
---------------

### LID digitial display system

_These are bare bone notes which will be updated soon._

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
