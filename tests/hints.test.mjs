// Tests du système d'indices (phase 16) : progression, cooldown, épuisement, persistance.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HintSystem } from '../game/js/gameplay/hints.js';
import { GameState } from '../game/js/gameplay/state.js';
import { hintsForLang, HINTS } from '../game/js/data/hints-data.js';

function makeSystem(t0 = 0) {
  let now = t0;
  const st = new GameState();
  const hs = new HintSystem({ p1: ['a', 'b', 'c'] }, st, () => now);
  return { hs, st, tick: ms => { now += ms; } };
}

test('indices délivrés dans l\'ordre, avec niveaux', () => {
  const { hs, tick } = makeSystem();
  tick(30000);
  assert.deepEqual(hs.ask('p1'), { ok: true, hint: 'a', level: 1 });
  tick(30000);
  assert.deepEqual(hs.ask('p1'), { ok: true, hint: 'b', level: 2 });
});

test('cooldown : refus avec temps restant', () => {
  const { hs, tick } = makeSystem();
  tick(30000);
  hs.ask('p1');
  tick(5000);
  const res = hs.ask('p1');
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'cooldown');
  assert.ok(res.waitMs > 0 && res.waitMs <= 20000);
});

test('épuisement : plus d\'indice → exhausted', () => {
  const { hs, tick } = makeSystem();
  for (let i = 0; i < 3; i++) { tick(30000); assert.equal(hs.ask('p1').ok, true); }
  tick(30000);
  const res = hs.ask('p1');
  assert.equal(res.ok, false);
  assert.equal(res.reason, 'exhausted');
  assert.equal(hs.available('p1'), 0);
});

test('les indices consommés sont persistés dans GameState', () => {
  const { hs, st, tick } = makeSystem();
  tick(30000); hs.ask('p1');
  const restored = GameState.deserialize(st.serialize());
  const hs2 = new HintSystem({ p1: ['a', 'b', 'c'] }, restored, () => 999999);
  assert.equal(hs2.available('p1'), 2);
  assert.deepEqual(hs2.unlockedHints('p1'), ['a']);
});

test('données réelles : chaque puzzle et chaque exploration a 3 indices FR et EN', () => {
  const ids = ['fireflies', 'constellation', 'reflection', 'lanterns', 'letterjigsaw',
    'garden_explore', 'forest_explore', 'lake_explore', 'city_explore', 'tower_explore'];
  for (const id of ids) {
    assert.ok(HINTS[id], 'indices manquants: ' + id);
    assert.equal(HINTS[id].fr.length, 3, id + ' fr');
    assert.equal(HINTS[id].en.length, 3, id + ' en');
  }
  const fr = hintsForLang('fr');
  assert.equal(fr.fireflies.length, 3);
  const unknown = hintsForLang('de'); // fallback fr
  assert.equal(unknown.fireflies[0], HINTS.fireflies.fr[0]);
});
