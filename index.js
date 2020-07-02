let infoMessage = `
Accept browser's microphone permission request.
Ensure device volume is turned up.
`

let trainingData = [
  {'label': 'stack', 'data': [34.054596101348054,30.455686154779492,27.239007180841128,24.074126880827283,21.187719631173533,18.513214437610394,16.239011806542138,14.269416518774493,12.770667212137276,11.630204753633196,10.523320860480633,9.441988334073823,8.380098935619069,7.572061868540532,8.152478017345754,15.287743754178063,25.259359922841846,35.95493312225236,46.24516730018311,55.509790006898044,63.75492384959861,70.74617055839673,76.78328091024426,81.61623364635847,85.53289134314622]},
  {'label': 'stack', 'data': [17.536300480392114,17.647151200139184,17.970559478198965,18.216654671213057,18.403919030641262,18.307359268612643,17.994825591596403,17.757005347692505,17.336980527404002,17.017365674501246,16.774157060958164,16.589089223326894,16.68732041275008,16.762068726757782,17.05800513995991,18.71753915752076,22.849036263684283,29.817784720063774,38.46740464896955,47.20078546487963,55.519789075478215,63.04536089777325,69.72811930859035,75.53048771848862,80.42387249317161]},
  {'label': 'stack', 'data': [10.87991293131494,11.625792283378402,12.193363788389032,12.625253225211281,13.192953595970708,13.863998315864317,14.374624948101546,15.002239818945156,15.240761597657425,15.422263022180056,15.79943244368561,15.84737956684451,15.883864583860921,15.911627594006001,15.932753656026723,16.905058274757696,19.557384239716498,24.205281983099283,32.045096221314985,40.64037569383687,49.093349308385235,56.72086463743871,63.48119622332344,69.342593380431,74.5199528775129]},
  {'label': 'stack', 'data': [18.655714633319736,18.49896131359742,18.618738230890365,18.70988161088261,18.77923650750342,19.07106883870494,19.293136543049588,19.462117358540006,19.590702089435815,19.688547711564944,19.76300263092542,19.819658563979424,19.862770486976466,19.895576193357318,19.920539458652176,21.373878416717517,25.348472881830766,32.43688463051733,40.93850425369246,49.32020808244269,57.13254840642895,64.03352123710398,70.2409955571078,75.44264274775823,80.1179702736415]},
  {'label': 'stack', 'data': [16.28908498503511,16.219977131125077,16.406447232511162,16.548340309173483,16.895370044490022,17.159439814771435,17.838496246151237,18.83333377959178,19.59034821434432,20.166392880091703,20.60472990736977,20.93827930190098,21.192091304238534,21.3852277139782,22.010307917048742,24.637473194735428,28.788110647668127,36.010481036269894,44.374978295212735,52.65233985141899,60.14622445323019,66.80487070251625,72.58889113727435,77.46831415281305,81.65939029665635]},
  {'label': 'stack', 'data': [14.975623240838335,14.264279010372084,13.483929533061888,12.89012823524352,12.199222203447345,11.673482249388242,11.03436700547703,10.308979653731813,9.757001388337116,9.33697751456112,9.01736338190022,8.774155316419971,8.589087895833158,8.448262178992621,8.341101867032968,9.215787896174398,10.598545582490283,14.519431738717413,22.523203432167755,31.960416816717675,41.29311118343166,49.82910088769602,57.51978671054296,64.32818742736079,70.22616244241918]},
  {'label': 'stack', 'data': [18.040873765794387,15.879587584328872,13.995915253221963,12.323491176171055,10.811814932068918,9.422458590269382,8.365237918146345,7.321696261034179,6.288563551582657,5.502408679274002,4.6651325844567815,4.028013388262165,3.5432021382189074,2.9352312959755293,3.667886393368546,4.703509444535946,9.555532125765737,19.224074326191854,29.928082802370966,40.224735743225615,49.73329998483155,58.164059376368726,65.53561372927805,71.62305921210697,76.73337132615075]},
  {'label': 'stack', 'data': [21.474581853491607,19.209614620723695,17.007989718969085,15.0936219300494,13.397840366107898,11.868390411081755,10.704566515955653,9.579905906359487,8.724103539597683,7.833829686982724,7.156382229827088,6.6408834809211985,6.248618431703535,5.950127176071356,8.352621871000244,14.96192732663379,23.33803170059824,32.819511725188356,42.42494769548664,51.168478152819304,58.778033388909286,65.28564114817948,70.95472993500324,75.98575376687849,80.05313223319712]},
  {'label': 'stack', 'data': [8.657395569969786,8.97835485742022,9.222586508720688,9.6474900431541,10.20987454195418,10.637816963869426,10.963456658536378,11.211249831898817,11.39980625720755,11.543286906988019,11.8915246946008,12.156513723550542,12.358155210952265,12.511592844211005,14.062693444529645,16.19922113623799,19.97651146229538,27.871014946058434,37.22508147575782,46.4945058438938,54.98235069977805,62.6364010480298,69.17786704148413,74.8727200070316,79.68429168098558]},
  {'label': 'stack', 'data': [4.909734579761265,5.170370404122277,5.368699351938063,5.758673555738065,6.05542160909785,6.0421726730988805,6.032090990955621,6.024419407754854,6.257638995545449,6.435105756187195,6.8092050293574315,7.332930392539503,7.7314554244647695,8.751881839550686,10.484596843389907,13.23743715076687,17.005591662493522,24.893143314335163,34.72003434497265,44.34925110159737,53.11087737650199,60.973259717866895,67.67325443657147,73.24968146683763,77.97113778080214]},
];

