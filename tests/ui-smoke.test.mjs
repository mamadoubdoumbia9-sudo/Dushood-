// Test d'intégration UI headless (phases 47, 48, 94) : exécute les VRAIES scènes
// (boot → menu → intro → carte → jardin complet → lettre → épilogue) sous Node.
import { test } from 'node:test';
import assert from 'node:assert/strict';
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

const { BootScene } = await import('../game/js/scenes/boot.js');
const { MenuScene } = await import('../game/js/scenes/menu.js');
const { IntroScene } = await import('../game/js/scenes/intro.js');
const { MapScene } = await import('../game/js/scenes/map.js');
const { ExplorationScene } = await import('../game/js/scenes/exploration.js');
const { LetterScene } = await import('../game/js/scenes/letter.js');
const { EpilogueScene } = await import('../game/js/scenes/epilogue.js');
const { GalleryScene } = await import('../game/js/scenes/gallery.js');

function makeGame() {
  const storage = memStorage();
  const saves = new SaveSystem(storage, CONFIG.SAVE_KEY, CONFIG.SAVE_VERSION);
  const state = GameState.deserialize(saves.load());
  const i18n = new I18n(STRINGS, 'fr');
  const game = new Engine(canvas, {
    assets: new Assets(),
    audio: new AudioManager(),
    saves, i18n, state,
    settings: { musicVol: 0.7, sfxVol: 0.9, muted: false, lang: 'fr' },
    hints: new HintSystem(hintsForLang('fr'), state),
    hintsForLang,
    persist() { this.saves.save(this.state.serialize()); },
    persistSettings() {},
  });
  game.scenes.register('boot', new BootScene());
  game.scenes.register('menu', new MenuScene());
  game.scenes.register('intro', new IntroScene());
  game.scenes.register('map', new MapScene());
  game.scenes.register('explore', new ExplorationScene());
  game.scenes.register('letter', new LetterScene());
  game.scenes.register('epilogue', new EpilogueScene());
  game.scenes.register('gallery', new GalleryScene());
  return game;
}

// Simule l'écoulement du temps : update + draw à 60 fps (le draw exécute le vrai code de rendu)
function run(game, seconds) {
  const dt = 1 / 60;
  for (let t = 0; t < seconds; t += dt) {
    game.time += dt;
    game.scenes.update(dt);
    game._render();
  }
}
function tap(game, x, y) {
  game.input._emit('tap', { x, y });
  run(game, 0.05);
}
function tapThroughDialogue(game, scene, maxTaps = 40) {
  let n = 0;
  while (scene.dialogue && scene.dialogue.active && n < maxTaps) {
    tap(game, 640, 620); // dans la boîte de dialogue
    run(game, 0.1);
    n++;
  }
  assert.ok(n < maxTaps, 'dialogue interminable');
}
const sleep = ms => new Promise(r => setTimeout(r, ms));

