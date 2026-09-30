// DUSHOOD — carte de Dushood (phase 11) : navigation entre les lieux, verrouillage réel.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { CHAPTERS } from '../data/scenes-data.js';
import { Button, Icons, Toast, roundRect, drawNayo } from '../ui/widgets.js';
import { ParticleSystem, Emitters } from '../core/particles.js';
import { hitCircle } from '../core/input.js';

const NODES = [
  { id: 'garden', x: 220, y: 520 },
  { id: 'forest', x: 440, y: 380 },
  { id: 'lake',   x: 680, y: 500 },
  { id: 'city',   x: 900, y: 350 },
  { id: 'tower',  x: 1100, y: 200 },
];

export class MapScene extends Scene {
  enter() {
    const g = this.game;
    g.audio.playMusic('menu');
    this.toast = new Toast();
    this.particles = new ParticleSystem(100);
    this.btnMenu = new Button({ x: 18, y: 18, w: 64, h: 64, label: '', icon: Icons.pause, onTap: () => g.scenes.goto('menu') });
    g.input.on('tap', p => this._onTap(p));
  }
  _onTap(p) {
    const g = this.game;
    g.audio.ensureContext(); g.audio.resume();
    if (this.btnMenu.handleTap(p, g.audio)) return;
    for (const n of NODES) {
      if (hitCircle(p, { x: n.x, y: n.y, r: 70 })) {
        if (g.state.isUnlocked(n.id)) {
          g.audio.sfx('hotspot');
          g.scenes.goto('explore', { chapter: n.id });
        } else {
          g.audio.sfx('error');
          this.toast.show(g.i18n.t('chapter.locked'));
        }
        return;
      }
    }
  }
  update(dt) {
    super.update(dt);
    this.btnMenu.update(dt);
    this.toast.update(dt);
    this.particles.update(dt);
    if (!this.game.settings.reduceMotion) Emitters.firefly(this.particles, CONFIG.WIDTH, CONFIG.HEIGHT);
  }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT, t = g.time;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#0a0e26'); gr.addColorStop(1, '#1c1440');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    // chemin en pointillés reliant les lieux
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 214, 110, 0.35)';
    ctx.lineWidth = 3; ctx.setLineDash([2, 14]); ctx.lineCap = 'round';
    ctx.beginPath();
    NODES.forEach((n, i) => {
      if (i === 0) ctx.moveTo(n.x, n.y);
      else {
        const prev = NODES[i - 1];
        const mx = (prev.x + n.x) / 2, my = Math.min(prev.y, n.y) - 60;
        ctx.quadraticCurveTo(mx, my, n.x, n.y);
      }
    });
    ctx.stroke();
    ctx.restore();
    // titre
    ctx.fillStyle = '#ffe9c2'; ctx.font = '42px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(g.i18n.t('map.title'), W / 2, 34);
    ctx.font = '20px Dushood, Georgia, serif';
    ctx.fillStyle = 'rgba(200, 210, 240, 0.7)';
    ctx.fillText(`${g.state.progressPercent()} %`, W / 2, 88);
    // lieux
    for (const n of NODES) {
      const ch = CHAPTERS[n.id];
      const unlocked = g.state.isUnlocked(n.id);
      const done = g.state.isCompleted(n.id);
      const pulse = 0.5 + 0.5 * Math.sin(t * 2 + n.x);
      ctx.save();
      // halo
      const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 70);
      halo.addColorStop(0, unlocked ? `rgba(255, 226, 150, ${0.35 + (done ? 0 : pulse * 0.25)})` : 'rgba(90, 100, 140, 0.25)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(n.x, n.y, 70, 0, Math.PI * 2); ctx.fill();
      // médaillon
      ctx.beginPath(); ctx.arc(n.x, n.y, 44, 0, Math.PI * 2);
      ctx.fillStyle = unlocked ? (done ? 'rgba(80, 120, 90, 0.9)' : 'rgba(40, 36, 80, 0.95)') : 'rgba(25, 28, 48, 0.9)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = unlocked ? '#ffd76e' : 'rgba(120, 130, 170, 0.5)';
      ctx.stroke();
      if (done) {
        ctx.strokeStyle = '#bdf5c8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(n.x - 14, n.y); ctx.lineTo(n.x - 4, n.y + 12); ctx.lineTo(n.x + 16, n.y - 10);
        ctx.stroke();
      } else if (!unlocked) {
        // cadenas
        ctx.strokeStyle = 'rgba(160, 170, 210, 0.8)'; ctx.lineWidth = 3;
        roundRect(ctx, n.x - 11, n.y - 4, 22, 16, 3); ctx.stroke();
        ctx.beginPath(); ctx.arc(n.x, n.y - 6, 8, Math.PI, 0); ctx.stroke();
      } else {
        drawNayo(ctx, n.x, n.y - 2, t + n.x, 0.9);
      }
      // nom
      ctx.fillStyle = unlocked ? '#ffe9c2' : 'rgba(150, 160, 200, 0.6)';
      ctx.font = '19px Dushood, Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(g.i18n.t(ch.nameKey), n.x, n.y + 56);
      ctx.restore();
    }
    // fragments
    for (let i = 0; i < CONFIG.FRAGMENTS_TOTAL; i++) {
      ctx.save();
      ctx.globalAlpha = i < g.state.fragments.length ? 1 : 0.22;
      Icons.heart(ctx, W - 200 + i * 36, 50, 26);
      ctx.restore();
    }
    this.particles.draw(ctx);
    this.btnMenu.draw(ctx);
    this.toast.draw(ctx);
  }
}
