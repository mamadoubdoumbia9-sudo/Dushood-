// DUSHOOD — Puzzle 3 (Lac) : « Le reflet brisé ». Taquin 3×3 recomposant une image.
// Mélange garanti résoluble (par coups légaux depuis l'état résolu).
export class SlidingPuzzle {
  constructor(opts = {}) {
    this.id = opts.id || 'reflection';
    this.size = opts.size || 3;
    this.rng = opts.rng || Math.random;
    const n = this.size * this.size;
    this.tiles = Array.from({ length: n }, (_, i) => i); // n-1 = case vide
    this.solved = false;
    this.moves = 0;
    if (opts.shuffle !== false) this.shuffle(opts.shuffleSteps || 80);
  }
  get emptyIndex() { return this.tiles.indexOf(this.size * this.size - 1); }
  _neighbors(idx) {
    const s = this.size, r = Math.floor(idx / s), c = idx % s, out = [];
    if (r > 0) out.push(idx - s);
    if (r < s - 1) out.push(idx + s);
    if (c > 0) out.push(idx - 1);
    if (c < s - 1) out.push(idx + 1);
    return out;
  }
  shuffle(steps) {
    // mélange par coups légaux → toujours résoluble
    let last = -1;
    for (let i = 0; i < steps; i++) {
      const e = this.emptyIndex;
      const opts = this._neighbors(e).filter(n => n !== last);
      const pick = opts[Math.floor(this.rng() * opts.length)];
      last = e;
      [this.tiles[e], this.tiles[pick]] = [this.tiles[pick], this.tiles[e]];
    }
    this.moves = 0;
    this.solved = this.checkSolved();
    if (this.solved) { this.solved = false; this.shuffle(steps + 7); }
  }
  canMove(idx) { return this._neighbors(this.emptyIndex).includes(idx); }
  move(idx) {
    if (this.solved) return { result: 'ignored' };
    if (!this.canMove(idx)) return { result: 'blocked' };
    const e = this.emptyIndex;
    [this.tiles[e], this.tiles[idx]] = [this.tiles[idx], this.tiles[e]];
    this.moves++;
    if (this.checkSolved()) {
      this.solved = true;
      return { result: 'solved', moves: this.moves };
    }
    return { result: 'moved', from: idx, to: e };
  }
  checkSolved() { return this.tiles.every((t, i) => t === i); }
  serialize() { return { solved: this.solved, tiles: [...this.tiles], moves: this.moves }; }
  restore(data) {
    if (!data) return;
    const n = this.size * this.size;
    if (Array.isArray(data.tiles) && data.tiles.length === n
        && [...data.tiles].sort((a, b) => a - b).every((v, i) => v === i)) {
      this.tiles = [...data.tiles];
    }
    this.moves = Number(data.moves) || 0;
    this.solved = !!data.solved || this.checkSolved();
    if (this.solved) this.tiles = Array.from({ length: n }, (_, i) => i);
  }
}
