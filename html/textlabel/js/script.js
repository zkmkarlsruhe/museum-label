/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

import LANG from "./LANG.js"
import {Prompt, Status, Confidence, Label, OSCReceiver, Timer} from "./classes.js"
import * as util from "./util.js"

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

// intro control
let intro = {
  enabled: true, // show intro?
  timer: new Timer(() => {
    // done with intro
    prompt.fadeOut()
    confidence.show()
  }, 5000)
}

let current = {
  state: "wait",
  lang: ""
}

//util.setDebug(true)

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

const prompt = new Prompt(LANG, 250)
const status = new Status(LANG, 250)
const confidence = new Confidence()
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
    }
    else {
      current.state = state
      setup(state)
      if(state == "timeout") {
        // show en label
        label.fadeOut(() => {
          label.setLang("en")
          label.fadeIn()
        })
      }
      if(intro.enabled && (state == "fail" || state == "timeout")) {
        // fade out and end intro mode
        intro.enabled = false
        intro.timer.start()
      }
    }
  }
  else if(message.address == "/lang") {
    if(message.args.length < 2 ||
     (message.args[0].type != "f" && message.args[0].type != "i")) {return}
    if(current.state == "wait") {return}
    sketch.fadeOut()
    let index = message.args[0].value
    let key = LANG.lang.keys[index]
    if(key < 0) {key = 0}
    let con = 50
    if(message.args.length > 2 && message.args[2].type == "f") {
      con = Math.round(message.args[2].value * 100)
    }
    util.debugPrint("set lang " + index + " " + key + " " + con)
    setLang(key, con)
  }
})
//receiver.onclose = () => {clear()}

// page load
window.addEventListener("load", () => {
  receiver.open()

  // debug key commands
  document.onkeyup = (event) => {
    if(event.keyCode >= 48 && event.keyCode <= 55) { // 0-7
      let index = event.keyCode - 48
      let key = LANG.lang.keys[index]
      if(key < 0) {key = 0}
      if(current.state != "success") {
        setup("success")
      }
      setLang(key, 100)
      confidence.show()
    }
    else if(event.key == "w") {
      clear()
    }
  }
})

// show de label on start
label.setLang("de")

// ----- transitions -----

function setState(state) {
  intro.timer.stop()
  if(intro.enabled) {
    prompt.fadeIn()
    prompt.setState(state)
  }
  else {
    prompt.fadeOut()
    status.fadeIn()
    status.setState(state)
  }
}

function setLang(key, con) {
  intro.timer.stop()
  if(intro.enabled) {
    prompt.fadeIn()
    prompt.setLang(key)
    intro.enabled = false
    intro.timer.start()
  }
  else {
    prompt.fadeOut()
    status.fadeIn()
  }
  confidence.set(con)
  status.setLang(current.state, key)
  if(key == current.lang) {return}
  label.fadeOut(() => {
    label.setLang(key)
    label.fadeIn()
  })
}

// fade out animation and set up everything
function setup(state) {
  sketch.fadeOut()
  label.fadeIn()
  if(intro.enabled) {
    // wait a bit on transition from animation
    //window.setTimeout(() => {setState(state)}, 750)
    setState(state)
  }
  else {
    setState(state)
  }
}

// clear everything and fade to animation
function clear() {
  intro.timer.stop()
  confidence.hide()
  prompt.fadeOut(() => {prompt.clear()})
  status.fadeOut(() => {status.clear()})
  label.fadeOut()
  sketch.fadeIn()
  intro.enabled = true
  current.state = "wait"
}

// fade out and stop updating
sketch.fadeOut = () => {
  if(sketch.fade) {
    window.clearTimeout(sketch.fade)
    sketch.fade = null
  }
  if(sketch.isHidden) {return}
  sketch.fade = util.fadeOutId("sketch", () => {
    sketch.noLoop()
    sketch.isHidden = true
  }, 500)
}


// start updating and fade in
sketch.fadeIn = () => {
  if(sketch.fade) {
    window.clearTimeout(sketch.fade)
    sketch.fade = null
  }
  if(!sketch.isHidden) {return}
  sketch.loop()
  sketch.fade = util.fadeInId("sketch", () => {
    sketch.isHidden = false
  }, 500)
}
