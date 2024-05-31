
// create an array to store jellyfishe object
let jellys = [];
// set numbers of jelly fish
let numJellys = 9;

// create an array to store particles object
let particles = [];
let xoff = 0.0;

function setup() {
  // create a canvas with window width and height
  createCanvas(windowWidth, windowHeight);

  // using for loop to create setted jellyfish object, and add it into jellys array
  for (let i = 0; i < numJellys; i++) {
    // create jellyfish object and add it into jellys array
    jellys.push(
      new Jellyfish(
        createVector(random(width), random(height) / 2),
        12,
        12,
        random(5, 10),
        random(5, 25),
        10,
        10
      )
    );
  }

  // using for loop create 2000 dots object and add it into particles array
  for (let i = 0; i < 2000; i++) {
    let particle = new Particle(random(width), random(height));
    particles.push(particle);
  }
}

// create a variable t and set to 0
let t = 0;

function draw() {
  // set background colour to yellow
  background(255, 200, 34);

  // update and display those dots
  for (let particle of particles) {
    particle.update();
    particle.display();
  }

  // update jellyfish
  for (let i = 0; i < jellys.length; i++) {
    jellys[i].update();
  }

  // every time draws t add 0.02
  t += 0.02;
}

// define a particle class
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(150), random(100));
    this.size = random(4, 10);
    this.angle = 0;
    this.sp = random(0.01, 0.1);
  }

  // update particle size and angle
  update() {
    this.size = map(sin(this.angle), -1, 1, 4, 10);
    this.angle += this.sp;
  }

  // display particle
  display() {
    noStroke();
    fill(this.color);
    ellipse(this.x, this.y, this.size, this.size);
  }
}

// define jellyfish class
class Jellyfish {
  constructor(pos, rx, ry, nb, l, ts, td) {
    // give jellyfish object those attributes
    this.position = pos;
    this.radX = rx;
    this.radY = ry;
    this.orientation = 0;
    this.angleIncrement = 0.01;
    this.headClr = color(random(50, 200));
    this.tentacles = [];
    this.nbTentacles = nb;
    this.tentaclesLength = l;
    this.moveTime = 0;
    this.moveDuration = 0;
    this.dest = createVector();
    this.lastPos = createVector(0, 0);
    this.moveDistance = 0;
    this.reachedDest = true;
    this.rotating = true;
    this.desintegrating = false;
    this.cv = random(360);

    // using for loop create tentacle object and add it into tentacles array
    for (let i = 0; i < this.nbTentacles; i++) {
      let tx = this.position.x + (cos((i * TWO_PI) / this.nbTentacles) * this.radX) / 2;
      let ty = this.position.y + (sin((i * TWO_PI) / this.nbTentacles) * this.radY) / 2;
      let tr = atan2(ty - this.position.y, tx - this.position.x);
      let tentacle = new Tentacle(
        createVector(tx, ty),
        this.tentaclesLength,
        ts,
        ts,
        tr,
        td,
        this.cv
      );
      this.tentacles.push(tentacle);
    }
  }

  // update jellyfish
  update() {
    // set moving distance according to perlin noise between 100 to 600
    this.moveDistance = noise(xoff) * 500 + 100;
    // change rotation status every 60 frames
    if (frameCount % 60 == 0) this.rotating = !this.rotating;

    // using for loop to loop through tentacles array
    for (let i = 0; i < this.nbTentacles; i++) {
      let t = this.tentacles[i];
      // if jellyfish desintegrating is true, then set tentacles desintegrating to true and trigger the tentacles desintegrating
      if (this.desintegrating) {
        t.desintegrating = true;
        t.desintegrate();
      } else {
        // if jellyfish is not desintegrating then change it's moving direction
        t.position.x = this.position.x + (cos((i * TWO_PI) / this.nbTentacles + this.orientation) * this.radX) / 2;
        t.position.y = this.position.y + (sin((i * TWO_PI) / this.nbTentacles + this.orientation) * this.radY) / 2;
        t.orientation = this.rotating ? (t.orientation += this.angleIncrement) : atan2( t.position.y - this.position.y, t.position.x - this.position.x);
        t.update();
      }
    }

    // if jellyfish reach the destination
    if (this.reachedDest) {
      // save current location
      this.lastPos.x = this.position.x;
      this.lastPos.y = this.position.y;
      // set the destination to a random direction and set a moving distance
      this.dest = createVector(random(-1, 1), random(-1, 1));
      this.dest.normalize();
      this.dest.mult(this.moveDistance);
      this.moveDuration = int(this.dest.mag());

      // calculate the next destination
      let nextPos = p5.Vector.add(this.position, this.dest);
      // if next destination is outside the canvas then change to another direction
      if (nextPos.x > width) {
        this.dest.x = -abs(this.dest.x);
      }
      else if (nextPos.x < 0) {
        this.dest.x = abs(this.dest.x);
      }
      if (nextPos.y > height) {
        this.dest.y = -abs(this.dest.y);
      }
      else if (nextPos.y < 0) {
        this.dest.y = abs(this.dest.y);
      }
      this.reachedDest = false;
      this.moveTime = 0;
    } else {
      // using easing function to update location
      this.position.x = Penner.easeInOutBack(
        this.moveTime,
        this.lastPos.x,
        this.dest.x,
        this.moveDuration
      );
      this.position.y = Penner.easeInOutBack(
        this.moveTime,
        this.lastPos.y,
        this.dest.y,
        this.moveDuration
      );
      this.moveTime++;
      if (this.moveTime >= this.moveDuration - 10) this.reachedDest = true;
    }

    // fill colour
    fill(200);
    // draw tentacles
    for (let t of this.tentacles) {
      t.draw(this.moveTime);
      push();
      translate(10, 10);
      t.draw(this.moveTime);
      pop();
    }
  }
}

