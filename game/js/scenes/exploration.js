// DUSHOOD — scène d'exploration générique (phases 12, 13, 18, 19, 20).
// Data-driven : lit CHAPTERS, gère hotspots, objets, dialogues, puzzles, fragments.
import { CONFIG } from '../core/config.js';
import { Scene } from '../core/engine.js';
import { CHAPTERS } from '../data/scenes-data.js';
import { DIALOGUES } from '../data/dialogues.js';
import { DialogueBox } from '../ui/dialogue.js';
import { HUD } from '../ui/hud.js';
import { ParticleSystem, Emitters } from '../core/particles.js';
import { Parallax } from '../core/parallax.js';
import { hitCircle } from '../core/input.js';
import { drawNayo } from '../ui/widgets.js';
import { createPuzzle } from '../gameplay/puzzlefactory.js';
import { PUZZLE_VIEWS } from './puzzleviews.js';

export class ExplorationScene extends Scene {
  enter(params) {
    this.ch = CHAPTERS[params.chapter];
    if (!this.ch) { this.game.scenes.goto('map'); return; }
    const g = this.game;
    g.state.chapter = this.ch.id;
    g.persist();
    g.audio.playMusic(this.ch.music);
    this.dialogue = new DialogueBox(g.i18n, g.audio, g.settings.bigText ? 1.25 : 1);
    this.hud = new HUD(g, {
      onMenu: () => g.scenes.goto('map'),
      onHint: () => this._hint(),
    });
    this.particles = new ParticleSystem(200);
    this.parallax = new Parallax();
    if (g.settings.reduceMotion) this.parallax.amplitude = 0; // accessibilité
    this._setupParallax();
    this.puzzleView = null;
    this.nayo = { x: 150, y: 200 };
    this._bindInput();
    // dialogue d'entrée (une fois par sauvegarde)
    const dlgId = this.ch.enterDialogue;
    if (dlgId && !g.state.sawDialogue(dlgId)) {
      g.state.markDialogue(dlgId);
      g.persist();
      this.dialogue.start(DIALOGUES[dlgId]);
    }
  }
  _setupParallax() {
    const g = this.game;
    const img = g.assets.get(this.ch.bg);
    const grads = {
      garden: ['#1a2f4a', '#2f5d50', '#7fb069'], forest: ['#0d1b2a', '#1b3a4b', '#2d6a4f'],
      lake: ['#0f1b3d', '#274690', '#5bc0eb'], city: ['#1a1423', '#3d2645', '#da627d'],
      tower: ['#10002b', '#3c096c', '#7b2cbf'],
    };
    this.parallax.add((ctx, ox, oy) => {
      if (img) {
        // couverture avec léger débord pour la parallaxe
        const s = Math.max((CONFIG.WIDTH + 60) / img.width, (CONFIG.HEIGHT + 40) / img.height);
        const w = img.width * s, h = img.height * s;
        ctx.drawImage(img, (CONFIG.WIDTH - w) / 2 + ox, (CONFIG.HEIGHT - h) / 2 + oy, w, h);
      } else {
        const cols = grads[this.ch.id] || grads.garden;
        const gr = ctx.createLinearGradient(0, 0, 0, CONFIG.HEIGHT);
        gr.addColorStop(0, cols[0]); gr.addColorStop(0.6, cols[1]); gr.addColorStop(1, cols[2]);
        ctx.fillStyle = gr;
        ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
      }
    }, 0.35);
    // voile d'ambiance
    this.parallax.add((ctx, ox, oy, t) => {
      ctx.save();
      ctx.globalAlpha = 0.12 + 0.05 * Math.sin(t * 0.7);
      const gr = ctx.createRadialGradient(
        CONFIG.WIDTH / 2 + ox * 2, CONFIG.HEIGHT * 0.3 + oy * 2, 100,
        CONFIG.WIDTH / 2 + ox * 2, CONFIG.HEIGHT * 0.3 + oy * 2, 700);
      gr.addColorStop(0, '#ffe9a8'); gr.addColorStop(1, 'rgba(255,233,168,0)');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
      ctx.restore();
    }, 0.7);
  }
  _bindInput() {
    const inp = this.game.input;
    inp.on('tap', p => this._onTap(p));
    inp.on('move', p => this.parallax.setTargetFromPointer(p.x, p.y, CONFIG.WIDTH, CONFIG.HEIGHT));
    inp.on('dragstart', d => { if (this.puzzleView) this.puzzleView.handleDragStart(d); });
    inp.on('drag', d => { if (this.puzzleView) this.puzzleView.handleDrag(d); });
    inp.on('dragend', d => { if (this.puzzleView) this.puzzleView.handleDragEnd(d); });
  }
  _visibleHotspots() {
    const st = this.game.state;
    return this.ch.hotspots.filter(h => {
      if (h.type === 'item') return !st.hasItem(h.item) && !st.usedItems.includes(h.item);
      if (h.type === 'gate') return !st.isPuzzleSolved(h.puzzle);
      return true;
    });
  }
  _onTap(p) {
    const g = this.game;
    if (this.dialogue.active) { this.dialogue.tap(); return; }
    if (this.puzzleView) { this.puzzleView.handleTap(p); return; }
    if (this.hud.handleTap(p)) return;
    for (const h of this._visibleHotspots()) {
      if (hitCircle(p, { x: h.x, y: h.y, r: Math.max(h.r, CONFIG.MIN_TOUCH / 2) })) {
        this._activate(h, p);
        return;
      }
    }
    // feedback discret : petites étincelles là où on touche
    Emitters.sparkleBurst(this.particles, p.x, p.y, 'rgba(255,236,170,0.9)');
  }
  _activate(h, p) {
    const g = this.game, st = g.state;
    g.audio.sfx('hotspot');
    Emitters.sparkleBurst(this.particles, h.x, h.y);
    if (h.type === 'dialogue' || h.type === 'clue') {
      if (h.clue) { st.setFlag(`${this.ch.id}.${h.clue}`); g.persist(); }
      this.dialogue.start(DIALOGUES[h.dialogue]);
      return;
    }
    if (h.type === 'item') {
      st.addItem(h.item);
      g.audio.sfx('pickup');
      g.persist();
      this.hud.toast.show(g.i18n.t(`item.${h.item}`) + ' ✓');
      this.dialogue.start(DIALOGUES[h.dialogue]);
      return;
    }
    if (h.type === 'gate') {
      const openFlag = `${this.ch.id}.${h.id}.open`;
      if (h.requiresItem && !st.hasFlag(openFlag)) {
        if (!st.hasItem(h.requiresItem)) {
          this.dialogue.start(DIALOGUES[h.lockedDialogue]);
          return;
        }
        if (h.consumesItem) st.useItem(h.requiresItem);
        st.setFlag(openFlag);
        g.audio.sfx('door');
        g.persist();
      }
      const introId = h.puzzleIntro;
      const openPuzzle = () => this._openPuzzle(h.puzzle);
      if (introId && !st.sawDialogue(introId)) {
        st.markDialogue(introId);
        g.persist();
        this.dialogue.start(DIALOGUES[introId], openPuzzle);
      } else {
        openPuzzle();
      }
    }
  }
  _openPuzzle(id) {
    const g = this.game;
    const logic = createPuzzle(id, g.state);
    if (logic.solved) return;
    const View = PUZZLE_VIEWS[id];
    this.puzzleView = new View(g, logic, () => this._onPuzzleSolved(id));
    this.puzzleView.onClose = () => { this.puzzleView = null; };
  }
  _onPuzzleSolved(id) {
    const g = this.game, st = g.state;
    this.puzzleView = null;
    // fragment de lettre
    if (st.addFragment(this.ch.fragment)) {
      g.audio.sfx('fragment');
      this.hud.toast.show(g.i18n.t('fragment.found', { n: st.fragments.length }));
      Emitters.heartBurst(this.particles, CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2);
    }
    st.completeChapter(this.ch.id);
    g.persist();
    const after = () => {
      if (this.ch.id === 'tower') g.scenes.goto('letter');
      else g.scenes.goto('map');
    };
    const dlg = DIALOGUES[this.ch.fragmentDialogue];
    if (dlg) this.dialogue.start(dlg, after); else after();
  }
  _hint() {
    const g = this.game;
    const puzzleId = this.puzzleView ? this.puzzleView.logic.id : `${this.ch.id}_explore`;
    const res = g.hints.ask(puzzleId);
    if (res.ok) {
      this.dialogue.start([{ who: 'nayo', fr: res.hint, en: res.hint }]);
      g.audio.sfx('chime');
    } else if (res.reason === 'cooldown') {
      this.hud.toast.show(g.i18n.t('hint.wait', { s: Math.ceil(res.waitMs / 1000) }));
    } else {
      this.hud.toast.show(g.i18n.t('hint.none'));
    }
  }
  update(dt) {
    super.update(dt);
    const g = this.game;
    g.state.playTime += dt;
    this.parallax.update(dt);
    this.particles.update(dt);
    this.dialogue.update(dt);
    this.hud.update(dt);
    if (this.puzzleView) this.puzzleView.update(dt);
    if (!g.settings.reduceMotion) { // accessibilité : réduction des animations (phase 85)
      if (this.ch.ambient === 'fireflies') Emitters.firefly(this.particles, CONFIG.WIDTH, CONFIG.HEIGHT);
      else if (this.ch.ambient === 'petals') Emitters.petals(this.particles, CONFIG.WIDTH);
    }
    // Nayo suit doucement le pointeur (présence, pas contrôle)
    const tx = 150 + Math.sin(g.time * 0.6) * 40, ty = 190 + Math.cos(g.time * 0.8) * 25;
    this.nayo.x += (tx - this.nayo.x) * dt;
    this.nayo.y += (ty - this.nayo.y) * dt;
  }
  draw(ctx) {
    const g = this.game;
    this.parallax.draw(ctx, g.time);
    // hotspots lumineux pulsants
    if (!this.puzzleView) {
      for (const h of this._visibleHotspots()) {
        const pulse = 0.5 + 0.5 * Math.sin(g.time * 2.4 + h.x * 0.01);
        const rr = h.r * (0.8 + pulse * 0.25);
        const grd = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, rr);
        grd.addColorStop(0, `rgba(255, 236, 170, ${0.4 + pulse * 0.3})`);
        grd.addColorStop(0.7, 'rgba(255, 214, 110, 0.12)');
        grd.addColorStop(1, 'rgba(255, 214, 110, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(h.x, h.y, rr, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = `rgba(255, 236, 170, ${0.25 + pulse * 0.35})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 0.5 + pulse * 6, 0, Math.PI * 2); ctx.stroke();
      }
      drawNayo(ctx, this.nayo.x, this.nayo.y, g.time, 1.3);
    }
    this.particles.draw(ctx);
    if (this.puzzleView) this.puzzleView.draw(ctx);
    this.hud.draw(ctx, g.time);
    this.dialogue.draw(ctx, g.time);
  }
}
