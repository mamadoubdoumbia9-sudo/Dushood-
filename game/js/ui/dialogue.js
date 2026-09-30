// DUSHOOD — boîte de dialogue avec effet machine à écrire (phase 10/30).
// Tap : d'abord complète la ligne, puis passe à la suivante.
import { CONFIG } from '../core/config.js';
import { roundRect, wrapText, drawNayo } from './widgets.js';

export class DialogueBox {
  constructor(i18n, audio, textScale = 1) {
    this.i18n = i18n;
    this.audio = audio;
    this.textScale = textScale; // accessibilité : texte agrandi (phase 85)
    this.lines = [];
    this.index = 0;
    this.chars = 0;
    this.speed = 34; // caractères/seconde
    this.active = false;
    this.onDone = null;
    this._acc = 0;
  }
  start(lines, onDone = null) {
    this.lines = lines || [];
    this.index = 0; this.chars = 0; this._acc = 0;
    this.active = this.lines.length > 0;
    this.onDone = onDone;
    if (!this.active && onDone) onDone();
  }
  currentText() {
    const l = this.lines[this.index];
    if (!l) return '';
    return l[this.i18n.lang] ?? l.fr ?? '';
  }
  isLineComplete() { return this.chars >= this.currentText().length; }
  tap() {
    if (!this.active) return false;
    if (!this.isLineComplete()) {
      this.chars = this.currentText().length; // complète la ligne
    } else {
      this.index++;
      this.chars = 0; this._acc = 0;
      if (this.audio) this.audio.sfx('page');
      if (this.index >= this.lines.length) {
        this.active = false;
        const cb = this.onDone; this.onDone = null;
        if (cb) cb();
      }
    }
    return true;
  }
  update(dt) {
    if (!this.active || this.isLineComplete()) return;
    this._acc += dt * this.speed;
    const n = Math.floor(this._acc);
    if (n > 0) {
      this.chars = Math.min(this.chars + n, this.currentText().length);
      this._acc -= n;
    }
  }
  draw(ctx, t) {
    if (!this.active) return;
    const l = this.lines[this.index];
    const W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const bh = 168, bx = 60, by = H - bh - 26, bw = W - 120;
    ctx.save();
    // panneau
    roundRect(ctx, bx, by, bw, bh, 18);
    ctx.fillStyle = 'rgba(10, 13, 32, 0.88)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = l.who === 'nayo' ? 'rgba(255, 214, 110, 0.75)' : 'rgba(150, 170, 230, 0.55)';
    ctx.stroke();
    // locuteur
    let textX = bx + 30;
    if (l.who === 'nayo') {
      drawNayo(ctx, bx + 52, by + bh / 2 - 8, t, 1.15);
      textX = bx + 110;
      ctx.fillStyle = '#ffd76e';
      ctx.font = 'italic 19px Dushood, Georgia, serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('Nayo', textX, by + 14);
    }
    // texte progressif
    const shown = this.currentText().slice(0, this.chars);
    const fs = Math.round(24 * this.textScale);
    ctx.fillStyle = l.who === 'nayo' ? '#fff3d8' : '#dfe6ff';
    ctx.font = (l.who === 'world' ? 'italic ' : '') + fs + 'px Dushood, Georgia, serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const lines = wrapText(ctx, shown, bw - (textX - bx) - 40);
    let y = by + (l.who === 'nayo' ? 44 : 28);
    const lh = Math.round(31 * this.textScale);
    const maxLines = this.textScale > 1 ? 3 : 4;
    for (const line of lines.slice(0, maxLines)) { ctx.fillText(line, textX, y); y += lh; }
    // invite "continuer"
    if (this.isLineComplete()) {
      const a = 0.5 + 0.5 * Math.sin(t * 4);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      const ax = bx + bw - 34, ay = by + bh - 26;
      ctx.moveTo(ax - 9, ay - 8); ctx.lineTo(ax + 9, ay - 8); ctx.lineTo(ax, ay + 4);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
}
