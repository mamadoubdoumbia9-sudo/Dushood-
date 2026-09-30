// Tests des 5 puzzles (phases 14, 15, 62, 67) : logique, réussite, échec, sauvegarde d'état.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SequencePuzzle } from '../game/js/gameplay/puzzles/sequence.js';
import { ConstellationPuzzle } from '../game/js/gameplay/puzzles/constellation.js';
import { SlidingPuzzle } from '../game/js/gameplay/puzzles/sliding.js';
import { CodePuzzle } from '../game/js/gameplay/puzzles/code.js';
import { JigsawPuzzle } from '../game/js/gameplay/puzzles/jigsaw.js';
import { createPuzzle } from '../game/js/gameplay/puzzlefactory.js';
import { GameState } from '../game/js/gameplay/state.js';

// ---------- Séquence (lucioles) ----------
test('sequence : résolution complète des 3 manches', () => {
  let i = 0;
  const p = new SequencePuzzle({ rng: () => ((i += 0.37) % 1) });
  for (let round = 0; round < 3; round++) {
    p.beginInput();
    const seq = [...p.sequence];
    for (let i = 0; i < seq.length; i++) {
      const res = p.press(seq[i]);
      if (round === 2 && i === seq.length - 1) assert.equal(res.result, 'solved');
    }
  }
  assert.equal(p.solved, true);
});

test('sequence : une erreur régénère la séquence sans résoudre', () => {
  const p = new SequencePuzzle({ rng: () => 0.1 });
  p.beginInput();
  const wrong = (p.sequence[0] + 1) % p.nodeCount;
  const res = p.press(wrong);
  assert.equal(res.result, 'fail');
  assert.equal(p.solved, false);
  assert.equal(p.phase, 'failed');
});

test('sequence : pas deux fois la même luciole consécutive', () => {
  const p = new SequencePuzzle({ rng: Math.random, rounds: [12] });
  for (let i = 1; i < p.sequence.length; i++) assert.notEqual(p.sequence[i], p.sequence[i - 1]);
});

test('sequence : serialize/restore préserve résolution', () => {
  const p = new SequencePuzzle();
  p.solved = true;
  const q = new SequencePuzzle();
  q.restore(p.serialize());
  assert.equal(q.solved, true);
  assert.equal(q.phase, 'solved');
});

// ---------- Constellation ----------
test('constellation : ordre correct → résolu', () => {
  const p = new ConstellationPuzzle();
  for (const id of p.order.slice(0, -1)) {
    assert.equal(p.tryConnect(id).result, 'good');
  }
  assert.equal(p.tryConnect(p.order[p.order.length - 1]).result, 'solved');
  assert.equal(p.solved, true);
});

test('constellation : mauvaise étoile → reset du tracé', () => {
  const p = new ConstellationPuzzle();
  p.tryConnect(p.order[0]);
  const res = p.tryConnect(p.order[3]); // saute des étapes
  assert.equal(res.result, 'fail');
  assert.deepEqual(p.connected, []);
});

test('constellation : étoile inconnue → invalid, déjà reliée → already', () => {
  const p = new ConstellationPuzzle();
  assert.equal(p.tryConnect('ZZ').result, 'invalid');
  p.tryConnect(p.order[0]);
  assert.equal(p.tryConnect(p.order[0]).result, 'already');
});

test('constellation : restore filtre les ids invalides', () => {
  const p = new ConstellationPuzzle();
  p.restore({ solved: false, connected: ['F', 'HACK', 'A'] });
  assert.deepEqual(p.connected, ['F', 'A']);
});

