// Tests de la lettre finale (phase 59) — EXIGENCE NON NÉGOCIABLE :
// présence exacte de « Je t'aime ❤️ » et « J'espère que tu as apprécié mon cadeau. »
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LETTER_FULL, LETTER_FRAGMENTS, REQUIRED_PHRASES } from '../game/js/data/letter.js';

test('la lettre contient exactement « Je t\u2019aime ❤️ »', () => {
  assert.ok(LETTER_FULL.includes('Je t\u2019aime ❤️'));
});

test('la lettre contient exactement « J\u2019espère que tu as apprécié mon cadeau. »', () => {
  assert.ok(LETTER_FULL.includes('J\u2019espère que tu as apprécié mon cadeau.'));
});

test('REQUIRED_PHRASES couvre les deux phrases obligatoires', () => {
  assert.equal(REQUIRED_PHRASES.length, 2);
  for (const p of REQUIRED_PHRASES) assert.ok(LETTER_FULL.includes(p), p);
});

test('la lettre a exactement 5 fragments (un par chapitre)', () => {
  assert.equal(LETTER_FRAGMENTS.length, 5);
  for (const f of LETTER_FRAGMENTS) {
    assert.equal(typeof f, 'string');
    assert.ok(f.length > 40, 'fragment trop court');
  }
});

test('la lettre est adressée à Lohen et signée Esteban', () => {
  assert.ok(LETTER_FULL.startsWith('Lohen'));
  assert.ok(LETTER_FULL.includes('Esteban'));
});

test('les phrases obligatoires sont dans le dernier fragment (climax)', () => {
  const last = LETTER_FRAGMENTS[LETTER_FRAGMENTS.length - 1];
  for (const p of REQUIRED_PHRASES) assert.ok(last.includes(p));
});
