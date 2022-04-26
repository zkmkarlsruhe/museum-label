/* Proximity Simulator
   Dan Wilcox ZKM | Hertz-Lab 2022 */

// osc host & port
// note: use IP address or DNS name when connecting external devices
let host = "localhost"
let port = 8081

// ----- load -----

// parse url vars
let vars = getURLVars()
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

// ----- p5 sketch -----

let person = null
let artwork = null
let sensor = null

let sender = {port: null, ready: false}

function setup() {

  // fill screen
  canvas = createCanvas(windowWidth, windowHeight)
  canvas.parent("sketch")
  frameRate(30)

  // instances
  person = new Person(width * 0.5, height * 0.85, 80)
  artwork = new Artwork(width * 0.25, height * 0.1, width * 0.5, height * 0.05)
  sensor = new Sensor(width * 0.5, height * 0.2, height * 0.5)

  // OSC
  // ref: https://github.com/colinbdclark/osc.js/
  sender.port = new osc.WebSocketPort({
    url: "ws://"+host+":"+port,
    metadata: true
  })
  sender.port.on("ready", function() {
    sender.ready = true
    sender.port.send({address: "/proximity", args: [{type: "f", value: sensor.proximity}]})
  })
  sender.port.on("error", function(error) {
    sender.ready = false
    console.error(`osc port error: ${error}`)
  })
  sender.port.open()
}

function draw() {
  background(120)

  if(sensor.update(person.pos)) {
    if(sender.ready) {
      sender.port.send({address: "/proximity", args: [{type: "f", value: sensor.proximity}]})
    }
  }
  
  sensor.draw(person.pos)
  artwork.draw()
  person.draw()

  // value as string
  fill(255)
  textFont("Courier")
  text(sensor.proximity.toFixed(2), 6, 12)

  // value as progress bar
  noStroke()
  fill(40, 40, 40, 200)
  rect(6, 16, 100, 12)
  fill(100, 200, 100, 200)
  rect(6, 16, 100 * sensor.proximity, 12)

  // websocket status
  if(!sender.ready) {
    fill(220, 0, 0)
    text("websocket not connected", 6, 40)
  }
}

function mouseMoved() {
  person.mouseMoved(mouseX, mouseY)
}

function mousePressed() {
  person.mousePressed(mouseX, mouseY)
}

function mouseDragged() {
  person.mouseDragged(0, movedY)
}

function mouseReleased() {
  person.mouseReleased(mouseX, mouseY)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  person.pos.x = width * 0.5
  person.pos.y = height * 0.85
  artwork.frame.x = width * 0.25
  artwork.frame.y = height * 0.1
  artwork.frame.w = width * 0.5
  artwork.frame.h = height * 0.05
  sensor.pos.x = width * 0.5
  sensor.pos.y = height * 0.2
  sensor.range = height * 0.5
}

// ----- util -----

// returns URL variables as key/value pairs:
// ?foo=bar&baz=123 -> {foo: "bar", baz: 123}
function getURLVars() {
  let vars = {}
  let parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    vars[key] = value
  })
  return vars
}
