// DUSHOOD — entrées tactiles (phase 19) : tap, drag, zones contextuelles. AUCUN joystick.
export class Input {
  constructor(canvas, viewport) {
    this.canvas = canvas;
    this.viewport = viewport; // {scale, offX, offY} maintenu par l'engine
    this.pointer = { x: 0, y: 0, down: false };
    this.listeners = { tap: [], down: [], up: [], move: [], dragstart: [], drag: [], dragend: [] };
    this._downPos = null;
    this._dragging = false;
    this._downTime = 0;
    this.DRAG_THRESHOLD = 12; // px de conception
    this._bind();
  }
  _bind() {
    const c = this.canvas;
    const opts = { passive: false };
    c.addEventListener('pointerdown', e => { e.preventDefault(); c.setPointerCapture(e.pointerId); this._onDown(e); }, opts);
    c.addEventListener('pointermove', e => { e.preventDefault(); this._onMove(e); }, opts);
    c.addEventListener('pointerup', e => { e.preventDefault(); this._onUp(e); }, opts);
    c.addEventListener('pointercancel', e => { this._onUp(e); }, opts);
    c.addEventListener('contextmenu', e => e.preventDefault());
  }
  _toGame(e) {
    const r = this.canvas.getBoundingClientRect();
    const px = (e.clientX - r.left) * (this.canvas.width / r.width);
    const py = (e.clientY - r.top) * (this.canvas.height / r.height);
    const v = this.viewport;
    return { x: (px - v.offX) / v.scale, y: (py - v.offY) / v.scale };
  }
  _onDown(e) {
    const p = this._toGame(e);
    this.pointer.x = p.x; this.pointer.y = p.y; this.pointer.down = true;
    this._downPos = p; this._dragging = false; this._downTime = performance.now();
    this._emit('down', p);
  }
  _onMove(e) {
    const p = this._toGame(e);
    this.pointer.x = p.x; this.pointer.y = p.y;
    this._emit('move', p);
    if (this.pointer.down && this._downPos) {
      const dx = p.x - this._downPos.x, dy = p.y - this._downPos.y;
      if (!this._dragging && Math.hypot(dx, dy) > this.DRAG_THRESHOLD) {
        this._dragging = true;
        this._emit('dragstart', { ...this._downPos });
      }
      if (this._dragging) this._emit('drag', { x: p.x, y: p.y, dx, dy, start: this._downPos });
    }
  }
  _onUp(e) {
    const p = this._toGame(e);
    const wasDragging = this._dragging;
    this.pointer.down = false;
    this._emit('up', p);
    if (wasDragging) this._emit('dragend', { x: p.x, y: p.y, start: this._downPos });
    else if (this._downPos) this._emit('tap', p);
    this._downPos = null; this._dragging = false;
  }
  on(type, fn) { this.listeners[type].push(fn); return fn; }
  off(type, fn) { const l = this.listeners[type]; const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); }
  _emit(type, payload) { for (const fn of [...this.listeners[type]]) fn(payload); }
  removeAll() { for (const k of Object.keys(this.listeners)) this.listeners[k] = []; }
}

// Hit-testing utilitaires (zones tactiles ≥ MIN_TOUCH garanties par clamp)
export function hitRect(p, r) {
  return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
}
export function hitCircle(p, c) {
  return Math.hypot(p.x - c.x, p.y - c.y) <= c.r;
}
export function expandTouch(r, min) {
  const w = Math.max(r.w, min), h = Math.max(r.h, min);
  return { x: r.x - (w - r.w) / 2, y: r.y - (h - r.h) / 2, w, h };
}