let fr = 30;

let sonar;
let sonarRange = 50;
let isReady = false;

let trainColor;
let trainColorFaint;
let recognizeColor;


let mainWave;
let derivativeWave;
let trainingWaves;
let trainingCountdown;

let windowLength;


async function setup() {
  console.log('Setup...');
  createCanvas(windowWidth, windowHeight);
  frameRate(fr);
  trainColor = color(255, 255, 0, 50);
  trainColorFaint = color(255, 255, 0, 15);
  recognizeColor = color(0, 255, 0, 50);

  mainWave = new Wave(width, 9/30 * height, fr*10);
  derivativeWave = new Wave(width, 9/30 * height, fr*10, c=color(200));

  trainingWaves = [];
  trainingCountdown = 0;

  sonar = new BreathingSonarJS();
  await sonar.init();
  sonar.trainingData = trainingData;

  windowLength = fr * sonar._windowLengthMillis/1000;

  sonar.register('stack', function() {
    mainWave.addHighlight(mainWave.n - windowLength, recognizeColor, label='stack');
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

  textAlign(CENTER, CENTER);
  textSize(32);
  text('Breathing Sonar JS (' + nf(frameRate(), 2, 1) + 'fps)' , width/2, 50);

  textSize(14);
  text('Click to record a breathing pattern...', width/2, 75);

  textSize(12);
  strokeWeight(0.5)
  text(infoMessage, width/2, 100);

  let w = sonar.wave;

  derivativeWave.push(w.derivative);
  mainWave.push(w.filtered);

  if (trainingCountdown > 0) {
    trainingWaves[trainingWaves.length-1].push(w.filtered);
    trainingCountdown -= 1;
    if (trainingCountdown == 0) {
      sonar.train('stack');
    }
  }

  derivativeWave.draw(0, 2/3 * height);
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
  if (trainingCountdown > 0) {
    return;
  }

  mainWave.addHighlight(mainWave.dataPoints.length, trainColor, label='stack');
  trainingWaves.push(new Wave(width/4, 2/32 * height, windowLength));
  trainingWaves[trainingWaves.length-1].addHighlight(0, trainColorFaint);
  while (trainingWaves.length > 10) {
    trainingWaves.shift();
  }
  trainingCountdown = windowLength;
}

function keyPressed() {
  if (keyIsDown(CONTROL) && key == 's') {
    exportTrainingData();
  }
}

function exportTrainingData() {
  let writer = createWriter('BreathingPatterns-' + Date.now() + '.csv');
  let trainingData = Array.from(sonar.trainingData);
  trainingData.forEach(d => writer.print(d.label + ',' + d.data.join(',')));
  writer.close();
  writer.clear();
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
    this._drawWave(x, y);
    this.highlights.forEach(highlight => this._drawHighlight(x, y, highlight));
  }

  _drawWave(x, y) {
    stroke(0);
    strokeWeight(1);

    // Draw border
    noFill();
    rect(x, y, this.w, this.h);

    // Scale y-axis limits
    let _min = min(this.dataPoints);
    let _max = max(this.dataPoints);

    // Draw waveform w/ scaled y-axis
    stroke(this.c);
    let _px = x;
    let _py = y + this.h/2;
    this.dataPoints.forEach((d, i) => {
      let _x = x + i*(this.w/this.n);
      let _y = y + this.h/2 + map(d, _min, _max, -this.h/2, this.h/2);
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
