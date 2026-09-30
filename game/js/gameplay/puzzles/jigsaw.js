// DUSHOOD — Puzzle 5 (Tour) : « La lettre recomposée ».
// Placer les 5 fragments de lettre à leur emplacement (drag & drop, tolérance de placement).
export class JigsawPuzzle {
  constructor(opts = {}) {
    this.id = opts.id || 'letterjigsaw';
    this.slots = opts.slots || [ // positions normalisées des emplacements corrects
      { id: 0, x: 0.50, y: 0.18 }, { id: 1, x: 0.50, y: 0.34 },
      { id: 2, x: 0.50, y: 0.50 }, { id: 3, x: 0.50, y: 0.66 },
      { id: 4, x: 0.50, y: 0.82 },
    ];
    this.tolerance = opts.tolerance || 0.07;
    // pièces disposées librement au départ (positions normalisées)
    this.pieces = this.slots.map((s, i) => ({
      id: i,
      x: opts.scatter ? opts.scatter[i].x : 0.12 + (i % 2) * 0.76,
      y: opts.scatter ? opts.scatter[i].y : 0.15 + i * 0.17,
      placed: false,
    }));
    this.solved = false;
  }
  movePiece(id, x, y) {
    const p = this.pieces.find(p => p.id === id);
    if (!p || p.placed || this.solved) return { result: 'ignored' };
    p.x = Math.max(0, Math.min(1, x));
    p.y = Math.max(0, Math.min(1, y));
    return { result: 'moved' };
  }
  dropPiece(id) {
    const p = this.pieces.find(p => p.id === id);
    if (!p || p.placed || this.solved) return { result: 'ignored' };
    const slot = this.slots.find(s => s.id === id);
    const d = Math.hypot(p.x - slot.x, p.y - slot.y);
    if (d <= this.tolerance) {
      p.x = slot.x; p.y = slot.y; p.placed = true;
      if (this.pieces.every(q => q.placed)) {
        this.solved = true;
        return { result: 'solved' };
      }
      return { result: 'placed', remaining: this.pieces.filter(q => !q.placed).length };
    }
    return { result: 'near', distance: d };
  }
  serialize() {
    return { solved: this.solved, pieces: this.pieces.map(p => ({ id: p.id, x: p.x, y: p.y, placed: p.placed })) };
  }
  restore(data) {
    if (!data) return;
    this.solved = !!data.solved;
    if (Array.isArray(data.pieces)) {
      for (const dp of data.pieces) {
        const p = this.pieces.find(p => p.id === dp.id);
        if (p) { p.x = Number(dp.x) || p.x; p.y = Number(dp.y) || p.y; p.placed = !!dp.placed; }
      }
    }
    if (this.solved) for (const p of this.pieces) {
      const s = this.slots.find(s => s.id === p.id);
      p.x = s.x; p.y = s.y; p.placed = true;
    }
  }
}
