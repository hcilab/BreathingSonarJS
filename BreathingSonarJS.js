class BreathingSonarJS {

  constructor() {
    // Used to perform FFT calculations
    this._audioAnalyser = null;

    this.settings = {
      'sonarFrequency': 20000,
      'fftSize': 256,
      'samplingRateHz': 20,
      'windowLengthMillis': 10000,
      'forcefulBreathingThreshold': 0.2,
    }

    this._fftBuffer = null;
    this._fftLabels = null;
    this._sonarIndex = -1;

    this._rollingWindow = [];
    this._windowCount = Math.ceil(this.settings.windowLengthMillis / this.settings.samplingRateHz);

    this._oneEuroFilter = new OneEuroFilter(this.settings.samplingRateHz);
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
    oscillator.frequency.setValueAtTime(this.settings.sonarFrequency, audioContext.currentTime);
    oscillator.connect(audioContext.destination);
    oscillator.start();

    // Create an analyser to process the sonar signal
    // Requires an array to store readings in, as well as bin labels for column headers
    this._audioAnalyser = audioContext.createAnalyser();
    audioSource.connect(this._audioAnalyser);
    this._audioAnalyser.fftSize = this.settings.fftSize;

    // Initialize array used to store FFT calculations
    // TODO: can I eliminate binCount and just use this._fftSize? (i.e., are they the same in all situations?)
    let binCount = this._audioAnalyser.frequencyBinCount;
    this._fftBuffer = new Uint8Array(binCount);

    // Identify FFT frequency bin corresponding to the sonar signal
    this._fftLabels = Array.from(new Array(binCount), (x, i) => i/binCount * audioContext.sampleRate/2);
    this._sonarIndex = 0;
    while (this._fftLabels[this._sonarIndex] < this.settings.sonarFrequency) {
      this._sonarIndex++;
    }

    // ".bind(this)" preserves the namespace of the current object...
    // In otherwords, tells JS to call the *method* bound to the current object, and not an unbound *function*
    setInterval(this.process.bind(this), 1000/this.settings.samplingRateHz);
  }

  process() {
    // Compute FFT
    this._audioAnalyser.getByteFrequencyData(this._fftBuffer);

    // Read raw sonar power from FFT
    let sonarReading = this._fftBuffer[this._sonarIndex];

    //// Note that this can report garbage values during early initialization
    //// If this occurs, explicitly assign the mid-point reading (i.e., 255 / 2)
    if (!isFinite(sonarReading)) {
      sonarReading = 128;
    }

    // Filter raw sonar reading using the One Euro Filter
    //// TODO: I am currently using all default filter params - better performance may be possible
    let filteredSonarReading = this._oneEuroFilter.filter(sonarReading);

    // Compute derivative of signal (i.e., r[n] - r[n-1])
    let derivativeSonarReading = 0;
    if (this._rollingWindow.length > 0) {
      let previousReading = this._rollingWindow[this._rollingWindow.length-1];
      derivativeSonarReading = filteredSonarReading - previousReading.filtered;
    }

    // Compute normalized reading (i.e., within range [-1.0, 1.0] based on min and max values in rollingWindow)
    let filteredReadings = this._rollingWindow.map(r => r.filtered);
    let _min = Math.min(...filteredReadings);
    let _max = Math.max(...filteredReadings);
    let range = _max - _min;
    let offset = (_max+_min) / 2;
    let normalizedSonarReading = (filteredSonarReading-offset) / range;

    //// Since there is a possibility for divisions including 0, clip and clean as needed
    normalizedSonarReading = Math.max(normalizedSonarReading, -1.0);
    normalizedSonarReading = Math.min(normalizedSonarReading, 1.0);
    if (!isFinite(normalizedSonarReading)) {
      normalizedSonarReading = 0;
    }

    // Convert to a square wave of "forceful breathing" by thresholding normalized reading
    let squareSonarReading = normalizedSonarReading > this.settings.forcefulBreathingThreshold ? 1 : 0;

    // Push current sonar reading into rolling window
    // TODO: Extract or find a reusable bounded-list data structure
    this._rollingWindow.push({'raw': sonarReading, 'filtered': filteredSonarReading, 'derivative': derivativeSonarReading, 'normalized': normalizedSonarReading, 'square': squareSonarReading});
    while (this._rollingWindow.length > this._windowCount) {
      this._rollingWindow.shift();
    }

  }

  get reading() {
    if (this._rollingWindow.length == 0) {
      return {'raw': 0, 'filtered': 0, 'derivative': 0, 'normalized': 0, 'square': 0};
    }
    return this._rollingWindow[this._rollingWindow.length-1];
  }

  get isForcefulBreathing() {
    return this.reading.square > 0;
  }
}










