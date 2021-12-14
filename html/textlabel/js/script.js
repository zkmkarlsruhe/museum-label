/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

import TEXT from "./text.js"
import {Prompt, Status, Label, OSCReceiver, Timer} from "./classes.js"
import * as util from "./util.js"

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

let timer = {
  prompt: new Timer(() => {
    prompt.fadeOut()
  }, 2500)
}

// show intro prompt? otherwise prefer smaller status icons
let intro = true

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

const prompt = new Prompt(TEXT, 250)
const status = new Status(TEXT, 250)
const label = new Label("assets/label", "html", 250)
const receiver = new OSCReceiver(host, port, function(message) {
  if(util.debug) {
    console.log("received osc: ", message)
  }
  if(message.address == "/state") {
    if(message.args.length == 0 || message.args[0].type != "s") {return}
    let state = message.args[0].value
    util.debugPrint("set state " + state)
    if(state == "wait") {
      clear()
      intro = true
    }
    else {
      sketch.fadeOut()
      label.fadeIn()
      if(intro) {
        // wait a bit on transition from animation
        window.setTimeout(() => {setState(state)}, 750)
      }
      else {
        setState(state)
      }
      if(state == "timeout") {
        // show en label
        label.fadeOut(() => {
          label.setLang("en")
          label.fadeIn()
        })
      }
      if(intro && (state == "fail" || state == "timeout")) {
        // fade out and end intro mode
        intro = false
        timer.prompt.start()
      }
    }
  }
  else if(message.address == "/lang") {
    if(message.args.length == 0 ||
      (message.args[0].type != "f" && message.args[0].type != "i")) {return}
    if(prompt.state == "wait") {return}
    sketch.fadeOut()
    let index = message.args[0].value
    let key = TEXT.lang.keys[index]
    if(key < 0) {key = 0}
    util.debugPrint("set lang " + index + " " + key)
    setLang(key)
  }
})
receiver.onclose = () => {clear()}

// page load
window.addEventListener("load", () => {
  receiver.open()

  // debug key commands
  document.onkeyup = (event) => {
    if(event.keyCode >= 49 && event.keyCode <= 55) { // 1-7
      let index = event.keyCode - 48
      let key = TEXT.lang.keys[index]
      if(key < 0) {key = 0}
      sketch.fadeOut()
      if(prompt.state != "success") {
        setState("success")
      }
      setLang(key)
    }
    else if(event.keyCode == 48) { // 0
      clear()
    }
  }
})

// show de label on start
label.setLang("de")

// ----- transitions -----

function setState(state) {
  timer.prompt.stop()
  if(intro) {
    prompt.fadeIn()
    prompt.setState(state)
  }
  else {
    prompt.fadeOut()
    status.fadeIn()
    status.setState(state)
  }
}

function setLang(key) {
  timer.prompt.stop()
  if(intro) {
    prompt.fadeIn()
    prompt.setLang(key)
    intro = false
    timer.prompt.start()
  }
  else {
    prompt.fadeOut()
    status.fadeIn()
    status.setLang(prompt.state, key)
  }
  label.fadeOut(() => {
    label.setLang(key)
    label.fadeIn()
  })
}

function clear() {
  timer.prompt.stop()
  prompt.fadeOut(() => {prompt.clear()})
  status.fadeOut(() => {status.clear()})
  label.fadeOut()
  sketch.fadeIn()
}

sketch.fadeOut = () => {
  util.fadeOutId("sketch", () => {sketch.noLoop()}, 500)
}

sketch.fadeIn = () => {
  sketch.loop()
  util.fadeInId("sketch", null, 500)
}
