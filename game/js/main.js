// DUSHOOD — point d'entrée : assemble moteur, systèmes et scènes.
import { CONFIG } from './core/config.js';
import { Engine } from './core/engine.js';
import { Assets } from './core/assets.js';
import { AudioManager } from './core/audio.js';
import { SaveSystem, safeLocalStorage } from './core/save.js';
import { I18n } from './core/i18n.js';
import { Log, installGlobalErrorHandlers } from './core/log.js';
import { GameState } from './gameplay/state.js';
import { HintSystem } from './gameplay/hints.js';
import { STRINGS } from './data/strings.js';
import { hintsForLang } from './data/hints-data.js';

import { BootScene } from './scenes/boot.js';
import { MenuScene } from './scenes/menu.js';
import { IntroScene } from './scenes/intro.js';
import { MapScene } from './scenes/map.js';
import { ExplorationScene } from './scenes/exploration.js';
import { LetterScene } from './scenes/letter.js';
import { EpilogueScene } from './scenes/epilogue.js';
import { GalleryScene } from './scenes/gallery.js';

function boot() {
  const canvas = document.getElementById('game');
  const storage = safeLocalStorage();

  // Réglages (persistés séparément de la progression)
  const settingsStore = new SaveSystem(storage, CONFIG.SETTINGS_KEY, 1);
  const settings = Object.assign(
    { musicVol: 0.7, sfxVol: 0.9, muted: false, lang: 'fr', reduceMotion: false, bigText: false },
    settingsStore.load() || {}
  );

  const i18n = new I18n(STRINGS, settings.lang);
  const audio = new AudioManager();
  audio.applySettings(settings);
  audio.installLifecycle();

  const saves = new SaveSystem(storage, CONFIG.SAVE_KEY, CONFIG.SAVE_VERSION);
  const state = GameState.deserialize(saves.load());
  const hints = new HintSystem(hintsForLang(i18n.lang), state);

  const game = new Engine(canvas, {
    assets: new Assets(),
    audio, saves, i18n, state, settings, hints,
    hintsForLang,
    persist() { this.saves.save(this.state.serialize()); },
    persistSettings() { settingsStore.save(this.settings); },
  });

  installGlobalErrorHandlers((msg) => {
    // échec propre : la progression est déjà sauvegardée à chaque étape
    const el = document.getElementById('fatal');
    if (el) {
      el.style.display = 'flex';
      el.querySelector('.fatal-title').textContent = i18n.t('error.title');
      el.querySelector('.fatal-body').textContent = i18n.t('error.body');
    }
  });

  game.scenes.register('boot', new BootScene());
  game.scenes.register('menu', new MenuScene());
  game.scenes.register('intro', new IntroScene());
  game.scenes.register('map', new MapScene());
  game.scenes.register('explore', new ExplorationScene());
  game.scenes.register('letter', new LetterScene());
  game.scenes.register('epilogue', new EpilogueScene());
  game.scenes.register('gallery', new GalleryScene());

  // Sauvegarde de sécurité quand Android met la WebView en pause
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) game.persist();
  });
  window.addEventListener('pagehide', () => game.persist());

  game.scenes.goto('boot');
  game.start();
  Log.info('Dushood démarré', CONFIG.VERSION);
  window.__dushood = game; // hooks de debug/QA (phase 69/70)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
