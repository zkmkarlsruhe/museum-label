/* Text Animation
   Dan Wilcox ZKM | Hertz-Lab 2021 */

// ----- load -----

window.addEventListener("load", function() {

  // debug key commands
  document.onkeyup = function(event) {
    if(event.key == "Space" || event.keyCode == 32) {
      if(sketch.isLooping()) {
        sketch.noLoop()
      }
      else {
        sketch.loop()
      }
    }
  }

})

// ----- p5 sketch -----

// using instance mode for encapsulation:
// https://p5js.org/reference/#/p5/p5
let sketch = new p5(( p ) => {

  const count = 80
  const colors = [
    p.color(236,  98, 172), // pink
    p.color(247, 210, 96),  // yellow
    p.color(134, 202, 179), // green
    p.color( 66, 158, 242)  // blue
  ]
  const fontname = "UniversNextPro-Bold"

  let particles = new Particles()

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight)
    p.frameRate(60)
    p.noCursor()
    let nextcolor = p.random(1, colors.length)
    for(let i = 0; i < count; i++) {
      let color = null
      if(p.random(0, 100) <= 30) { // 30% chance to choose next color
        color = colors[nextcolor]
        nextcolor++
        if(nextcolor >= colors.length) {nextcolor = 0}
      }
      let char = String.fromCharCode(p.random(33, 126)) // printable ascii
      particles.add(new Particle(p, char, fontname, color))
    }
    particles.sort()
  }

  p.draw = () => {
    p.background(255)
    particles.update()
    particles.draw()
  }

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
  }

}, "sketch")
