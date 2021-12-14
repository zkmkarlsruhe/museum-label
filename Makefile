# basic setup makefile for now
.PHONY: server display

server:
	make -C baton
	make -C controller

display:
	make -C rpi/tfluna
