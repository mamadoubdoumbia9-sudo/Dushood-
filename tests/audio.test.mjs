// Tests audio (phase 49) : réglages, mute, absence d'AudioContext (appareil sans audio),
// et robustesse du cycle de vie — exécutés headless (l'écoute réelle est faite en QA manuelle).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { installDomStubs } from './helpers/dom-stub.mjs';

installDomStubs(); // window SANS AudioContext = appareil sans audio (bloc 490)
const { AudioManager } = await import('../game/js/core/audio.js');

test('appareil sans audio : ensureContext → false, aucune exception', () => {
  const a = new AudioManager();
  assert.equal(a.ensureContext(), false);
});

test('playMusic / sfx / stopMusic sans AudioContext : silencieux et sans crash', () => {
  const a = new AudioManager();
  a.playMusic('garden');
  a.sfx('success');
  a.sfx('inconnu');
  a.stopMusic();
  a.suspend(); a.resume();
  assert.equal(a.currentTrack, null);
});

test('applySettings : volumes clampés conservés, mute persistant dans les réglages', () => {
  const a = new AudioManager();
  a.applySettings({ musicVol: 0.3, sfxVol: 0.8, muted: true });
  assert.equal(a.settings.musicVol, 0.3);
  assert.equal(a.settings.sfxVol, 0.8);
  assert.equal(a.settings.muted, true);
  a.applySettings({ muted: false });
  assert.equal(a.settings.muted, false);
  assert.equal(a.settings.musicVol, 0.3, 'les autres réglages sont préservés');
});

test('avec AudioContext factice : musique planifiée, gains appliqués, mute → gain 0', () => {
  const calls = [];
  class FakeNode {
    constructor() { this.gain = { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }; this.frequency = { value: 0 }; }
    connect() {} disconnect() {} start(t) { calls.push('start'); } stop() {}
  }
  globalThis.window.AudioContext = class {
    constructor() { this.currentTime = 0; this.state = 'running'; this.destination = {}; }
    createGain() { return new FakeNode(); }
    createOscillator() { return new FakeNode(); }
    resume() { this.state = 'running'; } suspend() { this.state = 'suspended'; }
  };
  const a = new AudioManager();
  assert.equal(a.ensureContext(), true);
  a.applySettings({ musicVol: 0.5, sfxVol: 0.7, muted: false });
  assert.equal(a.musicGain.gain.value, 0.5);
  assert.equal(a.sfxGain.gain.value, 0.7);
  assert.equal(a.masterGain.gain.value, 1);
  a.applySettings({ muted: true });
  assert.equal(a.masterGain.gain.value, 0, 'mute coupe le master');
  a.playMusic('lake');
  assert.equal(a.currentTrack, 'lake');
  assert.ok(calls.length > 0, 'des notes doivent être planifiées');
  a.playMusic('lake'); // même piste → pas de redémarrage
  a.stopMusic();
  assert.equal(a.currentTrack, null);
  a.sfx('heart');
  delete globalThis.window.AudioContext;
});

test('toutes les pistes des chapitres existent dans le moteur musical', async () => {
  const { CHAPTERS } = await import('../game/js/data/scenes-data.js');
  const src = (await import('node:fs')).readFileSync(
    new URL('../game/js/core/audio.js', import.meta.url), 'utf8');
  for (const ch of Object.values(CHAPTERS)) {
    assert.ok(src.includes(`${ch.music}:`), 'gamme manquante pour ' + ch.music);
  }
  for (const t of ['menu', 'letter']) assert.ok(src.includes(`${t}:`));
});
