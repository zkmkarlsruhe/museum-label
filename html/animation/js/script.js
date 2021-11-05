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
