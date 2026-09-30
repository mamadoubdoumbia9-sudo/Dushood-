// DUSHOOD — cinématique d'introduction (phase 26) : réelle, pilotée par le dialogue, skippable.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { DialogueBox } from '../ui/dialogue.js';
import { DIALOGUES } from '../data/dialogues.js';
import { ParticleSystem, Emitters } from '../core/particles.js';
import { drawNayo } from '../ui/widgets.js';

export class IntroScene extends Scene {
  enter() {
    const g = this.game;
    g.audio.playMusic('menu');
    this.dialogue = new DialogueBox(g.i18n, g.audio, g.settings.bigText ? 1.25 : 1);
    this.particles = new ParticleSystem(140);
    this.nayoIn = 0; // apparition progressive de Nayo
    this.dialogue.start(DIALOGUES.intro, () => this._finish());
    g.input.on('tap', () => {
      g.audio.ensureContext(); g.audio.resume();
      this.dialogue.tap();
    });
  }
  _finish() {
    const g = this.game;
    g.state.introSeen = true;
    g.persist();
    g.scenes.goto('map');
  }
  update(dt) {
    super.update(dt);
    this.particles.update(dt);
    this.dialogue.update(dt);
    if (this.dialogue.index >= 1) this.nayoIn = Math.min(this.nayoIn + dt * 0.7, 1);
    if (!this.game.settings.reduceMotion) Emitters.firefly(this.particles, CONFIG.WIDTH, CONFIG.HEIGHT);
  }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT, t = g.time;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#05070f'); gr.addColorStop(0.7, '#101736'); gr.addColorStop(1, '#1d2a55');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    // horizon lointain de Dushood (silhouettes 2D)
    ctx.save();
    ctx.fillStyle = 'rgba(28, 22, 58, 0.9)';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.72);
    for (let x = 0; x <= W; x += 40) {
      ctx.lineTo(x, H * 0.72 - Math.abs(Math.sin(x * 0.011)) * 90 - (x > W * 0.6 && x < W * 0.72 ? 150 : 0));
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    this.particles.draw(ctx);
    if (this.nayoIn > 0) {
      ctx.save();
      ctx.globalAlpha = this.nayoIn;
      drawNayo(ctx, W / 2 + Math.sin(t) * 60, H * 0.4 + Math.cos(t * 1.3) * 30, t, 2 * this.nayoIn);
      ctx.restore();
    }
    this.dialogue.draw(ctx, t);
  }
}
