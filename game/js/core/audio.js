// DUSHOOD — architecture audio réelle en WebAudio (phases 28, 29, 37, 42)
// Musique générative par chapitre (pads + arpèges pentatoniques) et SFX synthétisés.
// Canaux séparés musique / SFX, volumes, mute, persistance, lifecycle Android.
import { Log } from './log.js';

const SCALES = {
  menu:   { root: 220.00, notes: [0, 3, 5, 7, 10], pad: [0, 7, 12], tempo: 2.4, wave: 'sine' },
  garden: { root: 261.63, notes: [0, 2, 4, 7, 9],  pad: [0, 4, 7],  tempo: 2.0, wave: 'sine' },
  forest: { root: 196.00, notes: [0, 3, 5, 7, 10], pad: [0, 3, 7],  tempo: 2.6, wave: 'triangle' },
  lake:   { root: 233.08, notes: [0, 2, 5, 7, 9],  pad: [0, 5, 9],  tempo: 3.0, wave: 'sine' },
  city:   { root: 174.61, notes: [0, 4, 5, 7, 11], pad: [0, 4, 9],  tempo: 2.2, wave: 'triangle' },
  tower:  { root: 146.83, notes: [0, 2, 3, 7, 8],  pad: [0, 3, 8],  tempo: 3.2, wave: 'sine' },
  letter: { root: 293.66, notes: [0, 4, 7, 11, 12],pad: [0, 4, 7],  tempo: 3.4, wave: 'sine' },
};

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.musicGain = null; this.sfxGain = null; this.masterGain = null;
    this.settings = { musicVol: 0.7, sfxVol: 0.9, muted: false };
    this.currentTrack = null;
    this._musicTimer = null;
    this._step = 0;
    this._started = false;
  }
  // L'AudioContext ne peut démarrer qu'après un geste utilisateur (règle Android/Chrome)
  ensureContext() {
    if (this.ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { Log.warn('WebAudio indisponible'); return false; }
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.connect(this.masterGain);
      this._applyVolumes();
      return true;
    } catch (e) { Log.error('AudioContext init', e); return false; }
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend(); }

  applySettings(s) {
    this.settings = { ...this.settings, ...s };
    this._applyVolumes();
  }
  _applyVolumes() {
    if (!this.ctx) return;
    const m = this.settings.muted ? 0 : 1;
    this.masterGain.gain.value = m;
    this.musicGain.gain.value = this.settings.musicVol;
    this.sfxGain.gain.value = this.settings.sfxVol;
  }

  // ---------- MUSIQUE GÉNÉRATIVE ----------
  playMusic(trackName) {
    if (this.currentTrack === trackName) return;
    this.stopMusic();
    if (!this.ensureContext()) return;
    const def = SCALES[trackName] || SCALES.menu;
    this.currentTrack = trackName;
    this._step = 0;
    const scheduleStep = () => {
      if (this.currentTrack !== trackName || !this.ctx) return;
      const t = this.ctx.currentTime;
      // Pad d'ambiance toutes les 2 mesures
      if (this._step % 4 === 0) {
        for (const semi of def.pad) {
          this._tone(this.musicGain, def.root / 2 * Math.pow(2, semi / 12), t, def.tempo * 4.2, 0.05, 'sine', 1.2);
        }
      }
      // Note d'arpège (aléa doux, déterministe par pas pour la cohérence)
      const idx = (this._step * 7 + Math.floor(this._step / 5)) % def.notes.length;
      const octave = (this._step % 8 === 3) ? 2 : 1;
      const freq = def.root * octave * Math.pow(2, def.notes[idx] / 12);
      this._tone(this.musicGain, freq, t + 0.02, def.tempo * 0.9, 0.075, def.wave, 0.35);
      this._step++;
      this._musicTimer = setTimeout(scheduleStep, def.tempo * 1000);
    };
    scheduleStep();
    Log.info('Musique:', trackName);
  }
  stopMusic() {
    this.currentTrack = null;
    if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; }
  }
  _tone(dest, freq, t, dur, vol, wave = 'sine', attack = 0.08) {
    try {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = wave; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(vol, t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(dest);
      o.start(t); o.stop(t + dur + 0.05);
      o.onended = () => { o.disconnect(); g.disconnect(); };
    } catch (e) { /* audio non bloquant */ }
  }

  // ---------- SFX ----------
  sfx(name) {
    if (!this.ensureContext()) return;
    const t = this.ctx.currentTime;
    const S = (f, d, v, w, a) => this._tone(this.sfxGain, f, t, d, v, w, a || 0.005);
    switch (name) {
      case 'tap':      S(880, 0.09, 0.12, 'sine'); break;
      case 'hotspot':  S(660, 0.15, 0.14, 'triangle'); S(990, 0.2, 0.08, 'sine'); break;
      case 'pickup':   S(523, 0.12, 0.15, 'sine'); S(784, 0.22, 0.12, 'sine'); S(1046, 0.3, 0.09, 'sine'); break;
      case 'success':  [523, 659, 784, 1046].forEach((f, i) => this._tone(this.sfxGain, f, t + i * 0.09, 0.4, 0.14, 'sine', 0.01)); break;
      case 'error':    S(220, 0.25, 0.12, 'sawtooth'); S(208, 0.25, 0.1, 'sawtooth'); break;
      case 'chime':    S(1318, 0.5, 0.1, 'sine'); S(1975, 0.7, 0.06, 'sine'); break;
      case 'firefly':  S(1568 + Math.random() * 300, 0.18, 0.07, 'sine'); break;
      case 'page':     S(300, 0.08, 0.06, 'triangle'); S(420, 0.12, 0.05, 'triangle'); break;
      case 'door':     S(110, 0.5, 0.16, 'triangle'); S(165, 0.6, 0.1, 'sine'); break;
      case 'fragment': [784, 988, 1175, 1568].forEach((f, i) => this._tone(this.sfxGain, f, t + i * 0.12, 0.6, 0.12, 'sine', 0.02)); break;
      case 'heart':    [523, 659, 784, 880, 1046, 1318].forEach((f, i) => this._tone(this.sfxGain, f, t + i * 0.15, 0.9, 0.1, 'sine', 0.04)); break;
      default:         S(700, 0.1, 0.1, 'sine');
    }
  }

  // Lifecycle Android (WebView pause/resume via visibilitychange)
  installLifecycle() {
    if (typeof document === 'undefined') return;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.suspend(); else this.resume();
    });
  }
}
