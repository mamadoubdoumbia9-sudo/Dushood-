// DUSHOOD — configuration centrale (aucune constante dispersée)
export const CONFIG = {
  GAME_NAME: 'Dushood',
  VERSION: '1.0.0',
  SAVE_KEY: 'dushood.save.v1',
  SETTINGS_KEY: 'dushood.settings.v1',
  SAVE_VERSION: 1,
  // Résolution de conception (paysage). Le canvas est mis à l'échelle avec letterbox.
  WIDTH: 1280,
  HEIGHT: 720,
  // Tailles tactiles minimales (px de conception ≈ dp après mise à l'échelle)
  MIN_TOUCH: 64,
  // Chapitres dans l'ordre de progression
  CHAPTERS: ['garden', 'forest', 'lake', 'city', 'tower'],
  FRAGMENTS_TOTAL: 5,
  DEBUG: false,
};
