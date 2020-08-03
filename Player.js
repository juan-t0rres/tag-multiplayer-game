class Player {
    constructor(id) {
      this.name = "";
      this.x = Math.random() * 1600;
      this.y = Math.random() * 900;
      this.id = id;
      this.active = false;

      this.rgb = {
        r: Math.random() * 255,
        g: Math.random() * 255,
        b: Math.random() * 255,
      }
    }
  
  }
  
  module.exports = Player;