test('PARCOURS UI HEADLESS : boot → menu → intro → carte → jardin (chapitre complet)', async () => {
  const game = makeGame();
  game.scenes.goto('boot');
  run(game, 0.7);
  await sleep(30); // laisse les onerror des images se déclencher
  run(game, 3);    // boot → menu (transition comprise)
  assert.equal(game.scenes.current.key, 'menu', 'le menu doit être atteint');

  // NOUVELLE PARTIE (pas de sauvegarde → premier bouton = Nouvelle partie, y=320)
  tap(game, 640, 354);
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'intro', 'l\'intro doit démarrer');

  // INTRO : traverser le dialogue
  tapThroughDialogue(game, game.scenes.current);
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'map', 'la carte doit suivre l\'intro');
  assert.equal(game.state.introSeen, true);

  // CARTE : un lieu verrouillé refuse l'entrée
  tap(game, 1100, 200); // tour verrouillée
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'map', 'la tour verrouillée ne doit pas s\'ouvrir');

  // CARTE → JARDIN
  tap(game, 220, 520);
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'explore');
  const scene = game.scenes.current;
  assert.equal(scene.ch.id, 'garden');
  tapThroughDialogue(game, scene); // dialogue d'entrée

  // Kiosque verrouillé sans clé → dialogue de blocage
  tap(game, 640, 350);
  run(game, 0.2);
  assert.equal(scene.dialogue.active, true, 'le kiosque doit expliquer qu\'il est fermé');
  tapThroughDialogue(game, scene);

  // Ramasser la clé (fleurs)
  tap(game, 1010, 560);
  run(game, 0.2);
  assert.equal(game.state.hasItem('lantern_key'), true, 'la clé doit être ramassée');
  tapThroughDialogue(game, scene);

  // Ouvrir le kiosque → intro puzzle → vue puzzle
  tap(game, 640, 350);
  run(game, 0.2);
  tapThroughDialogue(game, scene);
  run(game, 0.2);
  assert.ok(scene.puzzleView, 'le puzzle des lucioles doit être ouvert');
  assert.equal(game.state.hasItem('lantern_key'), false, 'la clé doit être consommée');

  // Résoudre le puzzle (logique réelle, entrée simulée au niveau logique)
  const v = scene.puzzleView;
  while (!v.logic.solved) {
    v.logic.beginInput();
    for (const n of [...v.logic.sequence]) v.logic.press(n);
  }
  v.solve();
  await sleep(1100); // le callback onSolved est différé (900 ms)
  run(game, 0.3);
  assert.equal(scene.puzzleView, null, 'la vue puzzle doit être fermée');
  assert.ok(game.state.fragments.includes(0), 'fragment 0 obtenu');
  assert.equal(game.state.isCompleted('garden'), true);
  assert.equal(game.state.isUnlocked('forest'), true);
  tapThroughDialogue(game, scene); // dialogue du fragment
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'map', 'retour à la carte après le chapitre');

  // Persistance réelle : recharger depuis le storage
  const reloaded = GameState.deserialize(game.saves.load());
  assert.equal(reloaded.isCompleted('garden'), true);
  assert.ok(reloaded.fragments.includes(0));
});

test('PARCOURS UI HEADLESS : lettre → épilogue → galerie débloquée', async () => {
  const game = makeGame();
  // état de fin de tour
  for (const c of CONFIG.CHAPTERS) { game.state.completeChapter(c); }
  for (let i = 0; i < CONFIG.FRAGMENTS_TOTAL; i++) game.state.addFragment(i);
  game.persist();

  game.scenes.goto('letter');
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'letter');
  // 1er tap : révèle tout le texte ; attendre l'invite ; 2e tap : continuer
  tap(game, 640, 360);
  run(game, 1.5);
  tap(game, 640, 360);
  run(game, 2);
  assert.equal(game.state.letterRead, true, 'la lettre doit être marquée lue');
  assert.equal(game.state.galleryUnlocked, true, 'la galerie doit être débloquée');
  assert.equal(game.scenes.current.key, 'epilogue');

  // ÉPILOGUE : dialogue final → menu
  tapThroughDialogue(game, game.scenes.current);
  run(game, 3.5); // la transition de l'épilogue dure 2 × 1.4 s
  assert.equal(game.state.epilogueSeen, true);
  assert.equal(game.scenes.current.key, 'menu');
  assert.equal(game.state.progressPercent(), 100);

  // GALERIE accessible et fonctionnelle
  game.scenes.goto('gallery');
  run(game, 1.5);
  assert.equal(game.scenes.current.key, 'gallery');
  tap(game, 190, 330); // carte du jardin
  run(game, 0.2);
  assert.equal(game.scenes.current.selected, 0, 'le fragment du jardin doit s\'afficher');
});

test('HUD : indice via Nayo, cooldown effectif, inventaire ouvrable', async () => {
  const game = makeGame();
  game.state.introSeen = true;
  game.scenes.goto('explore', { chapter: 'garden' });
  run(game, 1.5);
  const scene = game.scenes.current;
  tapThroughDialogue(game, scene);
  // bouton indice (coin haut droit)
  tap(game, CONFIG.WIDTH - 18 - 32, 50);
  run(game, 0.2);
  assert.equal(scene.dialogue.active, true, 'Nayo doit donner un indice');
  tapThroughDialogue(game, scene);
  assert.equal(game.state.hintsUsed['garden_explore'], 1);
  // cooldown : redemander tout de suite → toast, pas de 2e indice
  tap(game, CONFIG.WIDTH - 18 - 32, 50);
  run(game, 0.2);
  assert.equal(scene.dialogue.active, false, 'cooldown : pas de nouvel indice immédiat');
  assert.equal(game.state.hintsUsed['garden_explore'], 1);
  // inventaire
  tap(game, CONFIG.WIDTH - 18 - 64 * 2 - 12 + 32, 50);
  run(game, 0.1);
  assert.equal(scene.hud.showInventory, true, 'le sac doit s\'ouvrir');
});
