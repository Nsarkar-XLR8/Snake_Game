/* ==========================================================================
   Industry Standard Snake Game - Web Audio API Procedural Sound Synthesizer
   ========================================================================== */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxVolume = 0.5;
    this.isMuted = false;

    // Load user settings if available
    const savedVol = localStorage.getItem('snake_sfx_volume');
    if (savedVol !== null) this.sfxVolume = parseFloat(savedVol);
    const savedMute = localStorage.getItem('snake_sfx_muted');
    if (savedMute !== null) this.isMuted = savedMute === 'true';
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    
    this.ctx = new AudioCtx();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('snake_sfx_volume', this.sfxVolume);
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('snake_sfx_muted', this.isMuted);
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Effects Synthesis ---

  playEatSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    
    // Quick frequency sweep up (300Hz -> 600Hz)
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playPowerupSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 arpeggio

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.25, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.12);
    });
  }

  playComboSound(multiplier = 2) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;
    const baseFreq = 500 + Math.min(multiplier, 10) * 80;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  playMoveSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playCrashSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const now = this.ctx.currentTime;

    // Low sawtooth pitch drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  playClickSound() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;

    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.02);
  }
}

const soundManager = new SoundManager();
