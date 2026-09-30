// DUSHOOD — chargement des assets avec progression et gestion d'erreur (phases 41, 96, 97)
import { Log } from './log.js';

export class Assets {
  constructor() {
    this.images = new Map();
    this.failed = new Set();
  }
  loadImage(key, url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { this.images.set(key, img); resolve(img); };
      img.onerror = () => {
        Log.warn('Asset image manquant:', url, '→ fallback procédural');
        this.failed.add(key);
        resolve(null); // le jeu doit continuer proprement sans l'asset
      };
      img.src = url;
    });
  }
  async loadAll(manifest, onProgress) {
    let done = 0;
    const total = manifest.length;
    for (const { key, url } of manifest) {
      await this.loadImage(key, url);
      done++;
      if (onProgress) onProgress(done / total);
    }
  }
  get(key) { return this.images.get(key) || null; }
  has(key) { return this.images.has(key); }
}
