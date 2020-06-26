import { Point, Rectangle, Unistroke, Result, DollarRecognizer } from './lib/dollar.js';


export default class BreathingSonarJS {

  constructor() {
    // Used to perform FFT calculations
    this._audioAnalyser = null;

    this._fftSize = 256;
    this._samplingRateHz = 20;
    this._lastSampleTime = Date.now();
    this._windowLengthMillis = 2000;

    this._fftBuffer = null;
    this._fftLabels = null;
    this._sonarIndex = -1;

    this._rollingWindow = [];
    this._rollingWindowDerivative = [];
    this._windowCount = Math.ceil(this._windowLengthMillis / this._samplingRateHz);

    this._dollarRecognizer = new DollarRecognizer();
    this._registeredCallbacks = new Map();
  }

  async init() {
    // Request audio / video permission from user
    // Note that the interval / timeout counters below will not begin user handles this dialog box
    // Note that in order to access media devices, page must be served through https, otherwise errors out with an unintuitive error message
    // Note the explicit disabling of several default audio settings that interfere with sonar detection
    let stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: true,
    });

    // Create an audio context and source using the Web Audio API
    // Constructor arguments:
    //// latenctyHint: interacive -- tells the application to favor low latency at the expense of power consumption
    //// sampleRate: 44100 (i.e., 44.1KHz) -- ensures sufficient FFT resoltion to detect 20KHz sonar signal (nyquest)
    let audioContext = new window.AudioContext({latencyHint: 'interactive', sampleRate: 44100});
    let audioSource = audioContext.createMediaStreamSource(stream);

    // Create an Web Audio API oscillator to generate sonar signal
    //// TODO: This can be accomplished more succiently by handing a
    //// JSON params object into the generic constructor, instead of using this factory method...
    let oscillator = audioContext.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(20000, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();

    // Create an analyser to process the sonar signal
    // Requires an array to store readings in, as well as bin labels for column headers
    this._audioAnalyser = audioContext.createAnalyser();
    audioSource.connect(this._audioAnalyser);
    this._audioAnalyser.fftSize = this._fftSize;

    // Initialize array used to store FFT calculations
    // TODO: can I eliminate binCount and just use this._fftSize? (i.e., are they the same in all situations?)
    let binCount = this._audioAnalyser.frequencyBinCount;
    this._fftBuffer = new Uint8Array(binCount);

    // Identify FFT frequency bin corresponding to the sonar signal
    this._fftLabels = Array.from(new Array(binCount), (x, i) => i/binCount * audioContext.sampleRate/2);
    this._sonarIndex = 0;
    while (this._fftLabels[this._sonarIndex] < 20000) {
      this._sonarIndex++;
    }

    // ".bind(this)" preserves the namespace of the current object...
    // In otherwords, tells JS to call the *method* bound to the current object, and not an unbound *function*
    setInterval(this.process.bind(this), 1000/this._samplingRateHz);
  }

  process() {
    // Compute FFT
    this._audioAnalyser.getByteFrequencyData(this._fftBuffer);

    // Push current sonar reading into rolling window
    // TODO: Extract or find a reusable bounded-list data structure
    let sonarReading = this._fftBuffer[this._sonarIndex];
    this._rollingWindow.push(sonarReading);
    while (this._rollingWindow.length > this._windowCount) {
      this._rollingWindow.shift();
    }

    // Compute derivative of signal as reading[n] - reading[n-1] (defer if this is the first reading ever)
    if (this._rollingWindow.length > 1) {
      let previousReading = this._rollingWindow[this._rollingWindow.length-2];
      let sonarDerivative = sonarReading - previousReading;
      this._rollingWindowDerivative.push(sonarDerivative);
      while (this._rollingWindowDerivative.length > this._windowCount) {
        this._rollingWindowDerivative.shift();
      }
    }

    // Reshape data into format expected by $1 Recognizer
    let windowSnapshot = Array.from(this._rollingWindow);
    let points = [];
    windowSnapshot.forEach(function (value, index) {
      points.push(new Point(index, value));
    });

    // Test for breathing patterns using the $1 Gesture Recognizer library
    //// Boolean param specifies whether to use "Protractor" algorithm - a performance enhancement
    let recognizedPattern = this._dollarRecognizer.Recognize(points, true);
    if (this._registeredCallbacks.has(recognizedPattern.Name)) {
      let callbacks = this._registeredCallbacks.get(recognizedPattern.Name);
      callbacks.forEach(callback => callback());
    }
  }

  train(breathingPatternLabel) {
    // Reshape data into format expected by $1 Recognizer
    let windowSnapshot = Array.from(this._rollingWindow);
    let trainingPoints = [];
    windowSnapshot.forEach(function (value, index) {
      trainingPoints.push(new Point(index, value));
    });

    // Add training data to the $1 Recognizer
    this._dollarRecognizer.AddGesture(breathingPatternLabel, trainingPoints);
  }

  register(breathingPatternLabel, callback) {
    if (!this._registeredCallbacks.has(breathingPatternLabel)) {
      this._registeredCallbacks.set(breathingPatternLabel, []);
    }
    this._registeredCallbacks.get(breathingPatternLabel).push(callback);
  }

  get wave() {
    if (this._rollingWindow.length == 0) {
      return 0;
    }
    return this._rollingWindow[this._rollingWindow.length-1];
  }
}