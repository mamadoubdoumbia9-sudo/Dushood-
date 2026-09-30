// DUSHOOD — moteur : boucle, mise à l'échelle responsive, gestionnaire de scènes, transitions.
import { CONFIG } from './config.js';
import { Input } from './input.js';
import { TweenManager } from './tween.js';
import { Log } from './log.js';

export class SceneManager {
  constructor(game) {
    this.game = game;
    this.current = null;
    this.scenes = new Map();
    this.transition = null; // {phase:'out'|'in', t, dur, nextKey, params}
  }
  register(key, scene) { this.scenes.set(key, scene); scene.game = this.game; scene.key = key; }
  goto(key, params = {}, dur = 0.55) {
    if (!this.scenes.has(key)) { Log.error('Scene inconnue:', key); return; }
    if (this.transition) return;
    if (!this.current) { this._activate(key, params); this.transition = { phase: 'in', t: 0, dur }; return; }
    this.transition = { phase: 'out', t: 0, dur, nextKey: key, params };
  }
  _activate(key, params) {
    if (this.current) { this.current.exit(); this.game.input.removeAll(); }
    this.current = this.scenes.get(key);
    Log.info('Scène:', key);
    this.game.input.removeAll();
    this.current.enter(params);
  }
  update(dt) {
    if (this.current) this.current.update(dt);
    if (this.transition) {
      const tr = this.transition;
      tr.t += dt;
      if (tr.t >= tr.dur) {
        if (tr.phase === 'out') {
          this._activate(tr.nextKey, tr.params);
          this.transition = { phase: 'in', t: 0, dur: tr.dur };
        } else {
          this.transition = null;
        }
      }
    }
  }
  draw(ctx) {
    if (this.current) this.current.draw(ctx);
    if (this.transition) {
      const tr = this.transition;
      const p = Math.min(tr.t / tr.dur, 1);
      const alpha = tr.phase === 'out' ? p : 1 - p;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#05060f';
      ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
      ctx.restore();
    }
  }
}

export class Scene {
  constructor() { this.game = null; this.key = ''; this.tweens = new TweenManager(); }
  enter(params) {}
  exit() { this.tweens.clear(); }
  update(dt) { this.tweens.update(dt); }
  draw(ctx) {}
}

export class Engine {
  constructor(canvas, deps) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.viewport = { scale: 1, offX: 0, offY: 0 };
    this.input = new Input(canvas, this.viewport);
    this.scenes = new SceneManager(this);
    this.time = 0;
    this._last = 0;
    this._running = false;
    this._raf = 0;
    Object.assign(this, deps); // assets, audio, saves, i18n, state...
    this._resize = this._resize.bind(this);
    window.addEventListener('resize', this._resize);
    this._resize();
  }
  _resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const vw = window.innerWidth, vh = window.innerHeight;
    this.canvas.width = Math.round(vw * dpr);
    this.canvas.height = Math.round(vh * dpr);
    this.canvas.style.width = vw + 'px';
    this.canvas.style.height = vh + 'px';
    const scale = Math.min(this.canvas.width / CONFIG.WIDTH, this.canvas.height / CONFIG.HEIGHT);
    this.viewport.scale = scale;
    this.viewport.offX = (this.canvas.width - CONFIG.WIDTH * scale) / 2;
    this.viewport.offY = (this.canvas.height - CONFIG.HEIGHT * scale) / 2;
  }
  start() {
    if (this._running) return;
    this._running = true;
    this._last = performance.now();
    const loop = (now) => {
      if (!this._running) return;
      let dt = (now - this._last) / 1000;
      this._last = now;
      dt = Math.min(dt, 0.1); // évite les sauts après pause/onglet caché
      this.time += dt;
      try {
        this.scenes.update(dt);
        this._render();
      } catch (e) {
        Log.error('Erreur boucle de jeu', e);
      }
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }
  stop() { this._running = false; cancelAnimationFrame(this._raf); }
  _render() {
    const { ctx, canvas, viewport } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#05060f'; // letterbox
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(viewport.scale, 0, 0, viewport.scale, viewport.offX, viewport.offY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    ctx.clip();
    this.scenes.draw(ctx);
    ctx.restore();
  }
}
