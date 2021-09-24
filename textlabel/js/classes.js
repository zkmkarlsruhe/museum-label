
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
  //    lang: { keys: ["en", "de", ...] }, <- two letter iso lang keys, ie. "en", "de", etc
  //    locales: {
  //      en: { <- localized state texts and lang names for each lang by key
  //        state: { wait: "please wait", listen: "listening", ...},
  //        lang: { names: ["English", "German", ...] }
  //      },
  //      de: {
  //        state: { wait: "bitte warten", listen: "anhören", ...},
  //        lang: { names: ["Englisch", "Deutsch", ...] }
  //      },
  //      ...
  //    }
  //  }
  constructor(data) {
    this.id = document.getElementById("prompt")
    this.text = document.getElementById("prompt-text")
    this.data = data
    this.state = "wait" // current state
  }

  // set text based on state, remove <lang> markers
  setState(state) {
    let html = ""
    for(let key of this.data.lang.keys) {
      const locale = this.data.locales[key]
      let line = locale.state[state]
      if(line === undefined) {continue}
      line = line.replace("<lang>", "")
      html += "<p>" + line + "</p>\n"
    }
    this.state = state
    this.text.innerHTML = html
  }

  // set text for current state, replace <lang> with localized lang name
  setLang(index) {
    let html = ""
    for(let key of this.data.lang.keys) {
      const locale = this.data.locales[key]
      const names = locale.lang.names
      let line = locale.state[this.state]
      if(line === undefined || locale.lang === undefined) {continue}
      if(index < 0 || index >= names.length) {continue}
      const name = names[index]
      if(name === undefined) {continue}
      line = line.replace("<lang>", name)
      html += "<p>" + line + "</p>\n"
    }
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
    this.timer = window.setTimeout(this.callback, this.delay)
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

}
