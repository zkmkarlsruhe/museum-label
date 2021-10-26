/* Demo 1: Hello Lang
   Dan Wilcox ZKM | Hertz-Lab 2021 */

// ref: https://github.com/colinbdclark/osc.js/

let greeting = ["...", "你好", "Hello", "Bonjour", "Guten Tag", "Ciao", "Здравствуйте", "Hola"]

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

// ----- load -----

// parse url vars
let vars = getURLVars()
if("host" in vars) {
  host = vars.host
  console.log(`var host ${host}`)
}
if("port" in vars) {
  let n = parseInt(vars.port)
  if( n >= 1024) {
    port = n
    console.log(`var port ${port}`)
  }
}
vars = null

// page load
window.addEventListener("load", () => {
  oscPort.open()
})

// ----- OSC -----

var oscPort = new osc.WebSocketPort({
  url: "ws://"+host+":"+port,
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

// ----- util -----

// returns URL variables as key/value pairs:
// ?foo=bar&baz=123 -> {foo: "bar", baz: 123}
function getURLVars() {
  let vars = {}
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value
  })
  return vars
}

// returns string as a bool
function parseBool(s) {
  return (s === "true" || s === "1")
}
