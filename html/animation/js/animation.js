/* Text Animation
   Dan Wilcox ZKM | Hertz-Lab 2021 */

/// single text-drawing particle
class Particle {

  /// constructor with required p5 sketch instance, display text,
  /// font family name, and optional font color 
  constructor(p, text, fontname="Helvetica-Bold", fontcolor=null) {
    this.p = p
    this.font = {
      name: fontname,
      size: 10,
      color: p.color(0)
    }
    this.text = text
    this.color = fontcolor
    this.pos = new p5.Vector(0, 0)
    this.vel = new p5.Vector(0, 0)
    this.randomize()
  }

  update() {
    this.pos.x = this.pos.x + this.vel.x
    this.pos.y = this.pos.y + this.vel.y
    if(this.vel.x < 0) {
      if(this.pos.x < -100) {
        this.pos.x = this.p.windowWidth + 100
      }
    }
    else if(this.vel.x > 0) {
      if(this.pos.x > this.p.windowWidth + 100) {
        this.pos.x = -100
      }
    }
    if(this.vel.y < 0) {
      if(this.pos.y < -100) {
        this.pos.y = this.p.windowHeight + 100
      }
    }
    else if(this.vel.y > 0) {
      if(this.pos.y > this.p.windowHeight + 100) {
        this.pos.y = -100
      }
    }
  }

  draw() {
    this.p.fill(this.font.color)
    this.p.textFont(this.font.name, this.font.size)
    this.p.text(this.text, this.pos.x, this.pos.y)
  }

  // 5 levels distance, smaller = farther away
  randomize() {
    this.pos.set(
      this.p.random(0, this.p.windowWidth),
      this.p.random(0, this.p.windowHeight),
      Math.floor(this.p.random(1, 6))
    )
    this.vel.set(-4 + this.p.random(-1, 1), 0)
    this.font.size = this.pos.z * 20
    if(this.color) { // use optional color
      this.font.color = this.color
    }
    else { // compute grayscale from position
      this.font.color = this.p.color(this.p.map(this.pos.z, 1, 6, 220, 0))
    }
    this.vel.x = this.vel.x * this.p.map(this.pos.z, 1, 6, 0.2, 1)
    this.vel.y = this.vel.y * this.p.map(this.pos.z, 1, 6, 0.2, 1)
  }

}

/// particle array manager
class Particles {

  constructor() {
    this.particles = []
    this.run = true
  }

  add(p) {
    while(this.tooClose(p, 50)) {p.randomize()}
    this.particles.push(p)
  }

  sort() {
    this.particles.sort(function(a, b){return a.pos.z - b.pos.z})
  }

  update() {
    for(let p of this.particles) {
      p.update()
    }
  }

  draw() {
    for(let p of this.particles) {
      p.draw()
    }
  }

  /// returns true if particle p is within given
  /// distance d of any other particle
  tooClose(p, d) {
    for(let o of this.particles) {
      if(p == o) {continue}
      if(p.p.dist(p.pos.x, p.pos.y, o.pos.x, o.pos.y) <= d) {
        return true
      }
    }
    return false
  }

}

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
