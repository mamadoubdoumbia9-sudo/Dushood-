// DUSHOOD — vues tactiles des puzzles (phases 14, 15, 19, 67).
// Chaque vue relie la logique pure (gameplay/puzzles/*) au rendu Canvas et aux entrées.
import { CONFIG } from '../core/config.js';
import { Button, Icons, roundRect } from '../ui/widgets.js';
import { hitCircle, hitRect } from '../core/input.js';
import { drawNayo } from '../ui/widgets.js';

class BasePuzzleView {
  constructor(game, logic, onSolved) {
    this.game = game;
    this.logic = logic;
    this.onSolved = onSolved;
    this.t = 0;
    this.done = false;
    this.btnClose = new Button({
      x: CONFIG.WIDTH - 84, y: 18, w: 64, h: 64, label: '✕', fontSize: 30,
      onTap: () => { if (this.onClose) this.onClose(); },
    });
    this.onClose = null;
  }
  persist() {
    this.game.state.savePuzzle(this.logic.id, this.logic.serialize());
    this.game.persist();
  }
  solve() {
    if (this.done) return;
    this.done = true;
    this.persist();
    this.game.audio.sfx('success');
    setTimeout(() => this.onSolved(), 900);
  }
  drawPanel(ctx, title) {
    ctx.fillStyle = 'rgba(4, 6, 18, 0.88)';
    ctx.fillRect(0, 0, CONFIG.WIDTH, CONFIG.HEIGHT);
    ctx.fillStyle = '#ffd76e';
    ctx.font = '30px Dushood, Georgia, serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(title, CONFIG.WIDTH / 2, 30);
    this.btnClose.draw(ctx);
  }
  update(dt) { this.t += dt; this.btnClose.update(dt); }
  handleTap(p) { return this.btnClose.handleTap(p, this.game.audio); }
  handleDragStart() {} handleDrag() {} handleDragEnd() {}
}

