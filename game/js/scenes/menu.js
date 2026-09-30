// DUSHOOD — menu principal + paramètres + crédits (phases 30, 31).
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { Button, roundRect, wrapText, drawNayo } from '../ui/widgets.js';
import { ParticleSystem, Emitters } from '../core/particles.js';
import { hitRect } from '../core/input.js';
import { GameState } from '../gameplay/state.js';

export class MenuScene extends Scene {
  enter() {
    const g = this.game;
    this.mode = 'main'; // main | settings | credits | confirmNew
    this.particles = new ParticleSystem(120);
    g.audio.playMusic('menu');
    this._buildButtons();
    g.input.on('tap', p => this._onTap(p));
    g.input.on('drag', d => this._onDrag(d));
    g.input.on('move', () => {});
  }
  _buildButtons() {
    const g = this.game, t = k => g.i18n.t(k);
    const hasSave = g.saves.exists();
    const cx = CONFIG.WIDTH / 2, bw = 340, bh = 68, gap = 18;
    let y = 320;
    this.mainButtons = [];
    if (hasSave) {
      this.mainButtons.push(new Button({ x: cx - bw / 2, y, w: bw, h: bh, label: t('menu.continue'), primary: true, onTap: () => this._continue() })); y += bh + gap;
    }
    this.mainButtons.push(new Button({ x: cx - bw / 2, y, w: bw, h: bh, label: t('menu.new'), primary: !hasSave, onTap: () => hasSave ? (this.mode = 'confirmNew') : this._newGame() })); y += bh + gap;
    if (g.state.galleryUnlocked) {
      this.mainButtons.push(new Button({ x: cx - bw / 2, y, w: bw, h: bh, label: t('menu.gallery'), onTap: () => g.scenes.goto('gallery') })); y += bh + gap;
    }
    this.mainButtons.push(new Button({ x: cx - bw / 2, y, w: bw, h: bh, label: t('menu.settings'), onTap: () => (this.mode = 'settings') })); y += bh + gap;
    this.mainButtons.push(new Button({ x: cx - bw / 2, y, w: bw, h: bh, label: t('menu.credits'), onTap: () => (this.mode = 'credits') }));
    // paramètres
    this.btnBack = new Button({ x: cx - 300, y: 608, w: 260, h: 64, label: t('settings.back'), onTap: () => { this.mode = 'main'; this._buildButtons(); } });
    this.btnMute = new Button({ x: cx - 350, y: 428, w: 340, h: 60, fontSize: 21, label: '', onTap: () => this._toggleMute() });
    this.btnLang = new Button({ x: cx + 10, y: 428, w: 340, h: 60, fontSize: 21, label: '', onTap: () => this._toggleLang() });
    this.btnMotion = new Button({ x: cx - 350, y: 500, w: 340, h: 60, fontSize: 21, label: '', onTap: () => this._toggleSetting('reduceMotion') });
    this.btnText = new Button({ x: cx + 10, y: 500, w: 340, h: 60, fontSize: 21, label: '', onTap: () => this._toggleSetting('bigText') });
    this.btnReset = new Button({ x: cx + 40, y: 608, w: 260, h: 64, label: t('settings.reset'), fontSize: 20, onTap: () => this._resetSave() });
    this.btnYes = new Button({ x: cx - 190, y: 430, w: 170, h: 64, label: t('menu.yes'), primary: true, onTap: () => this._newGame() });
    this.btnNo = new Button({ x: cx + 20, y: 430, w: 170, h: 64, label: t('menu.no'), onTap: () => (this.mode = 'main') });
    this._toast = null; this._toastT = 0;
  }
  _continue() {
    const g = this.game;
    if (g.state.letterRead && !g.state.epilogueSeen) { g.scenes.goto('epilogue'); return; }
    const next = g.state.nextChapter();
    if (next) g.scenes.goto('map');
    else g.scenes.goto('epilogue');
  }
  _newGame() {
    const g = this.game;
    g.state.reset();
    g.persist();
    g.scenes.goto('intro');
  }
  _toggleMute() {
    const g = this.game;
    g.settings.muted = !g.settings.muted;
    g.audio.applySettings(g.settings);
    g.persistSettings();
  }
  _toggleSetting(key) {
    const g = this.game;
    g.settings[key] = !g.settings[key];
    g.persistSettings();
  }
  _toggleLang() {
    const g = this.game;
    const langs = g.i18n.languages();
    const idx = (langs.indexOf(g.i18n.lang) + 1) % langs.length;
    g.i18n.setLang(langs[idx]);
    g.settings.lang = langs[idx];
    g.hints.data = g.hintsForLang(langs[idx]);
    g.persistSettings();
    this._buildButtons();
    this.mode = 'settings';
  }
  _resetSave() {
    const g = this.game;
    g.saves.clear();
    g.state.reset();
    this._toast = g.i18n.t('settings.resetDone'); this._toastT = 0;
    this._buildButtons();
    this.mode = 'settings';
  }
  _sliderRects() {
    const cx = CONFIG.WIDTH / 2;
    return {
      music: { x: cx - 170, y: 280, w: 340, h: 60 },
      sfx: { x: cx - 170, y: 355, w: 340, h: 60 },
    };
  }
  _onDrag(d) {
    if (this.mode !== 'settings') return;
    const g = this.game, r = this._sliderRects();
    for (const key of ['music', 'sfx']) {
      const rr = { x: r[key].x - 10, y: r[key].y - 10, w: r[key].w + 20, h: r[key].h + 20 };
      if (hitRect(d, rr)) {
        const v = Math.max(0, Math.min(1, (d.x - r[key].x) / r[key].w));
        if (key === 'music') g.settings.musicVol = v; else g.settings.sfxVol = v;
        g.audio.applySettings(g.settings);
        g.persistSettings();
      }
    }
  }
  _onTap(p) {
    const g = this.game;
    g.audio.ensureContext(); g.audio.resume();
    if (this.mode === 'main') {
      for (const b of this.mainButtons) if (b.handleTap(p, g.audio)) return;
    } else if (this.mode === 'settings') {
      this._onDrag(p); // tap direct sur un slider
      if (this.btnMute.handleTap(p, g.audio)) return;
      if (this.btnLang.handleTap(p, g.audio)) return;
      if (this.btnMotion.handleTap(p, g.audio)) return;
      if (this.btnText.handleTap(p, g.audio)) return;
      if (this.btnReset.handleTap(p, g.audio)) return;
      if (this.btnBack.handleTap(p, g.audio)) return;
    } else if (this.mode === 'credits') {
      if (this.btnBack.handleTap(p, g.audio)) return;
    } else if (this.mode === 'confirmNew') {
      if (this.btnYes.handleTap(p, g.audio)) return;
      if (this.btnNo.handleTap(p, g.audio)) return;
    }
  }
  update(dt) {
    super.update(dt);
    this.particles.update(dt);
    if (!this.game.settings.reduceMotion) Emitters.firefly(this.particles, CONFIG.WIDTH, CONFIG.HEIGHT);
    const all = [...this.mainButtons, this.btnBack, this.btnMute, this.btnLang, this.btnMotion, this.btnText, this.btnReset, this.btnYes, this.btnNo];
    for (const b of all) b.update(dt);
    if (this._toast !== null) { this._toastT += dt; if (this._toastT > 2.2) this._toast = null; }
  }
  draw(ctx) {
    const g = this.game, W = CONFIG.WIDTH, H = CONFIG.HEIGHT, t = g.time;
    // fond
    const img = g.assets.get('bg_title');
    if (img) {
      const s = Math.max(W / img.width, H / img.height);
      ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s);
      ctx.fillStyle = 'rgba(5, 8, 24, 0.35)';
      ctx.fillRect(0, 0, W, H);
    } else {
      const gr = ctx.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, '#0a0e26'); gr.addColorStop(1, '#26134d');
      ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
    }
    this.particles.draw(ctx);
    // titre
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = '#ffd76e'; ctx.shadowBlur = 30;
    ctx.fillStyle = '#ffe9c2';
    ctx.font = '96px Dushood, Georgia, serif';
    ctx.fillText(g.i18n.t('app.title'), W / 2, 150 + Math.sin(t * 1.2) * 4);
    ctx.shadowBlur = 0;
    ctx.font = 'italic 26px Dushood, Georgia, serif';
    ctx.fillStyle = 'rgba(255, 233, 194, 0.85)';
    ctx.fillText(g.i18n.t('app.subtitle'), W / 2, 225);
    ctx.restore();
    drawNayo(ctx, W / 2 + 260 + Math.sin(t * 0.8) * 30, 140 + Math.cos(t * 1.1) * 20, t, 1.4);
    if (this.mode === 'main') {
      for (const b of this.mainButtons) b.draw(ctx);
    } else if (this.mode === 'settings') this._drawSettings(ctx);
    else if (this.mode === 'credits') this._drawCredits(ctx);
    else if (this.mode === 'confirmNew') this._drawConfirm(ctx);
    // version
    ctx.fillStyle = 'rgba(200, 210, 240, 0.4)';
    ctx.font = '16px Dushood, Georgia, serif';
    ctx.textAlign = 'right';
    ctx.fillText('v' + CONFIG.VERSION, W - 16, H - 16);
  }
  _panel(ctx, title) {
    const W = CONFIG.WIDTH;
    roundRect(ctx, W / 2 - 380, 240, 760, 450, 22);
    ctx.fillStyle = 'rgba(10, 13, 32, 0.92)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,214,130,0.6)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#ffd76e'; ctx.font = '30px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(title, W / 2, 258);
  }
  _drawSettings(ctx) {
    const g = this.game, t = k => g.i18n.t(k), W = CONFIG.WIDTH;
    this._panel(ctx, t('settings.title'));
    const r = this._sliderRects();
    const drawSlider = (rr, label, v) => {
      ctx.fillStyle = '#ffe9c2'; ctx.font = '21px Dushood, Georgia, serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(label, rr.x, rr.y + 10);
      roundRect(ctx, rr.x, rr.y + 28, rr.w, 12, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
      roundRect(ctx, rr.x, rr.y + 28, rr.w * v, 12, 6);
      ctx.fillStyle = '#ffd76e'; ctx.fill();
      ctx.beginPath(); ctx.arc(rr.x + rr.w * v, rr.y + 34, 16, 0, Math.PI * 2);
      ctx.fillStyle = '#fff3d8'; ctx.fill();
    };
    drawSlider(r.music, t('settings.music'), g.settings.musicVol);
    drawSlider(r.sfx, t('settings.sfx'), g.settings.sfxVol);
    this.btnMute.label = `${t('settings.mute')} : ${g.settings.muted ? 'ON' : 'OFF'}`;
    this.btnLang.label = `${t('settings.language')} : ${g.i18n.lang.toUpperCase()}`;
    this.btnMotion.label = `${t('settings.reduceMotion')} : ${g.settings.reduceMotion ? 'ON' : 'OFF'}`;
    this.btnText.label = `${t('settings.bigText')} : ${g.settings.bigText ? 'ON' : 'OFF'}`;
    this.btnMute.draw(ctx);
    this.btnLang.draw(ctx);
    this.btnMotion.draw(ctx);
    this.btnText.draw(ctx);
    this.btnBack.draw(ctx);
    this.btnReset.draw(ctx);
    if (this._toast) {
      ctx.fillStyle = '#9fe6a0'; ctx.font = '20px Dushood, Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText(this._toast, W / 2, 580);
    }
  }
  _drawCredits(ctx) {
    const g = this.game, W = CONFIG.WIDTH;
    this._panel(ctx, g.i18n.t('credits.title'));
    ctx.fillStyle = '#e8ebff'; ctx.font = '23px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const lines = g.i18n.t('credits.body').split('\n');
    let y = 320;
    for (const l of lines) { ctx.fillText(l, W / 2, y); y += 32; }
    this.btnBack.draw(ctx);
  }
  _drawConfirm(ctx) {
    const g = this.game, W = CONFIG.WIDTH;
    this._panel(ctx, g.i18n.t('menu.new'));
    ctx.fillStyle = '#e8ebff'; ctx.font = '24px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(g.i18n.t('menu.confirmNew'), W / 2, 340);
    this.btnYes.draw(ctx);
    this.btnNo.draw(ctx);
  }
}