// define a tentacle class
class Tentacle {
  constructor(pos, nb, w, h, o, c, bg) {
    this.position = pos;
    this.orientation = o;
    this.angularVelocity = 0;
    this.nbParts = nb;
    this.compactness = c;
    this.parts = [];
    this.desintegrating = false; 
    this.cg = bg;

    for (let i = 0; i < this.nbParts; i++) {
      let part = new TentaclePart();
      part.width = ((this.nbParts - i) * w) / this.nbParts;
      part.height = ((this.nbParts - i) * h) / this.nbParts;
      part.position.x = this.position.x;
      part.position.y = this.position.y;
      part.position.x += this.compactness * i * cos(this.orientation);
      part.position.y += this.compactness * i * sin(this.orientation);
      part.clr = color(255, 255 - (255 / this.nbParts) * i);
      this.parts.push(part);
    }
  }

  // tentacles desintegrate
  desintegrate() {
    for (let p of this.parts) {
      p.update();
    }
  }
 
  // update tentacles position rotation
  update() {
    let pos0 = this.parts[0].position;
    let pos1 = this.parts[1].position;
    pos0.x = this.position.x;
    pos0.y = this.position.y;
    pos1.x = pos0.x + this.compactness * cos(this.orientation);
    pos1.y = pos0.y + this.compactness * sin(this.orientation);
    for (let i = 2; i < this.nbParts; i++) {
      let currentPos = createVector(
        this.parts[i].position.x,
        this.parts[i].position.y
      );
      let dist = p5.Vector.sub(currentPos, this.parts[i - 2].position);
      let distmag = dist.mag();
      let pos = createVector(
        this.parts[i - 1].position.x,
        this.parts[i - 1].position.y
      );
      let move = p5.Vector.mult(dist, this.compactness);
      move.div(distmag);
      pos.add(move);
      this.parts[i].position.set(pos);
    }
  }

  // draw tentacles
  draw(time) {
    push();
    colorMode(HSB, 360, 100, 100);
    beginShape();
    for (let p of this.parts) {
      if (this.desintegrating) {
        fill(255, 0, 0);
        ellipse(p.position.x, p.position.y, 3, 3);
      } else {
        stroke(this.cg, 100, 100);
        strokeWeight(5);
        let x1 = p.position.x + cos(45) * 15;
        let y1 = p.position.y + sin(45) * 15;
        let x2 = p.position.x + cos(-45) * 15;
        let y2 = p.position.y + sin(-45) * 15;
        noFill();
        curveVertex(x1, y1);
      }
    }
    endShape();
    pop();
    this.cg += 1;
    if (this.cg > 360) this.cg = 0;
  }
}

// define a tentaclePart class
class TentaclePart {
  constructor() {
    this.position = createVector(0, 0);
    this.velocity = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.width = 0;
    this.height = 0;
    this.clr = color(255);
  }

  // update tentacle parts position
  update() {
    this.position.add(this.velocity);
  }
}

// define a penner class by using easing function
class Penner {
  // define several functions under penner class
  // this will be convinient when later use
  
  static easeInOutCubic(t, b, c, d) {
    if ((t /= d / 2) < 1) {
      return (c / 2) * t * t * t + b;
    }
    return (c / 2) * ((t -= 2) * t * t + 2) + b;
  }

  static easeInOutBack(t, b, c, d) {
    let s = 1.70158;
    if ((t /= d / 2) < 1){
      return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    }
      
    return (c / 2) * ((t -= 2) * t * (((s -= 1.525) + 1) * t + s) + 2) + b;
  }

  static easeInOutSine(t, b, c, d) {
    return (-c / 2) * (cos((PI * t) / d) - 1) + b;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  console.log(123)
  // background()
  particles = [];
  // using for loop to create 2000 particle objects and add them into array
  for (let i = 0; i < 2000; i++) {
    let particle = new Particle(random(width), random(height));
    particles.push(particle);
  }
}