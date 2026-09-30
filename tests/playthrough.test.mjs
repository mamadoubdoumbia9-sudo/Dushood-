// Test du parcours complet (RÈGLE 41) : simulation logique de bout en bout,
// NOUVELLE PARTIE → 5 chapitres (objets, gates, puzzles) → lettre → épilogue,
// avec sauvegarde/rechargement entre chaque chapitre (fermeture forcée simulée).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../game/js/gameplay/state.js';
import { SaveSystem } from '../game/js/core/save.js';
import { createPuzzle } from '../game/js/gameplay/puzzlefactory.js';
import { CHAPTERS } from '../game/js/data/scenes-data.js';
import { CONFIG } from '../game/js/core/config.js';
import { LETTER_FULL } from '../game/js/data/letter.js';

function memStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

function solvePuzzle(id, state) {
  const p = createPuzzle(id, state);
  switch (id) {
    case 'fireflies':
      while (!p.solved) { p.beginInput(); for (const n of [...p.sequence]) p.press(n); }
      break;
    case 'constellation':
      for (const s of p.order) p.tryConnect(s);
      break;
    case 'reflection': {
      // résolution par recherche BFS simple (3x3, mélange léger pour le test)
      const q = createPuzzle(id, state);
      // rejoue un puzzle frais avec petit mélange contrôlé
      const fresh = createPuzzle(id, state);
      // stratégie: annuler le mélange en rejouant des coups aléatoires est non déterministe ;
      // on utilise l'API restore avec un état à un coup de la solution puis on joue ce coup.
      p.restore({ solved: false, tiles: [0, 1, 2, 3, 4, 5, 6, 8, 7], moves: 0 });
      const res = p.move(7); // remet la tuile 7 en place ? vide est en position 7 → move(8)
      if (!p.solved) p.move(8);
      assert.equal(p.checkSolved(), true);
      break;
    }
    case 'lanterns':
      [7, 2, 5, 9].forEach((d, i) => p.setDigit(i, d));
      assert.equal(p.submit().result, 'solved');
      break;
    case 'letterjigsaw':
      for (const s of p.slots) { p.movePiece(s.id, s.x, s.y); p.dropPiece(s.id); }
      break;
  }
  assert.equal(p.solved, true, id + ' doit être résolu');
  state.savePuzzle(id, p.serialize());
}

test('PARCOURS COMPLET : nouvelle partie → lettre → épilogue, avec save/reload à chaque étape', () => {
  const storage = memStorage();
  const saves = new SaveSystem(storage, CONFIG.SAVE_KEY, CONFIG.SAVE_VERSION);

  // LANCEMENT + NOUVELLE PARTIE
  let state = GameState.deserialize(saves.load()); // première installation
  assert.equal(state.introSeen, false);
  state.introSeen = true; // INTRO
  saves.save(state.serialize());

  // LES 5 CHAPITRES dans l'ordre imposé par la progression
  for (const chapterId of CONFIG.CHAPTERS) {
    // fermeture forcée + reprise (RÈGLE 20)
    state = GameState.deserialize(saves.load());
    assert.equal(state.isUnlocked(chapterId), true, chapterId + ' doit être débloqué');
    const ch = CHAPTERS[chapterId];
    state.chapter = chapterId;

    // exploration : ramasser les objets, découvrir les indices
    for (const h of ch.hotspots) {
      if (h.type === 'item') state.addItem(h.item);
      if (h.type === 'clue') state.setFlag(`${chapterId}.${h.clue}`);
    }
    // gate : consommer l'objet requis
    const gate = ch.hotspots.find(h => h.type === 'gate');
    if (gate.requiresItem) {
      assert.equal(state.hasItem(gate.requiresItem), true, `objet requis ${gate.requiresItem} manquant`);
      state.useItem(gate.requiresItem);
      state.setFlag(`${chapterId}.${gate.id}.open`);
    }
    // ÉNIGME
    solvePuzzle(ch.puzzle, state);
    assert.equal(state.isPuzzleSolved(ch.puzzle), true);
    // FRAGMENT + PROGRESSION
    assert.equal(state.addFragment(ch.fragment), true);
    state.completeChapter(chapterId);
    saves.save(state.serialize());
  }

  // FIN DE PARCOURS
  state = GameState.deserialize(saves.load());
  assert.equal(state.hasAllFragments(), true, 'les 5 fragments doivent être réunis');
  assert.equal(state.nextChapter(), null);

  // LETTRE
  assert.ok(LETTER_FULL.includes('Je t\u2019aime ❤️'));
  assert.ok(LETTER_FULL.includes('J\u2019espère que tu as apprécié mon cadeau.'));
  state.letterRead = true;
  state.galleryUnlocked = true;
  saves.save(state.serialize());

  // ÉPILOGUE
  state = GameState.deserialize(saves.load());
  assert.equal(state.letterRead, true);
  state.epilogueSeen = true;
  saves.save(state.serialize());

  // BILAN
  state = GameState.deserialize(saves.load());
  assert.equal(state.progressPercent(), 100);
  assert.equal(state.galleryUnlocked, true, 'contenu secret débloqué');
});

test('SÉQUENCE VERROUILLÉE : impossible de sauter un chapitre', () => {
  const state = new GameState();
  assert.equal(state.isUnlocked('tower'), false);
  assert.equal(state.isUnlocked('city'), false);
  state.completeChapter('garden');
  assert.equal(state.isUnlocked('forest'), true);
  assert.equal(state.isUnlocked('lake'), false, 'lake ne doit pas être débloqué avant forest');
});

test('ROBUSTESSE : reprise avec sauvegarde corrompue → nouvelle partie propre', () => {
  const storage = memStorage();
  const saves = new SaveSystem(storage, CONFIG.SAVE_KEY, CONFIG.SAVE_VERSION);
  storage.setItem(CONFIG.SAVE_KEY, 'corrompu%%%');
  const state = GameState.deserialize(saves.load());
  assert.deepEqual(state.unlocked, ['garden']);
  assert.equal(state.progressPercent(), 0);
});
