// Benchmark headless (phase 51) : coût CPU logique+rendu par frame (hors GPU),
// budget particules, taille des assets. Le profiling GPU réel se fait sur appareil.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, statSync } from 'node:fs';
import { installDomStubs, memStorage } from './helpers/dom-stub.mjs';

const { canvas } = installDomStubs();
const { Engine } = await import('../game/js/core/engine.js');
const { Assets } = await import('../game/js/core/assets.js');
const { AudioManager } = await import('../game/js/core/audio.js');
const { SaveSystem } = await import('../game/js/core/save.js');
const { I18n } = await import('../game/js/core/i18n.js');
const { GameState } = await import('../game/js/gameplay/state.js');
const { HintSystem } = await import('../game/js/gameplay/hints.js');
const { STRINGS } = await import('../game/js/data/strings.js');
const { hintsForLang } = await import('../game/js/data/hints-data.js');
const { CONFIG } = await import('../game/js/core/config.js');
const { ExplorationScene } = await import('../game/js/scenes/exploration.js');
const { ParticleSystem, Emitters } = await import('../game/js/core/particles.js');

test('budget frame : update+draw de la scène la plus chargée < 4 ms/frame en moyenne (Node)', () => {
  const storage = memStorage();
  const game = new Engine(canvas, {
    assets: new Assets(), audio: new AudioManager(),
    saves: new SaveSystem(storage, CONFIG.SAVE_KEY, 1),
    i18n: new I18n(STRINGS, 'fr'), state: new GameState(),
    settings: { musicVol: 0.7, sfxVol: 0.9, muted: false, lang: 'fr', reduceMotion: false, bigText: false },
    hints: new HintSystem(hintsForLang('fr'), new GameState()), hintsForLang,
    persist() { this.saves.save(this.state.serialize()); }, persistSettings() {},
  });
  game.scenes.register('explore', new ExplorationScene());
  game.scenes.register('map', new ExplorationScene()); // cible de goto éventuelle
  game.scenes.goto('explore', { chapter: 'garden' });
  const dt = 1 / 60;
  // warmup
  for (let i = 0; i < 60; i++) { game.scenes.update(dt); game._render(); }
  const N = 600;
  const t0 = performance.now();
  for (let i = 0; i < N; i++) { game.time += dt; game.scenes.update(dt); game._render(); }
  const ms = (performance.now() - t0) / N;
  console.log(`[perf] update+draw exploration : ${ms.toFixed(3)} ms/frame (budget 16.6 ms)`);
  assert.ok(ms < 4, `frame logique trop coûteuse: ${ms} ms`);
});

test('particules : le pool est borné, aucune croissance non maîtrisée', () => {
  const ps = new ParticleSystem(300);
  for (let i = 0; i < 10000; i++) Emitters.firefly(ps, 1280, 720);
  for (let i = 0; i < 50; i++) Emitters.sparkleBurst(ps, 640, 360);
  assert.ok(ps.pool.length === 300, 'le pool ne doit jamais grossir');
  ps.update(0.016);
  assert.ok(ps.activeCount() <= 300);
});

test('poids des assets : images ≤ 250 Ko chacune, total ≤ 2 Mo', () => {
  const dir = new URL('../game/assets/img/', import.meta.url).pathname;
  let total = 0;
  for (const f of readdirSync(dir)) {
    const size = statSync(dir + f).size;
    total += size;
    assert.ok(size <= 250 * 1024, `${f} trop lourd: ${(size / 1024).toFixed(0)} Ko`);
  }
  console.log(`[perf] total images: ${(total / 1024).toFixed(0)} Ko`);
  assert.ok(total <= 2 * 1024 * 1024);
});

test('sauvegarde : sérialisation d\'un état complet < 0.5 ms et < 8 Ko', () => {
  const s = new GameState();
  for (const c of CONFIG.CHAPTERS) s.completeChapter(c);
  for (let i = 0; i < 5; i++) s.addFragment(i);
  s.savePuzzle('reflection', { solved: true, tiles: [0,1,2,3,4,5,6,7,8], moves: 120 });
  const t0 = performance.now();
  let out = '';
  for (let i = 0; i < 100; i++) out = JSON.stringify(s.serialize());
  const ms = (performance.now() - t0) / 100;
  console.log(`[perf] serialize: ${ms.toFixed(3)} ms, ${out.length} octets`);
  assert.ok(ms < 0.5);
  assert.ok(out.length < 8 * 1024);
});
