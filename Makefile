# basic setup makefile for now
.PHONY: all server display clean

all: server display

server:
	make -C baton
	make -C controller

display:
	make -C tfluna

clean:
	make -C baton clean
	make -C controller clean
	make -C tfluna clean
