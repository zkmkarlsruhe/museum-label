/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

import TEXT from "./text.js"
import {Video, Prompt, Label, OSCReceiver, Timer} from "./classes.js"
import * as util from "./util.js"

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

// transition timing
const timing = {
  fade: { // fade times in ms
    prompt: 250,
    label: 250
  }
}

// ----- main -----

// parse url vars
let vars = util.getURLVars()
if("debug" in vars) {
  util.setDebug(util.parseBool(vars.debug))
  console.log(`var debug ${util.debug}`)
}
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
      hideLabel()
      showVideo()
      clear()
    }
    else {  
      hideVideo()
      showLabel()
      setState(state)
      if(state == "timeout") {
        // show en label
        setLang("en")
      }
    }
  }
  else if(message.address == "/lang") {
    if(message.args.length == 0 ||
      (message.args[0].type != "f" && message.args[0].type != "i")) {return}
    if(prompt.state == "wait") {return}
    let index = message.args[0].value
    let key = TEXT.lang.keys[index]
    if(key < 0) {key = 0}
    util.debugPrint("set lang " + index + " " + key)
    setLang(key)
  }
})

// page load
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

// show de label on start
label.setLang("de")
hideLabel()

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

function setLang(key) {
  util.fadeOutId(prompt.id, () => {
    prompt.setLang(key)
    util.fadeInId(prompt.id, null, timing.fade.prompt)
  }, timing.fade.prompt)
  util.fadeOutId(label.id, () => {
    label.setLang(key)
    util.fadeInId(label.id, null, timing.fade.label)
  }, timing.fade.label)
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
