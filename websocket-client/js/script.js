// ref: https://github.com/colinbdclark/osc.js/

//document.getElementById("detected").style.display = "none"

// OSC

var oscPort = new osc.WebSocketPort({
	url: "ws://10.10.0.159:8081",
	metadata: true
})

oscPort.on("message", function (message) {
	console.log("received osc: ", message)
	if(message.address == "/detecting") {
		if(message.args[0].value == 0) {
			document.getElementById("detected").style.display = "none"
		}
		else {
			document.getElementById("detected").style.display = "inline"
		}
	}
	else if(message.address == "/lang") {
		loadAndSet(message.args[0].value)
	}
})

oscPort.open()
