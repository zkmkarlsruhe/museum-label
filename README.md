# Digitalized Museum Information 
With this prototype we want to digitalize the information flow for the visitors using simple displays.
There are a lot of use cases for such displays.

### Use Cases
- smart, multi-lingual exhibit information: make exhibit information accesible in most common languages.
- general information: inform about upcoming events or display a heatmap of the current visitor flow

### Low Level Decisions
- Those Peripheral Displays (PD) require a wireless, low-bandwidth, secure communication protocol.
- To keep things as modular as possible the PDs should not have any logic. 
- PDs should act as consumers with a one-sided connection.
- They are controlled by a producer that determines which text to display.

#### People we miss out on
- people with seeing disabilities
- people who can not read


### Other 
Christian has already started working on this. Get the hardware and make some basic tests.