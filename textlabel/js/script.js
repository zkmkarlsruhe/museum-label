import TEXT from "./text.js"
import {Video, Prompt, Label, OSCReceiver, Timer} from "./classes.js"
import * as util from "./util.js"

//let debug = true

// osc host, use localhost when only connecting internally
const host = "localhost"

// osc host, use the server machine's IP address when connecting external devices
//const host = "10.10.0.159"

// osc port
const port = 8081


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
  util.debugPrint("received osc: ", message)
  if(message.address == "/state") {
    if(message.args.length == 0 || message.args[0].type != "s") {return}
    let state = message.args[0].value
    if(state == "wait") {
      showVideo()
      clear()
    }
    else {
      console.log("set state " + state)
      hideVideo()
      setState(state)
    }
    hideLabel()
  }
  else if(message.address == "/lang") {
    if(message.args.length == 0 ||
      (message.args[0].type != "f" && message.args[0].type != "i")) {return}
    if(prompt.state != "success") {return}
    let index = message.args[0].value
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
    //util.fadeInId(label.id, null, timing.fade.label)
  }, timing.fade.label)
  timer.label.start()
}

function clear() {
  util.fadeOutId(prompt.id, () => {
    prompt.clear()
  }, timing.fade.prompt)
  // util.fadeOutId(label.id, () => {
  //   label.clear()
  // }, timing.fade.label)
}

function showLabel() {
  util.fadeInId(label.id, null, timing.fade.label)
}

function hideLabel() {
  util.fadeOutId(label.id, null, timing.fade.label)
}
