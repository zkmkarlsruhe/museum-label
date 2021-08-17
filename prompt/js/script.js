import TEXT from "./text.js"

let debug = true
let currentState = "wait"

// media
let video = {
  id: document.getElementById("video-background"),
  overlay: document.getElementById("video-overlay"),
}
let text = {
  id: document.getElementById("text"),
  text: document.getElementById("text-text")
}

// ----- load -----

window.addEventListener("load", () => {
  videoSetup()
})

// ----- OSC -----

// use localhost when only connecting internally
let host = "localhost"

// use the server machine's IP address when connecting external devices
//let host = "10.10.0.159"

var oscPort = new osc.WebSocketPort({
    url: "ws://"+host+":8081",
    metadata: true
})

oscPort.on("message", function (message) {
    debugPrint("received osc: " + message)
    if(message.address == "/state") {
      if(message.args.length == 0 || message.args[0].type != "s") {return}
      let state = message.args[0].value
      if(state == "wait") {
        videoPlay()
        videoSetOpacity(100)
        textSetState(state)
        textSetOpacity(0)
      }
      else {
        console.log("set state " + state)
        videoSetOpacity(0)
        videoPause()
        fadeOutId(text.id, () => {
          textSetState(state)
          fadeInId(text.id)
        })
      }
      currentState = state
    }
    else if(message.address == "/lang") {
      if(message.args.length == 0 ||
        (message.args[0].type != "f" &&  message.args[0].type != "i")) {return}
      if(currentState != "success") {return}
      let index = message.args[0].value
      fadeOutId(text.id, () => {
        textSetState("success", index)
        fadeInId(text.id)
      })
    }
})

oscPort.open()

// ----- video -----

function videoSetup() {
  videoSetOpacity(100)
}

// start video playback (if not playing already)
function videoPlay() {
  video.id.play()
}

// stop video playback
function videoPause() {
  video.id.pause()
}

// set opacity in percent 0 - 100
function videoSetOpacity(opacity) {
  video.overlay.style.opacity = (100 - opacity) + "%"
}

// ----- text -----

// set text based on state and optional lang index
function textSetState(state, index) {
  var html = ""
  var name = undefined
  if(index !== undefined) {
    name = "unknown"
    if(index >= 0 && index < TEXT.lang.names.length) {
      name = TEXT.lang.names[index]
    }
  }
  for(let lang of TEXT.lang.keys) {
    if(TEXT[lang][state] === undefined) {continue}
    var line = TEXT[lang][state]
    // replace <lang> with name, if set
    if(name !== undefined) {
      line = line.replace("<lang>", name)
    }
    else {
      line = line.replace("<lang>", "")
    }
    if(line) {
      html += "<p>" + line + "</p>\n"
    } 
  }
  text.text.innerHTML = html
  debugPrint(html)
}

// ----- general -----

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

function debugPrint(msg) {
  if(debug) {
    console.log(msg)
  }
}
