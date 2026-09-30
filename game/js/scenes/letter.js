// DUSHOOD — la lettre finale (phase 59). Point émotionnel central du cadeau.
// Machine à écrire, cœur de particules sur « Je t'aime ❤️ », aucune interruption.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { LETTER_FULL } from '../data/letter.js';
import { roundRect, wrapText } from '../ui/widgets.js';
import { ParticleSystem, Emitters } from '../core/particles.js';

export class LetterScene extends Scene {
  enter() {
    const g = this.game;
    g.audio.playMusic('letter');
    this.text = LETTER_FULL;
    this.chars = 0;
    this.speed = 26;
    this._acc = 0;
    this.scroll = 0;
    this.heartFired = false;
    this.doneT = 0;
    this.particles = new ParticleSystem(200);
    this.heartIndex = this.text.indexOf('Je t\u2019aime ❤️');
    g.input.on('tap', () => {
      g.audio.ensureContext(); g.audio.resume();
      if (this.chars < this.text.length) {
        this.chars = this.text.length; // révèle tout
      } else if (this.doneT > 1.2) {
        this._finish();
      }
    });
    g.input.on('drag', d => {
      this.scroll = Math.max(0, this.scroll - d.dy * 0.06);
    });
  }
  _finish() {
    const g = this.game;
    g.state.letterRead = true;
    g.state.galleryUnlocked = true;
    g.persist();
    g.scenes.goto('epilogue', {}, 1.2);
  }
  update(dt) {
    super.update(dt);
    this.particles.update(dt);
    if (this.chars < this.text.length) {
      this._acc += dt * this.speed;
      const n = Math.floor(this._acc);
      if (n > 0) { this.chars = Math.min(this.chars + n, this.text.length); this._acc -= n; }
    } else {
      this.doneT += dt;
    }
    if (!this.heartFired && this.heartIndex >= 0 && this.chars >= this.heartIndex + 12) {
      this.heartFired = true;
      this.game.audio.sfx('heart');
      Emitters.heartBurst(this.particles, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    }
    if (!this.game.settings.reduceMotion) Emitters.firefly(this.particles, CONFIG.WIDTH, CONFIG.HEIGHT);
  }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#171029'); gr.addColorStop(1, '#2c1a3e');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    this.particles.draw(ctx);
    // parchemin
    const px = W / 2 - 400, pw = 800, py = 40, ph = H - 80;
    ctx.save();
    roundRect(ctx, px, py, pw, ph, 12);
    const pg = ctx.createLinearGradient(px, py, px, py + ph);
    pg.addColorStop(0, '#f7ecd4'); pg.addColorStop(1, '#eddfbe');
    ctx.fillStyle = pg;
    ctx.shadowColor = 'rgba(255, 214, 110, 0.5)'; ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.clip();
    // titre
    ctx.fillStyle = '#6b4a2b';
    ctx.font = 'italic 22px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(g.i18n.t('letter.title'), W / 2, py + 22 - this.scroll);
    // texte
    ctx.font = '24px Dushood, Georgia, serif';
    ctx.fillStyle = '#4a3520';
    ctx.textAlign = 'left';
    const shown = this.text.slice(0, this.chars);
    const lines = wrapText(ctx, shown, pw - 120);
    let y = py + 70 - this.scroll;
    // auto-scroll pour suivre l'écriture
    const totalH = lines.length * 33;
    const targetScroll = Math.max(0, totalH - (ph - 140));
    if (this.chars < this.text.length) this.scroll += (targetScroll - this.scroll) * 0.06;
    for (const line of lines) {
      if (y > py - 40 && y < py + ph + 10) {
        if (line.includes('Je t\u2019aime')) {
          ctx.save();
          ctx.fillStyle = '#b3305a';
          ctx.font = '30px Dushood, Georgia, serif';
          ctx.fillText(line, px + 60, y);
          ctx.restore();
        } else {
          ctx.fillText(line, px + 60, y);
        }
      }
      y += 33;
    }
    ctx.restore();
    // invite
    if (this.chars >= this.text.length && this.doneT > 1.2) {
      const a = 0.5 + 0.5 * Math.sin(g.time * 3);
      ctx.globalAlpha = a;
      ctx.fillStyle = '#ffe9c2';
      ctx.font = '22px Dushood, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.i18n.t('tap.continue'), W / 2, H - 26);
      ctx.globalAlpha = 1;
    }
  }
}
