// DUSHOOD — scène de chargement (phase 96) : progression réelle des assets.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { drawNayo } from '../ui/widgets.js';

const MANIFEST = [
  { key: 'bg_title',  url: 'assets/img/bg_title.jpg' },
  { key: 'bg_garden', url: 'assets/img/bg_garden.jpg' },
  { key: 'bg_forest', url: 'assets/img/bg_forest.jpg' },
  { key: 'bg_lake',   url: 'assets/img/bg_lake.jpg' },
  { key: 'bg_city',   url: 'assets/img/bg_city.jpg' },
  { key: 'bg_tower',  url: 'assets/img/bg_tower.jpg' },
  { key: 'bg_epilogue', url: 'assets/img/bg_epilogue.jpg' },
];

export class BootScene extends Scene {
  enter() {
    this.progress = 0;
    this.ready = false;
    this.game.assets.loadAll(MANIFEST, p => { this.progress = p; })
      .then(() => { this.ready = true; })
      .catch(() => { this.ready = true; }); // échec propre : le jeu a des fallbacks
    this._t = 0;
  }
  update(dt) {
    super.update(dt);
    this._t += dt;
    if (this.ready && this._t > 0.8) this.game.scenes.goto('menu');
  }
  draw(ctx) {
    const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#070a1c'); g.addColorStop(1, '#141a3d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    drawNayo(ctx, W / 2, H / 2 - 60, this._t, 2.2);
    ctx.fillStyle = '#ffe9c2';
    ctx.font = '28px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.game.i18n.t('loading'), W / 2, H / 2 + 60);
    // barre de progression
    const bw = 420, bx = (W - bw) / 2, by = H / 2 + 110;
    ctx.strokeStyle = 'rgba(255,214,130,0.5)'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, 14);
    ctx.fillStyle = '#ffd76e';
    ctx.fillRect(bx + 2, by + 2, (bw - 4) * this.progress, 10);
  }
}