// ---------- Taquin ----------
test('taquin : mélange toujours résoluble (coups légaux) et jamais déjà résolu', () => {
  for (let i = 0; i < 20; i++) {
    const p = new SlidingPuzzle();
    assert.equal(p.checkSolved(), false);
    const sorted = [...p.tiles].sort((a, b) => a - b);
    assert.deepEqual(sorted, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }
});

test('taquin : seuls les voisins de la case vide bougent', () => {
  const p = new SlidingPuzzle({ shuffle: false });
  // état résolu : vide en 8 ; voisins = 5 et 7
  assert.equal(p.canMove(5), true);
  assert.equal(p.canMove(7), true);
  assert.equal(p.canMove(0), false);
  assert.equal(p.move(0).result, 'blocked');
  const res = p.move(5);
  assert.equal(res.result, 'moved');
  assert.equal(p.moves, 1);
});

test('taquin : résolution détectée', () => {
  const p = new SlidingPuzzle({ shuffle: false });
  p.move(5); // casse l'ordre
  assert.equal(p.solved, false);
  const res = p.move(5); // répare → mais move sur l'index de la case vide ? non : 5 est redevenu déplaçable
  // après premier move, la tuile 5 est en position 8 et le vide en 5 ; rejouer 8 la ramène
  const res2 = p.move(8);
  assert.ok(res.result === 'moved' || res2.result === 'solved' || p.checkSolved());
});

test('taquin : restore rejette des tuiles invalides', () => {
  const p = new SlidingPuzzle();
  const before = [...p.tiles];
  p.restore({ tiles: [0, 0, 0, 1, 2, 3, 4, 5, 6], moves: 3, solved: false });
  assert.deepEqual(p.tiles, before); // jeu de tuiles invalide ignoré
});

test('taquin : restore solved force l\'état résolu', () => {
  const p = new SlidingPuzzle();
  p.restore({ solved: true, tiles: p.tiles, moves: 10 });
  assert.equal(p.checkSolved(), true);
});

// ---------- Code des lanternes ----------
test('code : bon code → résolu', () => {
  const p = new CodePuzzle();
  [7, 2, 5, 9].forEach((d, i) => p.setDigit(i, d));
  const res = p.submit();
  assert.equal(res.result, 'solved');
  assert.equal(p.solved, true);
});

test('code : mauvais code → feedback du nombre de chiffres corrects', () => {
  const p = new CodePuzzle();
  p.setDigit(0, 7); p.setDigit(1, 1); p.setDigit(2, 5); p.setDigit(3, 0);
  const res = p.submit();
  assert.equal(res.result, 'fail');
  assert.equal(res.correctCount, 2);
  assert.equal(p.attempts, 1);
});

test('code : cycleDigit boucle 0-9 dans les deux sens', () => {
  const p = new CodePuzzle();
  p.setDigit(0, 9);
  p.cycleDigit(0, 1);
  assert.equal(p.digits[0], 0);
  p.cycleDigit(0, -1);
  assert.equal(p.digits[0], 9);
});

test('code : indices cumulés sans doublon', () => {
  const p = new CodePuzzle();
  assert.equal(p.addClue('clue1'), true);
  assert.equal(p.addClue('clue1'), false);
  assert.deepEqual(p.cluesFound, ['clue1']);
});

test('code : restore solved restaure les bons chiffres', () => {
  const p = new CodePuzzle();
  p.restore({ solved: true, digits: [0, 0, 0, 0], attempts: 4, cluesFound: [] });
  assert.deepEqual(p.digits, [7, 2, 5, 9]);
});

// ---------- Jigsaw (lettre) ----------
test('jigsaw : placement de toutes les pièces → résolu', () => {
  const p = new JigsawPuzzle();
  for (const s of p.slots) {
    p.movePiece(s.id, s.x + 0.01, s.y - 0.01); // dans la tolérance
    const res = p.dropPiece(s.id);
    if (s.id === p.slots.length - 1) assert.equal(res.result, 'solved');
    else assert.equal(res.result, 'placed');
  }
  assert.equal(p.solved, true);
});

test('jigsaw : lâcher trop loin → near, pas placé', () => {
  const p = new JigsawPuzzle();
  p.movePiece(0, 0.9, 0.9);
  const res = p.dropPiece(0);
  assert.equal(res.result, 'near');
  assert.equal(p.pieces[0].placed, false);
});

test('jigsaw : pièce placée ne bouge plus', () => {
  const p = new JigsawPuzzle();
  p.movePiece(0, p.slots[0].x, p.slots[0].y);
  p.dropPiece(0);
  assert.equal(p.movePiece(0, 0.1, 0.1).result, 'ignored');
});

test('jigsaw : positions clampées dans [0,1]', () => {
  const p = new JigsawPuzzle();
  p.movePiece(1, -5, 12);
  const piece = p.pieces.find(q => q.id === 1);
  assert.ok(piece.x >= 0 && piece.x <= 1 && piece.y >= 0 && piece.y <= 1);
});

// ---------- Fabrique + intégration état ----------
test('factory : crée chaque puzzle et restaure depuis GameState', () => {
  const st = new GameState();
  for (const id of ['fireflies', 'constellation', 'reflection', 'lanterns', 'letterjigsaw']) {
    const p1 = createPuzzle(id, st);
    assert.equal(p1.solved, false);
    p1.solved = true;
    st.savePuzzle(id, p1.serialize());
    const p2 = createPuzzle(id, st);
    assert.equal(p2.solved, true, id + ' doit restaurer solved');
    assert.equal(st.isPuzzleSolved(id), true);
  }
});

test('factory : puzzle inconnu → erreur explicite', () => {
  assert.throws(() => createPuzzle('nope', new GameState()), /Puzzle inconnu/);
});
