// Tests de cohérence des données (phases 33, 47) : scènes, dialogues, i18n, objets.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, ITEMS } from '../game/js/data/scenes-data.js';
import { DIALOGUES } from '../game/js/data/dialogues.js';
import { STRINGS } from '../game/js/data/strings.js';
import { CONFIG } from '../game/js/core/config.js';
import { I18n } from '../game/js/core/i18n.js';

test('chaque chapitre de CONFIG existe dans CHAPTERS avec fragment unique', () => {
  const fragments = new Set();
  for (const id of CONFIG.CHAPTERS) {
    const ch = CHAPTERS[id];
    assert.ok(ch, 'chapitre manquant: ' + id);
    assert.equal(ch.id, id);
    assert.ok(!fragments.has(ch.fragment), 'fragment dupliqué');
    fragments.add(ch.fragment);
    assert.ok(ch.puzzle, id + ' doit avoir un puzzle');
    assert.ok(ch.hotspots.length > 0, id + ' doit avoir des hotspots');
  }
  assert.equal(fragments.size, CONFIG.FRAGMENTS_TOTAL);
});

test('tous les dialogues référencés existent, avec fr et en', () => {
  const refs = new Set();
  for (const ch of Object.values(CHAPTERS)) {
    if (ch.enterDialogue) refs.add(ch.enterDialogue);
    if (ch.fragmentDialogue) refs.add(ch.fragmentDialogue);
    for (const h of ch.hotspots) {
      for (const k of ['dialogue', 'lockedDialogue', 'puzzleIntro']) {
        if (h[k]) refs.add(h[k]);
      }
    }
  }
  refs.add('intro'); refs.add('epilogue');
  for (const id of refs) {
    const d = DIALOGUES[id];
    assert.ok(Array.isArray(d) && d.length > 0, 'dialogue manquant: ' + id);
    for (const line of d) {
      assert.ok(line.fr && line.fr.length > 0, id + ': fr manquant');
      assert.ok(line.en && line.en.length > 0, id + ': en manquant');
      assert.ok(['nayo', 'world', 'esteban'].includes(line.who), id + ': who invalide');
    }
  }
});

test('tous les objets référencés par les hotspots existent dans ITEMS + i18n', () => {
  for (const ch of Object.values(CHAPTERS)) {
    for (const h of ch.hotspots) {
      for (const key of ['item', 'requiresItem']) {
        if (h[key]) {
          assert.ok(ITEMS[h[key]], 'objet inconnu: ' + h[key]);
          assert.ok(STRINGS.fr[ITEMS[h[key]].nameKey], 'nom fr manquant: ' + h[key]);
          assert.ok(STRINGS.en[ITEMS[h[key]].nameKey], 'nom en manquant: ' + h[key]);
        }
      }
    }
  }
});

test('chaque objet à trouver a un hotspot qui le donne, chaque gate est ouvrable', () => {
  const given = new Set();
  for (const ch of Object.values(CHAPTERS)) {
    for (const h of ch.hotspots) if (h.type === 'item') given.add(h.item);
  }
  for (const ch of Object.values(CHAPTERS)) {
    for (const h of ch.hotspots) {
      if (h.type === 'gate' && h.requiresItem) {
        assert.ok(given.has(h.requiresItem),
          `gate ${ch.id}/${h.id} exige ${h.requiresItem} qui n'est donné nulle part`);
      }
    }
  }
});

test('les hotspots respectent les zones tactiles et restent dans l\'écran', () => {
  for (const ch of Object.values(CHAPTERS)) {
    for (const h of ch.hotspots) {
      assert.ok(h.r * 2 >= 64 || CONFIG.MIN_TOUCH / 2 <= h.r * 2, `${ch.id}/${h.id} zone trop petite`);
      assert.ok(h.x - h.r >= 0 && h.x + h.r <= CONFIG.WIDTH, `${ch.id}/${h.id} hors écran X`);
      assert.ok(h.y - h.r >= 0 && h.y + h.r <= CONFIG.HEIGHT, `${ch.id}/${h.id} hors écran Y`);
    }
  }
});

test('i18n : fr et en ont exactement les mêmes clés', () => {
  const fr = Object.keys(STRINGS.fr).sort();
  const en = Object.keys(STRINGS.en).sort();
  assert.deepEqual(fr, en);
});

test('i18n : interpolation, fallback et changement de langue', () => {
  const i = new I18n(STRINGS, 'fr');
  assert.equal(i.t('fragment.found', { n: 3 }), 'Fragment de lettre retrouvé (3/5)');
  assert.equal(i.setLang('en'), true);
  assert.equal(i.t('menu.new'), 'New game');
  assert.equal(i.setLang('xx'), false); // langue inconnue refusée
  assert.equal(i.lang, 'en');
  assert.equal(i.t('clé.inexistante'), 'clé.inexistante'); // fallback clé brute
});

test('le code des lanternes correspond aux indices narratifs (7-2-5-9)', () => {
  // les 4 dialogues d'indices doivent mentionner leur chiffre
  assert.ok(DIALOGUES.city_clue1[0].fr.includes('7'));
  assert.ok(DIALOGUES.city_clue2[0].fr.includes('2'));
  assert.ok(DIALOGUES.city_clue3[0].fr.includes('5'));
  assert.ok(DIALOGUES.city_clue4[0].fr.includes('9'));
});
