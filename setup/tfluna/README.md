# Hardware/Serial ports (RX/TX pins)  
Connection is as follows:  

Raspberry Pi 3 <-> TFmini  

+5V <-> 5V(RED)  
GND <-> GND(BLACK)  
TXD0 <-> RX(WHITE)  
RXD0 <-> TX(GREEN)

![](media/luna.png)
  
Use ``` pinout ``` on the raspberry to see pinout :) # only avaliable with python-gpio installed

# Software
```shell
./configPi.sh
./install.sh
reboot
```

###
```
TF Luna Lidar sensor

optional arguments:  
  -h, --help            
		show this help message and exit  
  -i INTERVAL, --interval INTERVAL                      
		interval in seconds (default: 0.1 sec)  
  -d HOST, --destination HOST  
                destination hostname or IP  
  -p PORT, --port PORT   
		destination port to send to  
```
