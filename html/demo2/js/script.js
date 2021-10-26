/* Demo 2: Digital Text Label
   Paul Bethge ZKM | Hertz-Lab 2021
   Dan Wilcox  ZKM | Hertz-Lab 2021 */

// ref: https://github.com/colinbdclark/osc.js/

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
  loadLang("de")
})

// ----- OSC -----

// ref: https://github.com/colinbdclark/osc.js/
var oscPort = new osc.WebSocketPort({
  url: "ws://"+host+":"+port,
  metadata: true
})

oscPort.on("message", function (message) {
  console.log("received osc: ", message)
  if(message.address == "/lang") {
    let index = message.args[0].value
    if(index < 0 || index >= label.lang.keys.length) {return}
    let key = label.lang.keys[index]
    loadLang(key)
  }
})

// ----- label -----

const label = {
  id: document.getElementById("label"),
  title: document.getElementById("title"),
  artist: document.getElementById("artist"),
  material: document.getElementById("material"),
  description: document.getElementById("description"),
  dir: "assets/database/example_0",
  lang: {
    keys: ["noise", "zh", "en", "fr", "de", "it", "ru", "es"]
  }
}

// load text by ISO 639-1 two-letter language key, ie. "en", "de", etc
// localized text files are named via key, ex. "en.json", and have format:
// {
//   "artist": "Jan Mustermann",
//   "title": "Musterwerk",
//   "material": "interactive skulpture",
//   "format": "wood, metal, electonics...",
//   "year": "20xx",
//   "description": "description of work"
// }
function loadLang(key) {
  const path = label.dir + "/" + key + ".json"
  let request = new XMLHttpRequest()
  request.onreadystatechange = function() {
    if(this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText)
      fadeOutId(label.id, () => {
        label.title.innerHTML = json.title
        label.artist.innerHTML = json.artist
        label.material.innerHTML = json.material
        label.description.innerHTML = json.description
        fadeInId(label.id, null, 500)
      }, 500)
    }
  }
  request.open("GET", path, true)
  request.send()
}

// ----- util -----

// fade out id with optional completion function fired after duration seconds
// duration defaults to 1s if not set, returns timer token or null
function fadeOutId(id, completion, duration) {
  if(typeof id == "string") {
    id = document.getElementById(id)
  }
  id.style.opacity = id.style.getPropertyValue("--initial-opacity")
  id.style.pointerEvents = "none"
  if(typeof completion == "function") {
    if(typeof duration != "number" || duration < 0) {
      duration = 1000
    }
    return window.setTimeout(completion, duration)
  }
  return null
}

// fade in id with optional completion function fired after duration seconds
// duration defaults to 1s if not set, returns timer token or null
function fadeInId(id, completion, duration) {
  if(typeof id == "string") {
    id = document.getElementById(id)
  }
  id.style.setProperty("--initial-opacity", id.style.opacity)
  id.style.opacity = "100%"
  id.style.pointerEvents = ""
  if(typeof completion == "function") {
    if(typeof duration != "number" || duration < 0) {
      duration = 1000
    }
    return window.setTimeout(completion, duration)
  }
  return null
}

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