// ---------- 1. La ronde des lucioles (séquence) ----------
export class FirefliesView extends BasePuzzleView {
  constructor(game, logic, onSolved) {
    super(game, logic, onSolved);
    this.nodes = [];
    const cx = CONFIG.WIDTH / 2, cy = CONFIG.HEIGHT / 2 + 20, R = 200;
    for (let i = 0; i < logic.nodeCount; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / logic.nodeCount;
      this.nodes.push({ i, x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r: 48, lit: 0 });
    }
    this.showIndex = -1;
    this.showTimer = 0;
    this._startShow();
  }
  _startShow() {
    this.logic.startShow();
    this.showIndex = -1;
    this.showTimer = 0.8;
  }
  update(dt) {
    super.update(dt);
    for (const n of this.nodes) n.lit = Math.max(0, n.lit - dt * 2.2);
    if (this.logic.phase === 'showing') {
      this.showTimer -= dt;
      if (this.showTimer <= 0) {
        this.showIndex++;
        if (this.showIndex >= this.logic.sequence.length) {
          this.logic.beginInput();
        } else {
          const n = this.nodes[this.logic.sequence[this.showIndex]];
          n.lit = 1;
          this.game.audio.sfx('firefly');
          this.showTimer = 0.62;
        }
      }
    }
    if ((this.logic.phase === 'success' || this.logic.phase === 'failed') && !this.done) {
      this._startShow();
    }
  }
  handleTap(p) {
    if (super.handleTap(p)) return true;
    // toucher Nayo au centre relance la démonstration
    const cx = CONFIG.WIDTH / 2, cy = CONFIG.HEIGHT / 2 + 20;
    if (this.logic.phase === 'input' && hitCircle(p, { x: cx, y: cy, r: 60 })) {
      this._startShow();
      this.game.audio.sfx('tap');
      return true;
    }
    if (this.logic.phase !== 'input' || this.done) return false;
    for (const n of this.nodes) {
      if (hitCircle(p, { x: n.x, y: n.y, r: Math.max(n.r, CONFIG.MIN_TOUCH / 2) })) {
        n.lit = 1;
        const res = this.logic.press(n.i);
        if (res.result === 'good') this.game.audio.sfx('firefly');
        else if (res.result === 'round') { this.game.audio.sfx('chime'); this.persist(); }
        else if (res.result === 'fail') this.game.audio.sfx('error');
        else if (res.result === 'solved') this.solve();
        return true;
      }
    }
    return false;
  }
  draw(ctx) {
    this.drawPanel(ctx, this.game.i18n.t('map.garden'));
    const cx = CONFIG.WIDTH / 2, cy = CONFIG.HEIGHT / 2 + 20;
    // manches
    ctx.fillStyle = '#c9d2f0'; ctx.font = '22px Dushood, Georgia, serif';
    ctx.textAlign = 'center';
    const roundInfo = `${Math.min(this.logic.round + 1, this.logic.rounds.length)} / ${this.logic.rounds.length}`;
    ctx.fillText(roundInfo, cx, 80);
    drawNayo(ctx, cx, cy, this.t, 1.6);
    for (const n of this.nodes) {
      const glow = 0.25 + n.lit * 0.75;
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
      g.addColorStop(0, `rgba(255, 236, 170, ${glow})`);
      g.addColorStop(1, 'rgba(255, 214, 110, 0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      drawNayo(ctx, n.x, n.y - 4, this.t + n.i * 1.7, 0.85 + n.lit * 0.35);
    }
    if (this.logic.phase === 'input') {
      ctx.fillStyle = 'rgba(201, 210, 240, 0.8)'; ctx.font = 'italic 20px Dushood, Georgia, serif';
      ctx.fillText('À toi de rejouer la ronde…', cx, CONFIG.HEIGHT - 46);
    }
  }
}

// ---------- 2. La constellation des échos ----------
export class ConstellationView extends BasePuzzleView {
  constructor(game, logic, onSolved) {
    super(game, logic, onSolved);
    this.area = { x: 190, y: 110, w: CONFIG.WIDTH - 380, h: CONFIG.HEIGHT - 240 };
    this.twinkle = 0; // séquence d'aide après un échec
    this.twinkleIdx = -1;
  }
  _nodePos(n) {
    return { x: this.area.x + n.x * this.area.w, y: this.area.y + n.y * this.area.h };
  }
  _nodeAt(p) {
    for (const n of this.logic.nodes) {
      const q = this._nodePos(n);
      if (hitCircle(p, { x: q.x, y: q.y, r: 44 })) return n;
    }
    return null;
  }
  _try(node) {
    const res = this.logic.tryConnect(node.id);
    if (res.result === 'good') { this.game.audio.sfx('firefly'); this.persist(); }
    else if (res.result === 'fail') { this.game.audio.sfx('error'); this.twinkle = 0.01; this.twinkleIdx = -1; }
    else if (res.result === 'solved') this.solve();
  }
  handleTap(p) {
    if (super.handleTap(p)) return true;
    const n = this._nodeAt(p);
    if (n && !this.done) { this._try(n); return true; }
    return false;
  }
  handleDrag(d) {
    const n = this._nodeAt(d);
    if (n && !this.done && !this.logic.connected.includes(n.id)) this._try(n);
  }
  update(dt) {
    super.update(dt);
    if (this.twinkle > 0) {
      this.twinkle += dt;
      const idx = Math.floor(this.twinkle / 0.5);
      if (idx !== this.twinkleIdx && idx < this.logic.order.length) {
        this.twinkleIdx = idx;
        this.game.audio.sfx('firefly');
      }
      if (this.twinkle > 0.5 * this.logic.order.length + 0.6) { this.twinkle = 0; this.twinkleIdx = -1; }
    }
  }
  draw(ctx) {
    this.drawPanel(ctx, this.game.i18n.t('map.forest'));
    const conn = this.logic.connected;
    // liens tracés
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 236, 170, 0.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.shadowColor = '#ffd76e'; ctx.shadowBlur = 12;
    ctx.beginPath();
    conn.forEach((id, i) => {
      const q = this._nodePos(this.logic.nodes.find(n => n.id === id));
      if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
    });
    ctx.stroke();
    ctx.restore();
    // étoiles
    for (const n of this.logic.nodes) {
      const q = this._nodePos(n);
      const isNext = n.id === this.logic.nextExpected();
      const isConn = conn.includes(n.id);
      let pulse = 0.5 + 0.5 * Math.sin(this.t * 3 + n.x * 9);
      // aide : scintillement dans l'ordre après un échec
      if (this.twinkle > 0 && this.logic.order[this.twinkleIdx] === n.id) pulse = 1.6;
      const r = isConn ? 10 : 7 + pulse * 3;
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, r * 4);
      g.addColorStop(0, isConn ? 'rgba(255,240,190,1)' : `rgba(220,235,255,${0.5 + pulse * 0.4})`);
      g.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(q.x, q.y, r * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = isConn ? '#fff3d0' : '#e8f0ff';
      ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, Math.PI * 2); ctx.fill();
      if (isNext && conn.length === 0) {
        // point de départ discret
        ctx.strokeStyle = `rgba(255,214,110,${0.4 + 0.4 * Math.sin(this.t * 4)})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(q.x, q.y, 26, 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(201, 210, 240, 0.8)'; ctx.font = 'italic 20px Dushood, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Relie les étoiles dans le bon ordre…', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 46);
  }
}

// ---------- 3. Le reflet brisé (taquin) ----------
export class SlidingView extends BasePuzzleView {
  constructor(game, logic, onSolved) {
    super(game, logic, onSolved);
    this.size = logic.size;
    this.board = 430;
    this.bx = (CONFIG.WIDTH - this.board) / 2;
    this.by = 130;
    this.img = game.assets.get('bg_garden'); // le reflet montre le jardin du début
  }
  _cellRect(i) {
    const s = this.board / this.size;
    return { x: this.bx + (i % this.size) * s, y: this.by + Math.floor(i / this.size) * s, w: s, h: s };
  }
  handleTap(p) {
    if (super.handleTap(p)) return true;
    if (this.done) return false;
    for (let i = 0; i < this.size * this.size; i++) {
      if (hitRect(p, this._cellRect(i))) {
        const res = this.logic.move(i);
        if (res.result === 'moved') { this.game.audio.sfx('tap'); this.persist(); }
        else if (res.result === 'blocked') this.game.audio.sfx('error');
        else if (res.result === 'solved') this.solve();
        return true;
      }
    }
    return false;
  }
  draw(ctx) {
    this.drawPanel(ctx, this.game.i18n.t('map.lake'));
    const n = this.size, s = this.board / n, empty = n * n - 1;
    ctx.save();
    roundRect(ctx, this.bx - 10, this.by - 10, this.board + 20, this.board + 20, 14);
    ctx.fillStyle = 'rgba(30, 40, 80, 0.6)'; ctx.fill();
    ctx.strokeStyle = 'rgba(160, 200, 255, 0.5)'; ctx.stroke();
    for (let i = 0; i < n * n; i++) {
      const tile = this.logic.tiles[i];
      if (tile === empty && !this.logic.solved) continue;
      const r = this._cellRect(i);
      const sx = tile % n, sy = Math.floor(tile / n);
      ctx.save();
      roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 8);
      ctx.clip();
      if (this.img) {
        const iw = this.img.width / n, ih = this.img.height / n;
        ctx.drawImage(this.img, sx * iw, sy * ih, iw, ih, r.x + 2, r.y + 2, r.w - 4, r.h - 4);
        ctx.fillStyle = 'rgba(90, 140, 220, 0.18)'; // teinte "reflet"
        ctx.fillRect(r.x, r.y, r.w, r.h);
      } else {
        ctx.fillStyle = `hsl(${210 + tile * 8}, 45%, ${30 + (tile % n) * 6}%)`;
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.fillStyle = '#fff'; ctx.font = '34px Dushood, Georgia, serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(tile + 1), r.x + r.w / 2, r.y + r.h / 2);
      }
      ctx.restore();
      if (!this.logic.solved) {
        ctx.strokeStyle = 'rgba(200, 225, 255, 0.35)';
        roundRect(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 8); ctx.stroke();
      }
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(201, 210, 240, 0.8)'; ctx.font = 'italic 20px Dushood, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Déplacements : ${this.logic.moves}`, CONFIG.WIDTH / 2, CONFIG.HEIGHT - 46);
  }
}

// ---------- 4. Le code des lanternes ----------
export class CodeView extends BasePuzzleView {
  constructor(game, logic, onSolved) {
    super(game, logic, onSolved);
    const n = logic.code.length;
    const w = 110, gap = 40;
    const total = n * w + (n - 1) * gap;
    this.dials = [];
    for (let i = 0; i < n; i++) {
      this.dials.push({ i, x: (CONFIG.WIDTH - total) / 2 + i * (w + gap), y: 250, w, h: 170 });
    }
    this.btnValidate = new Button({
      x: CONFIG.WIDTH / 2 - 130, y: 520, w: 260, h: 70,
      label: game.i18n.t('puzzle.validate'), primary: true,
      onTap: () => this._submit(),
    });
    this.feedback = null; this.feedbackT = 0;
  }
  _submit() {
    if (this.done) return;
    const res = this.logic.submit();
    this.persist();
    if (res.result === 'solved') { this.solve(); }
    else if (res.result === 'fail') {
      this.game.audio.sfx('error');
      this.feedback = res.correctCount; this.feedbackT = 0;
    }
  }
  handleTap(p) {
    if (super.handleTap(p)) return true;
    if (this.btnValidate.handleTap(p, this.game.audio)) return true;
    if (this.done) return false;
    for (const d of this.dials) {
      const up = { x: d.x, y: d.y - 70, w: d.w, h: 64 };
      const dn = { x: d.x, y: d.y + d.h + 6, w: d.w, h: 64 };
      if (hitRect(p, up)) { this.logic.cycleDigit(d.i, 1); this.game.audio.sfx('tap'); this.persist(); return true; }
      if (hitRect(p, dn)) { this.logic.cycleDigit(d.i, -1); this.game.audio.sfx('tap'); this.persist(); return true; }
    }
    return false;
  }
  update(dt) { super.update(dt); this.btnValidate.update(dt); if (this.feedback !== null) this.feedbackT += dt; }
  draw(ctx) {
    this.drawPanel(ctx, this.game.i18n.t('map.city'));
    const cluesFound = ['clue1', 'clue2', 'clue3', 'clue4'].filter(c => this.game.state.hasFlag('city.' + c)).length;
    ctx.fillStyle = '#c9d2f0'; ctx.font = '20px Dushood, Georgia, serif'; ctx.textAlign = 'center';
    ctx.fillText(`Indices trouvés dans la ville : ${cluesFound} / 4`, CONFIG.WIDTH / 2, 84);
    for (const d of this.dials) {
      // lanterne
      const lit = this.logic.solved || this.done;
      roundRect(ctx, d.x, d.y, d.w, d.h, 16);
      const g = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.h);
      g.addColorStop(0, lit ? '#ffdf8a' : 'rgba(40, 34, 60, 0.9)');
      g.addColorStop(1, lit ? '#f2a83b' : 'rgba(24, 20, 40, 0.9)');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 120, 0.6)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = lit ? '#3a2404' : '#ffe9c2';
      ctx.font = '72px Dushood, Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(this.logic.digits[d.i]), d.x + d.w / 2, d.y + d.h / 2 + 4);
      // flèches
      ctx.fillStyle = '#ffd76e';
      ctx.beginPath();
      ctx.moveTo(d.x + d.w / 2 - 16, d.y - 22); ctx.lineTo(d.x + d.w / 2 + 16, d.y - 22); ctx.lineTo(d.x + d.w / 2, d.y - 46);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(d.x + d.w / 2 - 16, d.y + d.h + 24); ctx.lineTo(d.x + d.w / 2 + 16, d.y + d.h + 24); ctx.lineTo(d.x + d.w / 2, d.y + d.h + 48);
      ctx.closePath(); ctx.fill();
    }
    this.btnValidate.draw(ctx);
    if (this.feedback !== null && this.feedbackT < 2.4) {
      ctx.fillStyle = '#ff9db8'; ctx.font = '22px Dushood, Georgia, serif'; ctx.textAlign = 'center';
      ctx.fillText(`${this.feedback} lanterne(s) au bon chiffre…`, CONFIG.WIDTH / 2, 620);
    }
  }
}