/**
 * Author: Gery Casiez
 * Details: http://cristal.univ-lille.fr/~casiez/1euro/
 *
 * Copyright 2019 Inria
 * 
 * BSD License https://opensource.org/licenses/BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  1. Redistributions of source code must retain the above copyright notice, this list of conditions
 * and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions
 * and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * 
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.

 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, 
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

class LowPassFilter {
    
  setAlpha(alpha) {
    if (alpha<=0.0 || alpha>1.0) 
      console.log("alpha should be in (0.0., 1.0]");
    this.a = alpha;
  }

  constructor(alpha, initval=0.0) {
    this.y = this.s = initval;
    this.setAlpha(alpha);
    this.initialized = false;
  }

  filter(value) {
    var result;
    if (this.initialized)
      result = this.a*value + (1.0-this.a) * this.s;
    else {
      result = value;
      this.initialized = true;
    }
    this.y = value;
    this.s = result;
    return result;
  }

  filterWithAlpha(value, alpha) {
    this.setAlpha(alpha);
    return this.filter(value);
  }

  hasLastRawValue() {
    return this.initialized;
  }

  lastRawValue() {
    return this.y;
  }

  reset() {
    this.initialized = false;
  }

}

// -----------------------------------------------------------------

class OneEuroFilter {

  alpha(cutoff) {
    var te = 1.0 / this.freq;
    var tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau/te);
  }

  setFrequency(f) {
    if (f<=0) console.log("freq should be >0") ;
    this.freq = f;
  }

  setMinCutoff(mc) {
    if (mc<=0) console.log("mincutoff should be >0");
    this.mincutoff = mc;
  }

  setBeta(b) {
    this.beta_ = b;
  }

  setDerivateCutoff(dc) {
    if (dc<=0) console.log("dcutoff should be >0") ;
    this.dcutoff = dc ;
  }

  constructor(freq, mincutoff=1.0, beta_=0.0, dcutoff=1.0) {
    this.setFrequency(freq) ;
    this.setMinCutoff(mincutoff) ;
    this.setBeta(beta_) ;
    this.setDerivateCutoff(dcutoff) ;
    this.x = new LowPassFilter(this.alpha(mincutoff)) ;
    this.dx = new LowPassFilter(this.alpha(dcutoff)) ;
    this.lasttime = undefined ;
  }

  reset() {
    this.x.reset();
    this.dx.reset();
    this.lasttime = undefined;
  }

  filter(value, timestamp=undefined) {
    // update the sampling frequency based on timestamps
    if (this.lasttime!=undefined && timestamp!=undefined)
      this.freq = 1.0 / (timestamp-this.lasttime) ;
    this.lasttime = timestamp ;
    // estimate the current variation per second 
    var dvalue = this.x.hasLastRawValue() ? (value - this.x.lastRawValue())*this.freq : 0.0 ; 
    var edvalue = this.dx.filterWithAlpha(dvalue, this.alpha(this.dcutoff)) ;
    // use it to update the cutoff frequency
    var cutoff = this.mincutoff + this.beta_ * Math.abs(edvalue) ;
    // filter the given value
    return this.x.filterWithAlpha(value, this.alpha(cutoff)) ;
  }
} 
