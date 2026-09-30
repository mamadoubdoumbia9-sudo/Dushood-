// DUSHOOD — Puzzle 4 (Ville) : « Le code des lanternes ».
// 4 lanternes à régler (0-9). Le code se déduit d'indices découverts dans la scène.
// Code par défaut : 7 2 5 9 (indices narratifs : voir data/scenes-data.js).
export class CodePuzzle {
  constructor(opts = {}) {
    this.id = opts.id || 'lanterns';
    this.code = opts.code || [7, 2, 5, 9];
    this.digits = new Array(this.code.length).fill(0);
    this.solved = false;
    this.attempts = 0;
    this.cluesFound = []; // ids d'indices découverts dans la scène
  }
  setDigit(pos, value) {
    if (this.solved) return { result: 'ignored' };
    if (pos < 0 || pos >= this.digits.length) return { result: 'invalid' };
    this.digits[pos] = ((value % 10) + 10) % 10;
    return { result: 'set', digits: [...this.digits] };
  }
  cycleDigit(pos, dir = 1) {
    return this.setDigit(pos, this.digits[pos] + dir);
  }
  addClue(id) { if (!this.cluesFound.includes(id)) { this.cluesFound.push(id); return true; } return false; }
  submit() {
    if (this.solved) return { result: 'ignored' };
    this.attempts++;
    const correct = this.digits.filter((d, i) => d === this.code[i]).length;
    if (correct === this.code.length) {
      this.solved = true;
      return { result: 'solved', attempts: this.attempts };
    }
    return { result: 'fail', correctCount: correct };
  }
  serialize() {
    return { solved: this.solved, digits: [...this.digits], attempts: this.attempts, cluesFound: [...this.cluesFound] };
  }
  restore(data) {
    if (!data) return;
    this.solved = !!data.solved;
    if (Array.isArray(data.digits) && data.digits.length === this.code.length) {
      this.digits = data.digits.map(d => ((Number(d) || 0) % 10 + 10) % 10);
    }
    this.attempts = Number(data.attempts) || 0;
    this.cluesFound = Array.isArray(data.cluesFound) ? data.cluesFound : [];
    if (this.solved) this.digits = [...this.code];
  }
}
