
// ----- main -----

window.addEventListener("load", () => {
  oscPort.open()
  loadLang("de")
})

// ----- OSC -----

// ref: https://github.com/colinbdclark/osc.js/
var oscPort = new osc.WebSocketPort({
  url: "ws://localhost:8081",
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
