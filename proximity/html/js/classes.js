/* Proximity Simulator
   Dan Wilcox ZKM | Hertz-Lab 2022 */

// ----- Artwork -----

// artwork class, static dummy
class Artwork {

   // init with pos and size
   constructor(x, y, w, h) {
      this.frame = {x: x, y: y, w: w, h: h}
   }

   draw() {
      noStroke()
      fill(255) // white
      rect(this.frame.x, this.frame.y, this.frame.w, this.frame.h)
   }

}

// ----- Person -----

// person class, click and drag to move
class Person {

   // init with pos and size in pixels
   constructor(x, y, size) {
      this.pos = new p5.Vector(x, y)
      this.size = size
      this.hover = false
      this.drag = false
   }

   draw() {
      noStroke()
      if(this.drag || this.hover) {
         fill(200, 200, 100) // gold
      }
      else {
         fill(200, 100, 100) // red
      }
      circle(this.pos.x, this.pos.y, this.size)
   }

   mouseMoved(x, y) {
      let d = this.pos.dist(new p5.Vector(x, y))
      this.hover = (d <= this.size)
   }

   mousePressed(x, y) {
      if(!this.hover) {return}
      this.drag = true
   }

   // requires movement diff from last frame, ie. movedX & movedY
   mouseDragged(dx, dy) {
      if(!this.drag) {return}
      this.pos.x = this.pos.x + dx
      this.pos.y = this.pos.y + dy
      if(this.pos.x < 0) {this.pos.x = 0}
      if(this.pos.x > width) {this.pos.x = width}
      if(this.pos.y < 0) {this.pos.y = 0}
      if(this.pos.y > height) {this.pos.y = height}
   }

   mouseReleased(x, y) {
      if(!this.drag) {return}
      this.drag = false
   }

   mouseExited(x, y) {
      this.drag = false
      this.hover = false
   }

}

// ----- Sensor -----

// sensor class, checks proximity to pos
class Sensor {

   // init with pos and range in pixels
   constructor(x, y, range) {
      this.pos = new p5.Vector(x, y)
      this.range = range
      this.proximity = 0 // normalized
   }

   // check proximity to pos, returns true if sensor value has changed
   update(pos) {
      let d = this.pos.dist(pos)
      let p = constrain(map(d, 0, this.range, 1, 0), 0, 1)
      if(p != this.proximity) {
         this.proximity = p
         return true
      }
      return false
   }

   draw(pos) {
      //stroke(100, 200, 100, 100) // green
      //circle(this.pos.x, this.pos.y, this.range)

      if(this.proximity > 0) {
         noFill()
         stroke(100, 200, 100, 100) // green
         strokeWeight(40 * this.proximity)
         line(this.pos.x, this.pos.y, pos.x, pos.y)
         strokeWeight(1)
      }

      noStroke()
      fill(40)
      circle(this.pos.x, this.pos.y, 20)
   }

}