// Tests de l'état du monde et de la progression (phases 17, 66).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../game/js/gameplay/state.js';
import { CONFIG } from '../game/js/core/config.js';

test('état initial : seul le jardin est débloqué', () => {
  const s = new GameState();
  assert.deepEqual(s.unlocked, ['garden']);
  assert.equal(s.isUnlocked('forest'), false);
  assert.equal(s.progressPercent(), 0);
});

test('terminer un chapitre débloque le suivant', () => {
  const s = new GameState();
  s.completeChapter('garden');
  assert.equal(s.isCompleted('garden'), true);
  assert.equal(s.isUnlocked('forest'), true);
  assert.equal(s.isUnlocked('lake'), false);
  assert.equal(s.nextChapter(), 'forest');
});

test('parcours complet : tous les chapitres → 100% avec lettre et épilogue', () => {
  const s = new GameState();
  for (const c of CONFIG.CHAPTERS) s.completeChapter(c);
  assert.equal(s.nextChapter(), null);
  s.letterRead = true;
  s.epilogueSeen = true;
  assert.equal(s.progressPercent(), 100);
});

test('fragments : ajout unique, bornes respectées', () => {
  const s = new GameState();
  assert.equal(s.addFragment(0), true);
  assert.equal(s.addFragment(0), false); // doublon
  assert.equal(s.addFragment(-1), false);
  assert.equal(s.addFragment(CONFIG.FRAGMENTS_TOTAL), false);
  for (let i = 1; i < CONFIG.FRAGMENTS_TOTAL; i++) s.addFragment(i);
  assert.equal(s.hasAllFragments(), true);
});

test('inventaire : ajout, usage, consommation', () => {
  const s = new GameState();
  assert.equal(s.addItem('lantern_key'), true);
  assert.equal(s.addItem('lantern_key'), false);
  assert.equal(s.hasItem('lantern_key'), true);
  assert.equal(s.useItem('lantern_key'), true);
  assert.equal(s.hasItem('lantern_key'), false);
  assert.ok(s.usedItems.includes('lantern_key'));
  assert.equal(s.useItem('inexistant'), false);
});

test('sérialisation round-trip complète', () => {
  const s = new GameState();
  s.completeChapter('garden');
  s.addFragment(0);
  s.addItem('flute');
  s.setFlag('city.clue1');
  s.savePuzzle('fireflies', { solved: true, round: 2 });
  s.markDialogue('intro');
  s.hintsUsed.fireflies = 2;
  s.introSeen = true;
  const restored = GameState.deserialize(s.serialize());
  assert.deepEqual(restored.serialize(), s.serialize());
  assert.equal(restored.isPuzzleSolved('fireflies'), true);
});

test('désérialisation robuste : données invalides → état sain', () => {
  for (const bad of [null, undefined, 42, 'str', [], { unlocked: 'nope', fragments: ['x', 99, -1, 2] }]) {
    const s = GameState.deserialize(bad);
    assert.ok(s.unlocked.includes('garden'));
    for (const f of s.fragments) assert.ok(f >= 0 && f < CONFIG.FRAGMENTS_TOTAL);
  }
});

test('reset : repart de zéro', () => {
  const s = new GameState();
  s.completeChapter('garden');
  s.addItem('flute');
  s.reset();
  assert.deepEqual(s.completed, []);
  assert.deepEqual(s.inventory, []);
  assert.deepEqual(s.unlocked, ['garden']);
});
