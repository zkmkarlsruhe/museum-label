/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

// ----- video -----

// video background layer with overlay
export class Video {

  constructor() {
    this.id = document.getElementById("video")
    this.overlay = document.getElementById("video-overlay")
    this.setOpacity(100)
  }

  // start video playback (if not playing already)
  play() {
    this.id.play()
  }

  // stop video playback
  pause() {
    this.id.pause()
  }

  // set opacity in percent 0 - 100
  setOpacity(opacity) {
    this.overlay.style.opacity = (100 - opacity) + "%"
  }

}

// ----- prompt -----

// interaction prompt text layer
export class Prompt {

  // constructor with data object in following layout:
  // {
  //    lang: {
  //      keys: ["en", "de", ...], <- two-letter ISO lang keys, ie. "en", "de", etc
  //      names: ["English", "Deutsch", ...] <- localized names
  //    }
  // }
  constructor(data) {
    this.id = document.getElementById("prompt")
    this.text = document.getElementById("prompt-text")
    this.data = data
    this.state = "wait" // current state
  }

  // set text based on state
  setState(state) {
    let html = ""
    html = state
    this.state = state
    this.text.innerHTML = html
  }

  // set current state text with language by ISO 639-1 two-letter language key,
  // ie. "en", "de", etc
  setLang(key) {
    let html = ""
    var index = this.data.lang.keys.indexOf(key)
    if(index < 0) {index = 0}
    html = this.state + "<br>" + this.data.lang.names[index]
    this.text.innerHTML = html
  }


  // clear text
  clear() {
    this.state = "wait"
    this.text.innerHTML = ""
  }

}

// ----- label -----

// digital artwork text label
export class Label {

  // constructor with path to localized work text json files
  constructor(jsondir) {
    this.id = document.getElementById("label")
    this.title = document.getElementById("label-title")
    this.artist = document.getElementById("label-artist")
    this.material = document.getElementById("label-material")
    this.description = document.getElementById("label-description")
    this.dir = jsondir
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
  setLang(key) {
    this.clear()
    const path = this.dir + "/" + key + ".json"
    let self = this
    let request = new XMLHttpRequest()
    request.onreadystatechange = function() {
      if(this.readyState == 4 && this.status == 200) {
        let json = JSON.parse(this.responseText)
        self.title.innerHTML = json.title
        self.artist.innerHTML = json.artist
        self.material.innerHTML = json.material
        self.description.innerHTML = json.description
      }
    }
    request.open("GET", path, true)
    request.send()
  }

  // clear text
  clear() {
    this.title.innerHTML = ""
    this.artist.innerHTML = ""
    this.material.innerHTML = ""
    this.description.innerHTML = ""
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
    this.receiver = new osc.WebSocketPort({
      url: "ws://" + this.host + ":" + this.port,
      metadata: true
    })
    this.receiver.on("message", callback)
  }

  // start receiving on the websocket
  start() {
    this.receiver.open()
  }

  // atop receiving on the websocket
  stop() {
    this.receiver.close()
  }

}

// ----- Timer -----

// timer convenience wrapper
export class Timer {

  constructor(callback, delay) {
    this.callback = callback
    this.delay = delay
    this.timer = null
  }

  start() {
    stop()
    this.timer = window.setTimeout(this._timeout.bind(this), this.delay)
  }

  stop() {
    if(this.timer) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  isRunning() {
    return this.timer === null
  }

  _timeout() {
    this.callback()
    this.timer = null
  }

}
