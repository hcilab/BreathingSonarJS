// Global Web Audio oscillator that is used to specify emitted frequency
let audioContext;
let oscillator;
let endTime = 0;

// Globals used to implement "toggle switch"
let isEmitting = false;
let colors = {true: '#85f081', false: '#ff947a'};
let messages = {true: 'Emitting an increasing audio tone...', false: 'Tap to Start...'}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(colors[isEmitting]);

  initializeOscillator();
}

function draw() {
  clear();
  background(colors[isEmitting]);
  text(messages[isEmitting], 20, 60);

  if (isEmitting) {
    text(nf(oscillator.frequency.value, 5, 1) + " Hz", 40, 80);
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mouseClicked() {
  isEmitting = !isEmitting;
  if (isEmitting) {
    endTime = audioContext.currentTime + 120; // i.e., + 2 minutes -- currentTime expressed in seconds
    oscillator.frequency.setValueAtTime(0, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(24000, endTime);
    oscillator.start();
  } else {
    oscillator.stop();
  }
}


function initializeOscillator() {
  // Create an audio context using the Web Audio API
  // Constructor arguments:
  //// latencyHint: interactive -- tells the application to favor low latency at the expense of power consumption
  //// sampleRate: 44100 (i.e., 44.1KHz) -- ensures sufficient FFT resoltion to detect 20KHz sonar signal (nyquest)
  audioContext = new window.AudioContext({latencyHint: 'interactive', sampleRate: 44100});

  // Create an Web Audio API oscillator to generate sonar signal
  //// TODO: This can be accomplished more succiently by handing a
  //// JSON params object into the generic constructor, instead of using this factory method...
  oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.value = 0;
  oscillator.connect(audioContext.destination);
  oscillator.start();
}
