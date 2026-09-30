// DUSHOOD — contenu secret (phase 61) : galerie des souvenirs, débloquée après la fin.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { Button, roundRect } from '../ui/widgets.js';
import { CHAPTERS } from '../data/scenes-data.js';
import { LETTER_FRAGMENTS } from '../data/letter.js';
import { wrapText } from '../ui/widgets.js';
import { hitRect } from '../core/input.js';

export class GalleryScene extends Scene {
  enter() {
    const g = this.game;
    g.audio.playMusic('letter');
    this.selected = null; // index de fragment affiché
    this.btnBack = new Button({
      x: 18, y: 18, w: 140, h: 60, label: g.i18n.t('settings.back'),
      onTap: () => (this.selected !== null ? (this.selected = null) : g.scenes.goto('menu')),
    });
    this.cards = Object.values(CHAPTERS).map((ch, i) => ({
      i, ch,
      rect: { x: 90 + i * 230, y: 180, w: 200, h: 300 },
    }));
    g.input.on('tap', p => this._onTap(p));
  }
  _onTap(p) {
    const g = this.game;
    if (this.btnBack.handleTap(p, g.audio)) return;
    if (this.selected !== null) { this.selected = null; return; }
    for (const c of this.cards) {
      if (hitRect(p, c.rect)) {
        g.audio.sfx('page');
        this.selected = c.i;
        return;
      }
    }
  }
  update(dt) { super.update(dt); this.btnBack.update(dt); }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#131022'); gr.addColorStop(1, '#251a3d');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffe9c2'; ctx.font = '36px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(g.i18n.t('gallery.title'), W / 2, 60);
    if (this.selected === null) {
      for (const c of this.cards) {
        const r = c.rect;
        const img = g.assets.get(c.ch.bg);
        ctx.save();
        roundRect(ctx, r.x, r.y, r.w, r.h, 14);
        ctx.fillStyle = 'rgba(20, 24, 48, 0.9)'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,214,130,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.clip();
        if (img) {
          const s = Math.max(r.w / img.width, (r.h - 60) / img.height);
          ctx.drawImage(img, r.x + (r.w - img.width * s) / 2, r.y, img.width * s, img.height * s);
        }
        ctx.fillStyle = 'rgba(10, 12, 30, 0.85)';
        ctx.fillRect(r.x, r.y + r.h - 56, r.w, 56);
        ctx.fillStyle = '#ffe9c2'; ctx.font = '17px Dushood, Georgia, serif';
        const name = g.i18n.t(c.ch.nameKey);
        ctx.fillText(name.length > 22 ? name.slice(0, 21) + '…' : name, r.x + r.w / 2, r.y + r.h - 44);
        ctx.restore();
      }
      ctx.fillStyle = 'rgba(200,210,240,0.6)'; ctx.font = 'italic 19px Dushood, Georgia, serif';
      ctx.fillText('Touche un lieu pour relire son fragment de lettre.', W / 2, 530);
    } else {
      // fragment de lettre du chapitre sélectionné
      const px = W / 2 - 380, pw = 760, py = 140, ph = 440;
      roundRect(ctx, px, py, pw, ph, 12);
      ctx.fillStyle = '#f7ecd4'; ctx.fill();
      ctx.fillStyle = '#4a3520'; ctx.font = '23px Dushood, Georgia, serif';
      ctx.textAlign = 'left';
      const lines = wrapText(ctx, LETTER_FRAGMENTS[this.selected], pw - 120);
      let y = py + 50;
      for (const l of lines) { ctx.fillText(l, px + 60, y); y += 32; }
    }
    this.btnBack.draw(ctx);
  }
}
