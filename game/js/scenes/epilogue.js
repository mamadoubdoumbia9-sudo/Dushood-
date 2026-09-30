// DUSHOOD — épilogue (phase 60) : montée des lucioles, dialogue final, retour menu.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { DialogueBox } from '../ui/dialogue.js';
import { DIALOGUES } from '../data/dialogues.js';
import { ParticleSystem } from '../core/particles.js';
import { drawNayo } from '../ui/widgets.js';

export class EpilogueScene extends Scene {
  enter() {
    const g = this.game;
    g.audio.playMusic('letter');
    this.dialogue = new DialogueBox(g.i18n, g.audio, g.settings.bigText ? 1.25 : 1);
    this.particles = new ParticleSystem(260);
    this.rise = 0;
    this.dialogue.start(DIALOGUES.epilogue, () => this._finish());
    g.input.on('tap', () => {
      g.audio.ensureContext(); g.audio.resume();
      this.dialogue.tap();
    });
  }
  _finish() {
    const g = this.game;
    g.state.epilogueSeen = true;
    g.state.galleryUnlocked = true;
    g.persist();
    g.scenes.goto('menu', {}, 1.4);
  }
  update(dt) {
    super.update(dt);
    this.rise += dt;
    this.dialogue.update(dt);
    this.particles.update(dt);
    // lucioles montantes
    if (Math.random() < 0.3 && this.particles.activeCount() < 160) {
      this.particles.spawn({
        x: Math.random() * CONFIG.WIDTH,
        y: CONFIG.HEIGHT + 10,
        vx: (Math.random() - 0.5) * 20,
        vy: -30 - Math.random() * 50,
        maxLife: 12, size: 1.5 + Math.random() * 3,
        color: Math.random() < 0.25 ? '#ffb3cd' : '#ffe9a8',
        glow: true, wander: 18, alpha: 0.95,
      });
    }
  }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT, t = g.time;
    // aube sur Dushood
    const img = g.assets.get('bg_epilogue');
    if (img) {
      const s = Math.max(W / img.width, H / img.height);
      ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
      ctx.fillStyle = 'rgba(20, 12, 40, 0.25)';
      ctx.fillRect(0, 0, W, H);
    } else {
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#2c1a4e');
      gr.addColorStop(0.5, '#7a3b6e');
      gr.addColorStop(0.8, '#e8907a');
      gr.addColorStop(1, '#ffd39a');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      // silhouette de la tour
      ctx.fillStyle = 'rgba(25, 15, 45, 0.9)';
      ctx.beginPath();
      ctx.moveTo(W * 0.42, H);
      ctx.lineTo(W * 0.45, H * 0.35);
      ctx.lineTo(W * 0.5, H * 0.22);
      ctx.lineTo(W * 0.55, H * 0.35);
      ctx.lineTo(W * 0.58, H);
      ctx.closePath(); ctx.fill();
    }
    this.particles.draw(ctx);
    drawNayo(ctx, W / 2, H * 0.32 - Math.min(this.rise * 6, 80), t, 1.6);
    this.dialogue.draw(ctx, t);
  }
}
