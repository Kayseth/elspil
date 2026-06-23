/**
 * AudioSynth.js
 * Procedural lydgenerering via Web Audio API.
 * Bruges da der ikke findes lydfiler i asset-mappen.
 */
const AudioSynth = {
  ctx: null,

  /**
   * Initialiserer AudioContext (kræver brugerinteraktion).
   */
  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  },

  /**
   * Lille "ding" ved opsamling af almindelige objekter.
   */
  playDing() {
    this.init();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  },

  /**
   * Større reward-lyd ved opsamling af "Dansk produceret".
   */
  playReward() {
    this.init();
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = t + i * 0.1;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.35);
    });
  },

  /**
   * Elektrisk kortslutningslyd ved Game Over.
   */
  playShortCircuit() {
    this.init();
    const t = this.ctx.currentTime;
    const duration = 0.6;

    // Hvid støj-burst
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 1.5);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + duration);
    filter.Q.value = 2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
    noise.stop(t + duration);

    // Elektrisk buzz
    const buzz = this.ctx.createOscillator();
    const buzzGain = this.ctx.createGain();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(120, t);
    buzz.frequency.exponentialRampToValueAtTime(40, t + duration);
    buzzGain.gain.setValueAtTime(0.25, t);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    buzz.connect(buzzGain);
    buzzGain.connect(this.ctx.destination);
    buzz.start(t);
    buzz.stop(t + duration);
  }
};