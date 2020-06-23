// A data structure to hold FFT readings
// Buffer readings to mininize I/O latency
let samples = new Map();

// Globals used to perform FFT analysis and buffer data
let audioAnalyser;
let fftBuffer;
let fftLabels;

// Globals used to implement a recording "toggle switch"
let isRecording = false;
let recordingColors = {true: '#85f081', false: '#ff947a'};
let recordingMessages = {true: 'Recording...', false: 'Tap to Start Recording...'}


// Global flag to indicite BreathingSonar is initialized
// TODO: Shouldn't there be an easier way to do this with preload()
let isBreathingSonarInitialized = false;

async function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(20);
  background(recordingColors[isRecording]);

  await initializeBreathingSonar();
  isBreathingSonarInitialized = true;
}

function draw() {
  if (!isBreathingSonarInitialized) {
    return;
  }

  clear();
  background(recordingColors[isRecording]);
  text(recordingMessages[isRecording], 20, 60)

  audioAnalyser.getByteFrequencyData(fftBuffer);
  if (isRecording) {
    samples.set(new Date().getTime(), Array.from(fftBuffer));
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
  isRecording = !isRecording;
  if (!isRecording) {
    writeSamplesToFile();
    samples = new Map();
  }
}


async function initializeBreathingSonar() {
  // Request audio / video permission from user
  // Note that the interval / timeout counters below will not begin user handles this dialog box
  // Note that in order to access media devices, page must be served through https, otherwise errors out with an unintuitive error message
  const stream = await navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
  });

  // Create an audio context and source using the Web Audio API
  // Constructor arguments:
  //// latencyHint: interactive -- tells the application to favor low latency at the expense of power consumption
  //// sampleRate: 44100 (i.e., 44.1KHz) -- ensures sufficient FFT resoltion to detect 20KHz sonar signal (nyquest)
  let audioContext = new window.AudioContext({latencyHint: 'interactive', sampleRate: 44100});
  let audioSource = audioContext.createMediaStreamSource(stream);

  // Create an analyzer to process the sonar signal
  // Requires an array to store readings in, as well as bin labels for column headers
  audioAnalyser = audioContext.createAnalyser();
  audioSource.connect(audioAnalyser);
  audioAnalyser.fftSize = 256;

  let binCount = audioAnalyser.frequencyBinCount;
  fftBuffer = new Uint8Array(binCount);
  fftLabels = Array.from(new Array(binCount), (x, i) => i/binCount * audioContext.sampleRate/2);
}

function writeSamplesToFile() {
  let writer = createWriter('BreathingSonarLog-' + new Date().getTime() + '.csv');
  writer.print('tod, ' + fftLabels.join(', '));
  samples.forEach(function (powers, tod) {
    writer.print(tod + ', ' + powers.join(', '));
  });
  writer.close();
  writer.clear();
}
