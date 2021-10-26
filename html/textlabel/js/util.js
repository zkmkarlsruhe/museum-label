/* Digital Text Label
   Dan Wilcox ZKM | Hertz-Lab 2021 */

// ----- util -----

export var debug = false

// set debug state
export function setDebug(enable) {
  debug = enable
}

// only print if debug is set
export function debugPrint(msg) {
  if(debug) {
    console.log(msg)
  }
}

// fade out id with optional completion function fired after duration seconds
// duration defaults to 1s if not set, returns timer token or null
export function fadeOutId(id, completion, duration) {
  if(typeof id == "string") {
    id = document.getElementById(id)
  }
  id.style.opacity = "0%" //id.style.getPropertyValue("--initial-opacity")
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
export function fadeInId(id, completion, duration) {
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

// returns URL variables as key/value pairs:
// ?foo=bar&baz=123 -> {foo: "bar", baz: 123}
export function getURLVars() {
  let vars = {}
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value
  })
  return vars
}

// returns string as a bool
export function parseBool(s) {
  return (s === "true" || s === "1")
}
