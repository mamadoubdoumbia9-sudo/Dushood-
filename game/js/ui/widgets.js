// DUSHOOD — composants UI tactiles (phases 30, 31) : boutons ≥ 64px, feedback visuel+sonore.
import { CONFIG } from '../core/config.js';
import { hitRect, expandTouch } from '../core/input.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapText(ctx, text, maxWidth) {
  const out = [];
  for (const para of String(text).split('\n')) {
    if (para === '') { out.push(''); continue; }
    let line = '';
    for (const word of para.split(' ')) {
      const trial = line ? line + ' ' + word : word;
      if (ctx.measureText(trial).width > maxWidth && line) { out.push(line); line = word; }
      else line = trial;
    }
    out.push(line);
  }
  return out;
}

export class Button {
  constructor(opts) {
    this.x = opts.x; this.y = opts.y;
    this.w = Math.max(opts.w || 220, CONFIG.MIN_TOUCH);
    this.h = Math.max(opts.h || 64, CONFIG.MIN_TOUCH);
    this.label = opts.label || '';
    this.icon = opts.icon || null;   // fn(ctx, cx, cy, size)
    this.onTap = opts.onTap || (() => {});
    this.enabled = opts.enabled !== false;
    this.visible = opts.visible !== false;
    this.primary = !!opts.primary;
    this.fontSize = opts.fontSize || 26;
    this.pressScale = 1;
    this.badge = null;
  }
  rect() { return { x: this.x, y: this.y, w: this.w, h: this.h }; }
  handleTap(p, audio) {
    if (!this.visible || !this.enabled) return false;
    if (hitRect(p, expandTouch(this.rect(), CONFIG.MIN_TOUCH))) {
      this.pressScale = 0.92;
      if (audio) audio.sfx('tap');
      this.onTap();
      return true;
    }
    return false;
  }
  update(dt) { this.pressScale += (1 - this.pressScale) * Math.min(dt * 12, 1); }
  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    const cx = this.x + this.w / 2, cy = this.y + this.h / 2;
    ctx.translate(cx, cy);
    ctx.scale(this.pressScale, this.pressScale);
    ctx.translate(-cx, -cy);
    ctx.globalAlpha = this.enabled ? 1 : 0.45; // état désactivé visible
    roundRect(ctx, this.x, this.y, this.w, this.h, 16);
    if (this.primary) {
      const g = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.h);
      g.addColorStop(0, '#ffce6b'); g.addColorStop(1, '#f2a83b');
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = 'rgba(20, 24, 48, 0.82)';
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.primary ? 'rgba(255,255,255,0.55)' : 'rgba(255, 214, 130, 0.5)';
    ctx.stroke();
    ctx.fillStyle = this.primary ? '#3a2404' : '#ffe9c2';
    ctx.font = `${this.fontSize}px Dushood, Georgia, serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (this.icon) {
      this.icon(ctx, this.x + this.h / 2 + 6, cy, this.h * 0.42);
      ctx.fillText(this.label, cx + this.h * 0.25, cy + 1);
    } else {
      ctx.fillText(this.label, cx, cy + 1);
    }
    if (this.badge) {
      ctx.fillStyle = '#ff7eb3';
      ctx.beginPath(); ctx.arc(this.x + this.w - 8, this.y + 8, 13, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.font = '16px Dushood, Georgia, serif';
      ctx.fillText(String(this.badge), this.x + this.w - 8, this.y + 9);
    }
    ctx.restore();
  }
}

export class Toast {
  constructor() { this.msg = null; this.t = 0; this.dur = 2.6; }
  show(msg, dur = 2.6) { this.msg = msg; this.t = 0; this.dur = dur; }
  update(dt) { if (this.msg) { this.t += dt; if (this.t > this.dur) this.msg = null; } }
  draw(ctx) {
    if (!this.msg) return;
    const p = this.t / this.dur;
    const alpha = p < 0.1 ? p / 0.1 : p > 0.8 ? (1 - p) / 0.2 : 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '24px Dushood, Georgia, serif';
    const w = ctx.measureText(this.msg).width + 60;
    const x = (CONFIG.WIDTH - w) / 2, y = 90;
    roundRect(ctx, x, y, w, 54, 27);
    ctx.fillStyle = 'rgba(15, 18, 40, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 214, 130, 0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffe9c2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(this.msg, CONFIG.WIDTH / 2, y + 28);
    ctx.restore();
  }
}

// Icônes dessinées par code (2D, aucune dépendance)
export const Icons = {
  key(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#ffd76e'; ctx.lineWidth = s * 0.18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx - s * 0.3, cy, s * 0.32, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.02, cy); ctx.lineTo(cx + s * 0.7, cy);
    ctx.moveTo(cx + s * 0.45, cy); ctx.lineTo(cx + s * 0.45, cy + s * 0.28);
    ctx.moveTo(cx + s * 0.7, cy); ctx.lineTo(cx + s * 0.7, cy + s * 0.38); ctx.stroke();
    ctx.restore();
  },
  stone(ctx, cx, cy, s) {
    ctx.save();
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.6);
    g.addColorStop(0, '#e8f4ff'); g.addColorStop(1, '#7fa8d9');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(cx, cy, s * 0.55, s * 0.42, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  },
  flute(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#c8935a'; ctx.lineWidth = s * 0.22; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.6, cy + s * 0.3); ctx.lineTo(cx + s * 0.6, cy - s * 0.3); ctx.stroke();
    ctx.fillStyle = '#5a3a1a';
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath(); ctx.arc(cx + i * s * 0.25, cy - i * s * 0.12, s * 0.06, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  },
  heart(ctx, cx, cy, s) {
    ctx.save(); ctx.fillStyle = '#ff7eb3';
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.35);
    ctx.bezierCurveTo(cx - s * 0.7, cy - s * 0.15, cx - s * 0.35, cy - s * 0.55, cx, cy - s * 0.2);
    ctx.bezierCurveTo(cx + s * 0.35, cy - s * 0.55, cx + s * 0.7, cy - s * 0.15, cx, cy + s * 0.35);
    ctx.fill(); ctx.restore();
  },
  bag(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#ffe9c2'; ctx.lineWidth = s * 0.14;
    roundRect(ctx, cx - s * 0.45, cy - s * 0.25, s * 0.9, s * 0.65, s * 0.12); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy - s * 0.25, s * 0.28, Math.PI, 0); ctx.stroke();
    ctx.restore();
  },
  bulb(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#ffe9c2'; ctx.fillStyle = 'rgba(255,215,110,0.35)'; ctx.lineWidth = s * 0.12;
    ctx.beginPath(); ctx.arc(cx, cy - s * 0.08, s * 0.34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - s * 0.15, cy + s * 0.3); ctx.lineTo(cx + s * 0.15, cy + s * 0.3); ctx.stroke();
    ctx.restore();
  },
  gear(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#ffe9c2'; ctx.lineWidth = s * 0.13;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * s * 0.3, cy + Math.sin(a) * s * 0.3);
      ctx.lineTo(cx + Math.cos(a) * s * 0.48, cy + Math.sin(a) * s * 0.48);
      ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  },
  pause(ctx, cx, cy, s) {
    ctx.save(); ctx.strokeStyle = '#ffe9c2'; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.18, cy - s * 0.3); ctx.lineTo(cx - s * 0.18, cy + s * 0.3);
    ctx.moveTo(cx + s * 0.18, cy - s * 0.3); ctx.lineTo(cx + s * 0.18, cy + s * 0.3); ctx.stroke();
    ctx.restore();
  },
};

// Dessin de la luciole Nayo (sprite procédural animé, phase 23/24)
export function drawNayo(ctx, x, y, t, scale = 1) {
  ctx.save();
  const bob = Math.sin(t * 2.2) * 6 * scale;
  const flap = Math.sin(t * 18);
  const cy = y + bob;
  // halo
  const g = ctx.createRadialGradient(x, cy, 0, x, cy, 34 * scale);
  g.addColorStop(0, 'rgba(255, 233, 168, 0.85)');
  g.addColorStop(0.4, 'rgba(255, 214, 110, 0.32)');
  g.addColorStop(1, 'rgba(255, 214, 110, 0)');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(x, cy, 34 * scale, 0, Math.PI * 2); ctx.fill();
  // ailes
  ctx.fillStyle = 'rgba(220, 240, 255, 0.7)';
  ctx.beginPath();
  ctx.ellipse(x - 7 * scale, cy - 4 * scale, 9 * scale, 4.5 * scale * (0.6 + 0.4 * Math.abs(flap)), -0.6 + flap * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + 7 * scale, cy - 4 * scale, 9 * scale, 4.5 * scale * (0.6 + 0.4 * Math.abs(flap)), 0.6 - flap * 0.35, 0, Math.PI * 2);
  ctx.fill();
  // corps
  const bg = ctx.createLinearGradient(x, cy - 8 * scale, x, cy + 10 * scale);
  bg.addColorStop(0, '#6b4a2b'); bg.addColorStop(0.55, '#a06a35'); bg.addColorStop(1, '#ffd76e');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.ellipse(x, cy, 6.5 * scale, 10 * scale, 0, 0, Math.PI * 2); ctx.fill();
  // lumière de queue pulsante
  const pulse = 0.7 + 0.3 * Math.sin(t * 5);
  ctx.fillStyle = `rgba(255, 240, 170, ${pulse})`;
  ctx.beginPath(); ctx.arc(x, cy + 8 * scale, 4.5 * scale, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
