let infoMessage = `
Accept browser's microphone permission request.
Ensure device volume is turned up.
`

let fr = 30;

let sonar;
let sonarRange = 50;
let isReady = false;

let trainColor;
let trainColorFaint;
let recognizeColor;


let mainWave;
let trainingWaves;
let trainingCountdown;


async function setup() {
  console.log('Setup...');
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  trainColor = color(255, 255, 0, 50);
  trainColorFaint = color(255, 255, 0, 15);
  recognizeColor = color(0, 255, 0, 50);

  mainWave = new Wave(width, 9/30 * height, fr*10);

  trainingWaves = [];
  trainingCountdown = 0;

  sonar = new BreathingSonarJS();
  await sonar.init();
  sonar.register('stack', function() {
    mainWave.addHighlight(mainWave.n - fr*2, recognizeColor);
  });

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

  textAlign(CENTER);
  textSize(32);
  text('Breathing Sonar JS (' + nf(frameRate(), 2, 1) + 'fps)' , width/2, 50);

  textSize(14);
  text('Click to record a breathing pattern...', width/2, 75);

  textSize(12);
  strokeWeight(0.5)
  text(infoMessage, width/2, 100);

  let w = sonar.wave;

  mainWave.push(w.filtered);

  if (trainingCountdown > 0) {
    trainingWaves[trainingWaves.length-1].push(w.filtered);
    trainingCountdown -= 1;
    if (trainingCountdown == 0) {
      sonar.train('stack');
    }
  }

  mainWave.draw(0, 2/3 * height);
  trainingWaves.forEach((wave, index) => {
    let _x = 50;
    let _y = index * 2/30 * height;
    wave.draw(_x, _y);
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
  mainWave.addHighlight(mainWave.dataPoints.length, trainColor);
  trainingWaves.push(new Wave(width/4, 2/32 * height,fr*2));
  trainingWaves[trainingWaves.length-1].addHighlight(0, trainColorFaint);
  while (trainingWaves.length > 10) {
    trainingWaves.shift();
  }
  trainingCountdown = fr*2;
}

class Wave {
  constructor(w, h, n) {
    this.w = w;
    this.h = h;
    this.n = n;

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

  addHighlight(n, c) {
    this.highlights.push(new Highlight(n, c));
  }

  draw(x, y) {
    this._drawWave(x, y);
    this.highlights.forEach(highlight => this._drawHighlight(x, y, highlight));
  }

  _drawWave(x, y) {
    stroke(0);
    strokeWeight(1);

    // Draw border
    fill(250);
    rect(x, y, this.w, this.h);

    // Scale y-axis limits
    let _min = min(this.dataPoints);
    let _max = max(this.dataPoints);

    // Draw waveform w/ scaled y-axis
    noFill();
    let _px = x;
    let _py = y + this.h/2;
    this.dataPoints.forEach((d, i) => {
      let _x = x + i*(this.w/this.n);
      let _y = y + this.h/2 + map(d, _min, _max, this.h/2, -this.h/2);
      line(_px, _py, _x, _y);
      _px = _x;
      _py = _y;
    });
  }

  _drawHighlight(x, y, highlight) {
    noStroke();
    fill(highlight.c);
    let _x = x + highlight.n*(this.w/this.n);
    let _y = y;
    let _w = 2*fr*(this.w/this.n);
    let _h = this.h;
    rect(_x, _y, _w, _h);
  }
}


class Highlight {
  constructor(n, c) {
    this.n = n;
    this.c = c;
  }
}