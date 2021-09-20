// ref: https://github.com/colinbdclark/osc.js/

let greeting = ["...", "你好", "Hello", "Bonjour", "Guten Tag", "Ciao", "Здравствуйте", "Hola"]

// use localhost when only connecting internally
let host = "localhost"

// use the server machine's IP address when connecting external devices
//let host = "10.10.0.159"

// OSC

var oscPort = new osc.WebSocketPort({
    url: "ws://"+host+":8081",
    metadata: true
})

oscPort.on("message", function (message) {
    console.log("received osc: ", message)
   	if(message.address == "/detecting") {
   		if(message.args[0].value == 0) {
   			document.getElementById("detecting").style.display = "none"
   		}
   		else {
   			document.getElementById("detecting").style.display = "inline"
   		}
   	}
   	else if(message.address == "/lang") {
   		document.getElementById("greeting").innerHTML = greeting[message.args[0].value]
   	}
})

oscPort.open()
