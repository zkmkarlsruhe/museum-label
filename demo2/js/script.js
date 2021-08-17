// ref: https://github.com/colinbdclark/osc.js/

//document.getElementById("detected").style.display = "none"

// OSC

var oscPort = new osc.WebSocketPort({
	url: "ws://localhost:8081",
	metadata: true
})

oscPort.on("message", function (message) {
	console.log("received osc: ", message)
	if (message.address == "/detecting") {
		if (message.args[0].value == 0) {
		}
		else {
		}
	}
	else if (message.address == "/lang") {
		loadAndSet(message.args[0].value);
	}
})

oscPort.open()
