// DUSHOOD — Puzzle 1 (Jardin) : « La ronde des lucioles ».
// Mémoriser et reproduire une séquence lumineuse qui s'allonge (3 manches).
// Logique pure, sérialisable, testable.
export class SequencePuzzle {
  constructor(opts = {}) {
    this.id = opts.id || 'fireflies';
    this.nodeCount = opts.nodeCount || 5;
    this.rounds = opts.rounds || [3, 4, 5]; // longueurs de séquence par manche
    this.rng = opts.rng || Math.random;
    this.solved = false;
    this.round = 0;
    this.sequence = [];
    this.inputIndex = 0;
    this.phase = 'idle'; // idle | showing | input | success | failed | solved
    this._genSequence();
  }
  _genSequence() {
    const len = this.rounds[this.round];
    this.sequence = [];
    let prev = -1;
    for (let i = 0; i < len; i++) {
      let n = Math.floor(this.rng() * this.nodeCount) % this.nodeCount;
      // garde-fou : jamais deux fois la même luciole, même avec un rng dégénéré
      if (n === prev) n = (n + 1) % this.nodeCount;
      this.sequence.push(n);
      prev = n;
    }
    this.inputIndex = 0;
  }
  startShow() { if (!this.solved) this.phase = 'showing'; }
  beginInput() { if (!this.solved) { this.phase = 'input'; this.inputIndex = 0; } }
  press(node) {
    if (this.phase !== 'input' || this.solved) return { result: 'ignored' };
    if (node === this.sequence[this.inputIndex]) {
      this.inputIndex++;
      if (this.inputIndex >= this.sequence.length) {
        if (this.round >= this.rounds.length - 1) {
          this.solved = true; this.phase = 'solved';
          return { result: 'solved' };
        }
        this.round++;
        this._genSequence();
        this.phase = 'success';
        return { result: 'round', round: this.round };
      }
      return { result: 'good', progress: this.inputIndex / this.sequence.length };
    }
    // erreur : la manche recommence (échec doux, pas de punition dure — c'est un cadeau)
    this._genSequence();
    this.phase = 'failed';
    return { result: 'fail' };
  }
  serialize() { return { solved: this.solved, round: this.round }; }
  restore(data) {
    if (!data) return;
    this.solved = !!data.solved;
    this.round = Math.min(Number(data.round) || 0, this.rounds.length - 1);
    if (this.solved) this.phase = 'solved'; else this._genSequence();
  }
}
