// This provides access to all of the p5.js utility functions...
function setup() {
  noCanvas();
}


let main = async function () {
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

  // Create an Web Audio API oscillator to generate sonar signal
  //// TODO: This can be accomplished more succiently by handing a
  //// JSON params object into the generic constructor, instead of using this factory method...
  let oscillator = audioContext.createOscillator();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(20000, audioContext.currentTime);
  oscillator.connect(audioContext.destination);
  oscillator.start();

  // Create an analyzer to process the sonar signal
  //// TODO: Can I configure this to use a band pass filter ~20Khz
  let audioAnalyser = audioContext.createAnalyser();
  audioSource.connect(audioAnalyser);
  audioAnalyser.fftSize = 256;

  // This buffer is used to store FFT output for each frame of the visualization
  let binCount = audioAnalyser.frequencyBinCount;
  let fftBuffer = new Uint8Array(binCount);
  let fftLabels = Array.from(new Array(binCount), (x, i) => i/binCount * audioContext.sampleRate/2);

  // Log recording to a CSV file
  // To mininize latency from file I/O, buffer all readings into memory then batch dump to csv at the end of the recording
  let samples = new Map();

  let logFFTSample = function() {
    // compute PSD for current audio sample...
    audioAnalyser.getByteFrequencyData(fftBuffer);
    // ... and store it in a dictionary using current tod as key
    samples.set(new Date().getTime(), Array.from(fftBuffer));
  };

  let writeSamplesToFile = function() {
    let writer = createWriter('BreathingSonarLog-' + new Date().getTime() + '.csv');
    writer.print('tod, ' + fftLabels.join(', '));
    samples.forEach(function (powers, tod) {
      writer.print(tod + ', ' + powers.join(', '));
    });
    writer.close();
    writer.clear();
  }

  // Register callbacks to asynchronously log data and dump readings to csv file
  // All times expressed in ms
  setInterval(logFFTSample, 1);
  setTimeout(writeSamplesToFile, 600000);
};

main();
