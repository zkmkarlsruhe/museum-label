/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

import * as util from "./util.js"

// return confidence 0-100 as abstract string
function confidenceString(confidence) {
  if(confidence >= 99) {
    return "!"
  }
  if(confidence < 70) {
    return "?!"
  }
  if(confidence < 80) {
    return "?"
  }
  return ""
}

// ----- base -----

// base class which fades in/out an id (either by name or reference)
// id *must* have css transition set for opacity fade to work:
//
// css:
// .transition-500ms {
//   transition: 500ms;
//   transition-timing-function: ease-in-out;
// }
//
// html:
// <div id="myid" class=".transition-500ms">...</div>
//
// js:
// let myid = BaseFades("myid", 500)
// myid.fadeOut()
//
class BaseFades {

  // constructor whith id to fade and fade time in ms
  constructor(id, fade) {
    this.id = id
    this.fade = fade
  }

  // fade out, calls optional callback function on completion
  fadeOut(callback) {
    util.fadeOutId(this.id, callback, this.fade)
  }

  // fade out, calls optional callback function on completion
  fadeIn(callback) {
    util.fadeInId(this.id, callback, this.fade)
  }

  // hide immediately
  hide() {
    util.hideId(this.id)
  }

  // show imediately
  show() {
    util.showId(this.id)
  }

}

// ----- prompt -----

// interaction prompt text layer
export class Prompt extends BaseFades {

  // constructor with data object & fade time in ms
  // data object should be in the following layout:
  // {
  //    lang: {
  //      keys: ["en", "de", ...], <- two-letter ISO lang keys, ie. "en", "de", etc
  //      names: ["English", "Deutsch", ...] <- localized names
  //    }
  // }
  constructor(data, fade) {
    super(document.getElementById("prompt"), fade)
    this.text = document.getElementById("prompt-text")
    this.data = data

    // start hidden to avoid showing empty label
    this.fadeOut(() => {util.showId(this.id)})
  }

  // set text based on state
  setState(state) {
    let html = ""
    this.show()
    switch(state) {
      case "wait":
        this.text.innerHTML = ""
        break
      case "listen":
        this.text.innerHTML = "<div class='icon icon-large lang'></div>"
        break
      case "detect":
        // keep listen icon
        return
      case "success":
        this.hide() // hide until replaced by lang name
        break
      case "fail":
        this.text.innerHTML = "<div class='icon icon-large question'></div>"
        break
      case "timeout":
        this.text.innerHTML = "<div class='icon icon-large timeout'></div>"
        break
      default:
        this.text.innerHTML = ""
        break
    }
  }

  // set current state text with language by ISO 639-1 two-letter language key,
  // ie. "en", "de", etc
  setLang(key, con) {
    let html = ""
    var index = this.data.lang.keys.indexOf(key)
    if(index < 0) {index = 0}
    html = this.data.lang.names[index]
    if(html == "") {return} // ignore empty names
    this.text.innerHTML = html + confidenceString(con)
    util.showId(this.id)
  }

  // clear text
  clear() {
    this.text.innerHTML = ""
  }

}

// ----- status -----

// interaction state status text layer
export class Status extends BaseFades {

  // constructor with data object & fade time in ms
  // data object should be in the following layout:
  // {
  //    lang: {
  //      keys: ["en", "de", ...], <- two-letter ISO lang keys, ie. "en", "de", etc
  //      names: ["English", "Deutsch", ...] <- localized names
  //    }
  // }
  constructor(data, fade) {
    super(document.getElementById("status"), fade)
    this.text = document.getElementById("status-text")
    this.icon = document.getElementById("status-icon")
    this.data = data
    this.recordonly = false // show flashing record icon only?
    this.recordtimer = new Timer(() => {
      let record = document.getElementById("record")
      if(!record.classList.contains("record-black")) {
      //if(util.isIdHidden("record")) {
        //util.showId("record")
        this.icon.innerHTML = "<div id=\"record\" class='icon icon-small record-black'></div>"
      }
      else {
        //util.hideId("record")
        this.icon.innerHTML = "<div id=\"record\" class='icon icon-small'></div>"
      }
    }, 1000)
  }

  // set icon and text based on state
  setState(state) {
    if(this.recordonly) {
      switch(state) {
        case "listen":
          this.recordtimer.stop()
          //if(document.getElementById("record")) {
            this.icon.innerHTML = ""
          //}
          break
        case "detect":
          //util.showId(this.text)
          this.icon.innerHTML = "<div id=\"record\" class='icon icon-small record-black'></div>"
          this.recordtimer.repeat()
          break
        default:
          break
      }
      this.text.innerHTML = ""
      return
    }
    //util.showId(this.text)
    switch(state) {
      case "wait":
        this.icon.innerHTML = ""
        this.text.innerHTML = ""
        break
      case "listen":
        this.recordtimer.stop()
        //if(document.getElementById("record")) {
          this.icon.innerHTML = ""
        //}
        // keep lang name visible
        break
      case "detect":
        this.icon.innerHTML = "<div id=\"record\" class='icon icon-small status-icon record-black'></div>"
        this.recordtimer.repeat()
        // keep lang name visible
        break
      case "success":
        this.recordtimer.stop()
        this.icon.innerHTML = ""
        this.text.innerHTML = "" // hide until replaced by lang name
        break
      case "fail":
        this.recordtimer.stop()
        this.icon.innerHTML = "<div class='icon icon-small status-icon question-black'></div>"
        this.text.innerHTML = ""
        break
      case "timeout":
        this.text.innerHTML = ""
        this.recordtimer.stop()
        this.icon.innerHTML = "<div class='icon icon-small status-icon timeout-black'></div>"
        this.text.innerHTML = ""
        break
      default:
        this.text.innerHTML = ""
        break
    }
  }

