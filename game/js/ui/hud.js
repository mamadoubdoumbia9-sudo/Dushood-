// DUSHOOD — HUD en jeu (phase 30) : menu, indice, sac, fragments. Tout est fonctionnel.
import { CONFIG } from '../core/config.js';
import { Button, Icons, Toast, roundRect, wrapText } from './widgets.js';
import { ITEMS } from '../data/scenes-data.js';
import { hitRect } from '../core/input.js';

export class HUD {
  constructor(game, opts = {}) {
    this.game = game;
    this.toast = new Toast();
    this.showInventory = false;
    this.onMenu = opts.onMenu || (() => {});
    this.onHint = opts.onHint || (() => {});
    const M = 18;
    this.btnMenu = new Button({ x: M, y: M, w: 64, h: 64, label: '', icon: Icons.pause, onTap: () => this.onMenu() });
    this.btnHint = new Button({ x: CONFIG.WIDTH - M - 64, y: M, w: 64, h: 64, label: '', icon: Icons.bulb, onTap: () => this.onHint() });
    this.btnBag = new Button({ x: CONFIG.WIDTH - M - 64 * 2 - 12, y: M, w: 64, h: 64, label: '', icon: Icons.bag, onTap: () => { this.showInventory = !this.showInventory; this.game.audio.sfx('tap'); } });
    this.buttons = [this.btnMenu, this.btnHint, this.btnBag];
  }
  handleTap(p) {
    if (this.showInventory) {
      // fermer si tap hors panneau
      const r = this._invRect();
      if (!hitRect(p, r)) { this.showInventory = false; return true; }
      return true;
    }
    for (const b of this.buttons) if (b.handleTap(p, this.game.audio)) return true;
    return false;
  }
  _invRect() { return { x: CONFIG.WIDTH / 2 - 300, y: 140, w: 600, h: 320 }; }
  update(dt) {
    for (const b of this.buttons) b.update(dt);
    this.toast.update(dt);
    this.btnBag.badge = this.game.state.inventory.length || null;
  }
  draw(ctx, t) {
    for (const b of this.buttons) b.draw(ctx);
    // compteur de fragments (cœurs)
    const n = this.game.state.fragments.length;
    ctx.save();
    ctx.font = '22px Dushood, Georgia, serif';
    for (let i = 0; i < CONFIG.FRAGMENTS_TOTAL; i++) {
      const x = CONFIG.WIDTH / 2 - 70 + i * 35, y = 46;
      ctx.globalAlpha = i < n ? 1 : 0.25;
      Icons.heart(ctx, x, y, 26);
    }
    ctx.restore();
    if (this.showInventory) this._drawInventory(ctx);
    this.toast.draw(ctx);
  }
  _drawInventory(ctx) {
    const { i18n, state } = this.game;
    const r = this._invRect();
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    roundRect(ctx, r.x, r.y, r.w, r.h, 20);
    ctx.fillStyle = 'rgba(14, 17, 38, 0.96)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,130,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffd76e'; ctx.font = '28px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(i18n.t('inventory.title'), r.x + r.w / 2, r.y + 20);
    if (state.inventory.length === 0) {
      ctx.fillStyle = '#c9d2f0'; ctx.font = 'italic 22px Dushood, Georgia, serif';
      ctx.fillText(i18n.t('inventory.empty'), r.x + r.w / 2, r.y + r.h / 2 - 10);
    } else {
      state.inventory.forEach((id, i) => {
        const def = ITEMS[id];
        const ix = r.x + 70, iy = r.y + 90 + i * 62;
        if (def && Icons[def.icon]) Icons[def.icon](ctx, ix, iy, 40);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffe9c2'; ctx.font = '23px Dushood, Georgia, serif';
        ctx.fillText(i18n.t(def ? def.nameKey : id), ix + 45, iy - 10);
        ctx.fillStyle = '#9aa6cf'; ctx.font = 'italic 18px Dushood, Georgia, serif';
        ctx.fillText(i18n.t(def ? def.descKey : ''), ix + 45, iy + 15);
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      });
    }
    ctx.restore();
  }
}
