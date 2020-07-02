let infoMessage = `
Accept browser's microphone permission request.
Ensure device volume is turned up.
`

let fr = 30;

let sonar;
let isReady = false;

let recognizeColor;


let mainGraph;
let derivativeGraph;
let windowLength;


async function setup() {
  console.log('Setup...');
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  recognizeColor = color(0, 255, 0, 50);

  mainGraph = new ScrollingLineGraph(width, 9/30 * height, fr*15);
  derivativeGraph = new ScrollingLineGraph(width, 9/30 * height, fr*15, c=color(200));

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

  let w = sonar.wave;
  text(JSON.stringify(w, null, space=' '), 7/8 * width, 150, 1/8 * width);

  derivativeGraph.push(w.derivative);
  mainGraph.push(w.normalized);

  derivativeGraph.draw(0, 2/3 * height);
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
  constructor(w, h, n, c=color('black')) {
    this.w = w;
    this.h = h;
    this.n = n;
    this.c = c;

    this.dataPoints = [];
    this.highlights = [];
  }

  push(dataPoint) {
    this.dataPoints.push(dataPoint);
    while(this.dataPoints.length > this.n) {
      this.dataPoints.shift();
      this.highlights.forEach((highlight, index) => {
        highlight.n -= 1;
        // TODO: remove from list if < 0
      });
    }
  }

  addHighlight(n, c, label='') {
    this.highlights.push(new Highlight(n, c, label));
  }

  draw(x, y) {
    this._drawBorder(x, y);
    this._drawLine(x, y);
    this.highlights.forEach(highlight => this._drawHighlight(x, y, highlight));
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

    // Scale y-axis limits
    let _min = min(this.dataPoints);
    let _max = max(this.dataPoints);

    // Draw waveform w/ scaled y-axis
    let _px = x;
    let _py = y + this.h/2;
    this.dataPoints.forEach((d, i) => {
      let _x = x + i*(this.w/this.n);
      let _y = y + this.h/2 - map(d, _min, _max, -this.h/2, this.h/2);
      let _zero = y + this.h/2 - map(0, _min, _max, -this.h/2, this.h/2);
      line(_px, _py, _x, _y);
      point(_x, _zero);
      _px = _x;
      _py = _y;
    });
  }

  _drawHighlight(x, y, highlight) {
    noStroke();
    fill(highlight.c);

    let _x = x + highlight.n*(this.w/this.n);
    let _y = y;
    let _w = windowLength*(this.w/this.n);
    let _h = this.h;
    rect(_x, _y, _w, _h);

    fill(0);

    textAlign(LEFT, TOP);
    textSize(12);
    text(highlight.label, _x, _y);
  }
}


class Highlight {
  constructor(n, c, label='') {
    this.n = n;
    this.c = c;
    this.label = label;
  }
}
