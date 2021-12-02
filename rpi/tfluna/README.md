# Hardware/Serial ports (RX/TX pins)  
Raspberry Pi 3 <-> TFmini  

+5V <-> 5V(RED)  
GND <-> GND(BLACK)  
TXD0 <-> RX(WHITE)  
RXD0 <-> TX(GREEN)

_Note: RX/TX wires may be different colors._

![](media/pi%20tfluna%20wiring%20diagram.png)
  
Use `pinout` on the raspberry to see pinout 

### Installation and service start

```shell
./configPi.sh
./install.sh
reboot
```

### Removing the service
```shell
./remove_service.sh
```

### Testing

#### Using OSC 
Start the client as follows
```shell
python3 mini.py --port 8080 --destination 10.10.0.123 --epsilon 0.002 --interval 0.1 --max-distance 800
```

#### Using UDP
Start the client as follows
```shell
python3 mini.py --udp --port 54322 --destination 127.0.0.1 --epsilon 0.002 --interval 0.1 --max-distance 800
```

Start the test UDP server for receiving both UDP and OSC messages:
```shell
python3 tests/udpreceive.py
```
