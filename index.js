let infoMessage = `
Accept browser's microphone permission request.
Ensure device volume is turned up.
`

let fr = 30;

let sonar;
let isReady = false;

let recognizeColor;

let mainGraph;
let windowLength;

let player;
let wasForcefulBreathing = false;


async function setup() {
  console.log('Setup...');
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  recognizeColor = color(0, 255, 0, 50);

  mainGraph = new ScrollingLineGraph(width, 9/30 * height, fr*15);

  sonar = new BreathingSonarJS();
  await sonar.init();
  windowLength = fr * sonar.settings.windowLengthMillis/1000;
  isReady = true;

  player = new Player(width/2, height/2);
}

function draw() {
  if (!isReady) {
    return;
  }

  clear();
  background(255);

  stroke(0);
  strokeWeight(1);
  fill(0);

  textAlign(CENTER, CENTER);
  textSize(32);
  text('Breathing Sonar JS (' + nf(frameRate(), 2, 1) + 'fps)' , width/2, 50);

  textSize(12);
  strokeWeight(0.5)
  text(infoMessage, width/2, 100);

  textAlign(LEFT, CENTER);
  text(JSON.stringify(sonar.settings, null, space=' '), 7/8 * width, 50, 1/8 * width);

  let w = sonar.wave;
  text(JSON.stringify(w, null, space=' '), 7/8 * width, 150, 1/8 * width);

  mainGraph.push(w.normalized);
  mainGraph.draw(0, 2/3 * height);

  if (millis() < sonar.settings.windowLengthMillis) {
    noStroke();
    fill(color(255, 200));
    rect(0, 0, width, height);

    stroke(0);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(40);
    text('Initializing Rolling Window...', width/2, height/2);
  }

  if (!wasForcefulBreathing && sonar.isForcefulBreathing) {
    player.jump();
  }
  wasForcefulBreathing = sonar.isForcefulBreathing;

  player.update();
  if (player.pos.y > height || player.pos.y < 0 - height/2) {
    player.reset();
  }
  player.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


class ScrollingLineGraph {
  constructor(w, h, n, c=color('black')) {
    this.w = w;
    this.h = h;
    this.n = n;
    this.c = c;

    this.dataPoints = [];
  }

  push(dataPoint) {
    this.dataPoints.push(dataPoint);
    while(this.dataPoints.length > this.n) {
      this.dataPoints.shift();
    }
  }

  draw(x, y) {
    this._drawBorder(x, y);
    this._drawLine(x, y);
    this._drawHighlights(x, y);
  }

  _drawBorder(x, y) {
    stroke(0);
    strokeWeight(1);

    // Draw border
    noFill();
    rect(x, y, this.w, this.h);
  }

  _drawLine(x, y) {
    stroke(this.c);

    // Draw waveform [-1.0, 1.0]
    let _px = x;
    let _py = y + this.h/2;
    this.dataPoints.forEach((d, i) => {
      let _x = x + i*(this.w/this.n);
      let _y = y + this.h/2 - map(d, -1, 1, -this.h/2, this.h/2);
      let _zero = y + this.h/2 - map(0, -1, 1, -this.h/2, this.h/2);
      line(_px, _py, _x, _y);
      point(_x, _zero);
      _px = _x;
      _py = _y;
    });
  }

  _drawHighlights(x, y) {
    noStroke();
    fill(recognizeColor);

    let i = 0;
    while (i < this.dataPoints.length) {
      if (this.dataPoints[i] > 0) {
        let start = i;
        while (i < this.dataPoints.length && this.dataPoints[i] > 0){
          i++;
        }
        let _x = x + (start*(this.w/this.n));
        let _width = (i-start) * (this.w/this.n);
        rect(_x, y, _width, this.h);
      }
      i++;
    }
  }
}

class Player {
  constructor(x, y) {
    this.orig = createVector(x, y);
    this.radius = 50;
    this.reset();
  }

  reset() {
    this.pos = createVector(this.orig.x, this.orig.y);
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0.25);
    this.respond = false;
  }

  update(elapsedTimeMillis) {
    if (this.respond) {
      this.pos.add(this.vel);

      if (this.isJumping) {
        this.vel.add(p5.Vector.mult(this.acc, 0.25));
      } else {
        this.vel.add(this.acc);
      }
    }
  }

  draw() {
    ellipseMode(CENTER);

    stroke(0);
    if (this.isJumping) {
      fill(200, 200);
    } else {
      fill(0, 200);
    }

    ellipse(this.pos.x, this.pos.y, this.radius);
  }

  jump() {
    this.respond = true;
    this.vel.add(createVector(0, -10));
  }

  get isJumping() {
    return sonar.isForcefulBreathing;
  }
}