  // set current state text with language by ISO 639-1 two-letter language key,
  // ie. "en", "de", etc
  setLang(state, key, con) {
    this.recordtimer.stop()
    let html = ""
    let index = this.data.lang.keys.indexOf(key)
    if(index < 0) {index = 0}
    html = this.data.lang.names[index]
    if(html == "") {return} // ignore empty names
    this.text.innerHTML = html + confidenceString(con)
    //util.showId(this.text)
  }

  // clear icon and text
  clear() {
    this.recordtimer.stop()
    this.icon.innerHTML = ""
    this.text.innerHTML = ""
  }

}

// ----- label -----

// digital artwork text label
export class Label extends BaseFades {

  // constructor with path to localized work text files & fade time in ms
  // type denotes file type and data handling:
  //  * json: dict with title, artist, material, and description keys
  //  * html: html to insert
  // json file format example:
  // {
  //   "artist": "Jan Mustermann",
  //   "title": "Musterwerk",
  //   "material": "interactive skulpture",
  //   "year": "20xx",
  //   "description": "description of work"
  // }
  constructor(dir, type, fade) {
    super(document.getElementById("label"), fade)
    this.text = document.getElementById("label-text")
    this.dir = dir
    this.type = type
    if(this.type == "json") {
      this.title = document.getElementById("label-title")
      this.artist = document.getElementById("label-artist")
      this.year = document.getElementById("label-year")
      this.material = document.getElementById("label-material")
      this.description = document.getElementById("label-description")
    }

    // start hidden to avoid showing initial label fade out
    this.fadeOut(() => {util.showId(this.id)})
  }

  // load text by ISO 639-1 two-letter language key, ie. "en", "de", etc
  // localized text files are named via key, ex. "en.json" or "de.html"
  setLang(key) {
    this.clear()
    const path = this.dir + "/" + key + "." + this.type
    let self = this
    let request = new XMLHttpRequest()
    request.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        if(self.type == "json") {
          let json = JSON.parse(this.responseText)
          self.artist.innerHTML = json.artist
          self.title.innerHTML = json.title
          self.year.innerHTML = json.year
          self.material.innerHTML = json.material
          self.description.innerHTML = json.description
        }
        else {
          self.text.innerHTML = this.responseText
        }
      }
    }
    request.open("GET", path, true)
    request.send()
  }

  // clear text
  clear() {
    if(this.type == "json") {
      this.artist.innerHTML = ""
      this.title.innerHTML = ""
      this.year.innerHTML = ""
      this.material.innerHTML = ""
      this.description.innerHTML = ""
    }
    else {
      this.text.innerHTML = ""
    }
  }

}

// ----- OSC -----

// websocket OSC (Open Sound Control) receiver
export class OSCReceiver {

  // constructor with websocket host URL, websocket port, and message receive
  // callback function in the form function(message) {}
  constructor(host, port, callback) {
    this.host = host
    this.port = port
    this.callback = callback
    this.onclose = null // reconnect close event callback
    this.onopen = null // reconnect open event callback
    this.receiver = null
    this.timer = null
  }

  // open the websocket
  open() {
    this.receiver = new osc.WebSocketPort({
      url: "ws://" + this.host + ":" + this.port,
      metadata: true
    })
    this.receiver.on("message", this.callback)
    this.receiver.on("error", function(error) {
      // close until next reconnect
      if(this.receiver) {
        this.receiver.close();
        this.receiver = null
      }
    })
    this.receiver.open()
    this.timer = window.setInterval(()=> {
      // check every 5 seconds and try to reconnect
      if(!this.isOpen()) {
        this.close()
        if(this.onclose) {this.onclose()}
        this.open();
        if(this.onopen) {this.onopen()}
      }
    }, 5000)
  }

  // close the websocket
  close() {
    if(this.timer) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    if(this.receiver) {
      this.receiver.close()
      this.receiver = null
    }
  }

  // returns true if the websocket is open
  isOpen() {
    if(!this.receiver) {return false}
    return !(this.receiver.socket === undefined ||
      (this.receiver.socket && this.receiver.socket.readyState === 3))
  }

}

// ----- Timer -----

// timer convenience wrapper
export class Timer {

  // constructor with callback function and delay in ms
  constructor(callback, delay) {
    this.callback = callback
    this.delay = delay
    this.timer = null
    this.type = null
  }

  // (re)start timer
  start() {
    stop()
    this.type = "oneshot"
    this.timer = window.setTimeout(this._timeout.bind(this), this.delay)
  }

  // (re)start repeating timer
  repeat() {
    stop()
    this.type = "repeat"
    this.timer = window.setInterval(this._timeout.bind(this), this.delay)
  }

  // stop currently running timer
  stop() {
    if(this.timer) {
      if(this.type == "oneshot") {
        window.clearTimeout(this.timer)
      }
      else if(this.type == "repeat") {
        window.clearInterval(this.timer)
      }
      this.timer = null
    }
    this.type = null
  }

  // returns true if the timer is running
  isRunning() {
    return this.timer === null
  }

  // internal callback, do not use directly
  _timeout() {
    this.callback()
    if(this.type == "oneshot") {
      this.timer = null
    }
  }

}