// ---------- 5. La lettre recomposée (fragments à placer) ----------
export class JigsawView extends BasePuzzleView {
  constructor(game, logic, onSolved) {
    super(game, logic, onSolved);
    this.area = { x: 150, y: 100, w: CONFIG.WIDTH - 300, h: CONFIG.HEIGHT - 170 };
    this.pieceSize = { w: 240, h: 84 };
    this.dragId = null;
  }
  _pieceRect(p) {
    return {
      x: this.area.x + p.x * this.area.w - this.pieceSize.w / 2,
      y: this.area.y + p.y * this.area.h - this.pieceSize.h / 2,
      w: this.pieceSize.w, h: this.pieceSize.h,
    };
  }
  handleDragStart(d) {
    if (this.done) return;
    for (const p of [...this.logic.pieces].reverse()) {
      if (!p.placed && hitRect(d, this._pieceRect(p))) { this.dragId = p.id; return; }
    }
  }
  handleDrag(d) {
    if (this.dragId === null) return;
    this.logic.movePiece(this.dragId,
      (d.x - this.area.x) / this.area.w,
      (d.y - this.area.y) / this.area.h);
  }
  handleDragEnd() {
    if (this.dragId === null) return;
    const res = this.logic.dropPiece(this.dragId);
    this.dragId = null;
    if (res.result === 'placed') { this.game.audio.sfx('chime'); this.persist(); }
    else if (res.result === 'solved') { this.game.audio.sfx('fragment'); this.solve(); }
  }
  draw(ctx) {
    this.drawPanel(ctx, this.game.i18n.t('map.tower'));
    // silhouette de la lettre au centre
    const cx = this.area.x + 0.5 * this.area.w;
    ctx.save();
    roundRect(ctx, cx - 150, this.area.y + 0.08 * this.area.h, 300, 0.86 * this.area.h, 10);
    ctx.strokeStyle = `rgba(255, 214, 110, ${0.35 + 0.2 * Math.sin(this.t * 2)})`;
    ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.stroke();
    ctx.setLineDash([]);
    // emplacements
    for (const s of this.logic.slots) {
      const q = { x: this.area.x + s.x * this.area.w, y: this.area.y + s.y * this.area.h };
      const placed = this.logic.pieces.find(p => p.id === s.id)?.placed;
      roundRect(ctx, q.x - this.pieceSize.w / 2, q.y - this.pieceSize.h / 2, this.pieceSize.w, this.pieceSize.h, 8);
      ctx.strokeStyle = placed ? 'rgba(255,214,110,0.0)' : 'rgba(200, 210, 250, 0.3)';
      ctx.stroke();
    }
    ctx.restore();
    // pièces (fragments de lettre)
    for (const p of this.logic.pieces) {
      const r = this._pieceRect(p);
      ctx.save();
      if (this.dragId === p.id) { ctx.shadowColor = '#ffd76e'; ctx.shadowBlur = 24; }
      roundRect(ctx, r.x, r.y, r.w, r.h, 8);
      const g = ctx.createLinearGradient(r.x, r.y, r.x, r.y + r.h);
      g.addColorStop(0, p.placed ? '#fdf3dd' : '#f4e6c8');
      g.addColorStop(1, p.placed ? '#f3e2ba' : '#e2cfa4');
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(120, 90, 40, 0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
      // lignes d'écriture stylisées
      ctx.strokeStyle = 'rgba(90, 70, 40, 0.55)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const ly = r.y + 22 + i * 20;
        ctx.beginPath();
        ctx.moveTo(r.x + 16, ly);
        for (let x = 16; x < r.w - 16; x += 7) {
          ctx.lineTo(r.x + x, ly + Math.sin((x + p.id * 40) * 0.35) * 2.4);
        }
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(120, 90, 40, 0.8)'; ctx.font = '16px Dushood, Georgia, serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`${p.id + 1}`, r.x + 8, r.y + 6);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(201, 210, 240, 0.8)'; ctx.font = 'italic 20px Dushood, Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fais glisser chaque fragment à sa place, du haut vers le bas…', CONFIG.WIDTH / 2, CONFIG.HEIGHT - 40);
  }
}

export const PUZZLE_VIEWS = {
  fireflies: FirefliesView,
  constellation: ConstellationView,
  reflection: SlidingView,
  lanterns: CodeView,
  letterjigsaw: JigsawView,
};
