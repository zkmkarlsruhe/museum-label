import TEXT from "./text.js"
import {Video, Prompt, Label, OSCReceiver, Timer} from "./classes.js"
import * as util from "./util.js"

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

// parse url vars
let vars = util.getURLVars()
if("debug" in vars) {
  util.debug = util.parseBool(vars.debug)
  console.log(`var debug ${debug}`)
}
if("host" in vars) {
  host = vars.host
  console.log(`var host ${host}`)
}
if("port" in vars) {
  let n = parseInt(vars.level)
  if( n >= 1024) {
    port = n
    console.log(`var port ${port}`)
  }
}
vars = null

// transition timing
const timing = {
  fade: { // fade times in ms
    prompt: 250,
    label: 250
  },
  show: {
    label: 5000 // how long to wait to show label after success
  }
}

// transition timers
const timer = {
  label: new Timer(function() {
    util.fadeOutId(prompt.id, () => {
      prompt.clear()
      showLabel()
    }, timing.fade.prompt)
    util.debugPrint("show label")
  }, timing.show.label)
}

// ----- main -----

const video = new Video()
const prompt = new Prompt(TEXT)
const label = new Label("assets/label")
const receiver = new OSCReceiver(host, port, function(message) {
  if(util.debug) {
    console.log("received osc: ", message)
  }
  if(message.address == "/state") {
    if(message.args.length == 0 || message.args[0].type != "s") {return}
    let state = message.args[0].value
    util.debugPrint("set state " + state)
    if(state == "wait") {
      showVideo()
      clear()
    }
    else {  
      hideVideo()
      setState(state)
    }
    hideLabel()
  }
  else if(message.address == "/lang") {
    if(message.args.length == 0 ||
      (message.args[0].type != "f" && message.args[0].type != "i")) {return}
    let index = message.args[0].value
    util.debugPrint("set lang " + index)
    setLang(index)
  }
})

window.addEventListener("load", () => {
  receiver.start()

  // debug key commands
  document.onkeyup = (event) => {
    if(event.keyCode >= 49 && event.keyCode <= 55) { // 1-7
      let index = event.keyCode - 48
      hideVideo()
      if(prompt.state != "success") {
        setState("success")
      }
      setLang(index)
    }
    else if(event.keyCode == 48) { // 0
      showVideo()
      hideLabel()
      clear()
    }
  }
})

// ----- transitions -----

function showVideo() {
  video.play()
  video.setOpacity(100)
}

function hideVideo() {
  video.setOpacity(0)
  video.pause()
}

function setState(state) {
  util.fadeOutId(prompt.id, () => {
    prompt.setState(state)
    util.fadeInId(prompt.id, null, timing.fade.prompt)
  }, timing.fade.prompt)
}

function setLang(index) {
  let key = TEXT.lang.keys[index]
  util.fadeOutId(prompt.id, () => {
    prompt.setLang(index)
    util.fadeInId(prompt.id, null, timing.fade.prompt)
  }, timing.fade.prompt)
  util.fadeOutId(label.id, () => {
    label.setLang(key)
  }, timing.fade.label)
  timer.label.start()
}

function clear() {
  util.fadeOutId(prompt.id, () => {
    prompt.clear()
  }, timing.fade.prompt)
}

function showLabel() {
  util.fadeInId(label.id, null, timing.fade.label)
}

function hideLabel() {
  util.fadeOutId(label.id, null, timing.fade.label)
}
