let infoMessage = `
Accept browser's microphone permission request.
Ensure device volume is turned up.
`

let fr = 30;

let sonar;
let isReady = false;

let mainGraph;
let windowLength;


async function setup() {
  console.log('Setup...');
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);

  mainGraph = new ScrollingLineGraph(width, 9/30 * height, fr*15);

  sonar = new BreathingSonarJS();
  await sonar.init();
  windowLength = fr * sonar.settings.windowLengthMillis/1000;
  isReady = true;
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

  let r = sonar.reading;
  text(JSON.stringify(r, null, space=' '), 7/8 * width, 150, 1/8 * width);

  mainGraph.push(r.normalized);
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
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


class ScrollingLineGraph {
  constructor(w, h, n, c=color('black'), highlightColor=color(0, 255, 0, 50)) {
    this.w = w;
    this.h = h;
    this.n = n;
    this.c = c;
    this.highlightColor = highlightColor;

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
    fill(this.highlightColor);

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
