// DUSHOOD — Puzzle 2 (Forêt) : « La constellation des échos ».
// Relier les étoiles dans l'ordre indiqué par les échos de la forêt (drag pour tracer).
// Logique pure : graphe de nœuds, ordre correct, traçage progressif.
export class ConstellationPuzzle {
  constructor(opts = {}) {
    this.id = opts.id || 'constellation';
    // nodes: [{id, x, y}] positions normalisées 0..1 ; order: ids dans l'ordre
    this.nodes = opts.nodes || [
      { id: 'A', x: 0.18, y: 0.62 }, { id: 'B', x: 0.34, y: 0.30 },
      { id: 'C', x: 0.52, y: 0.52 }, { id: 'D', x: 0.68, y: 0.22 },
      { id: 'E', x: 0.84, y: 0.55 }, { id: 'F', x: 0.55, y: 0.78 },
    ];
    this.order = opts.order || ['F', 'A', 'B', 'C', 'D', 'E'];
    this.connected = []; // ids déjà reliés, dans l'ordre
    this.solved = false;
  }
  nextExpected() { return this.solved ? null : this.order[this.connected.length]; }
  tryConnect(nodeId) {
    if (this.solved) return { result: 'ignored' };
    if (!this.nodes.some(n => n.id === nodeId)) return { result: 'invalid' };
    if (this.connected.includes(nodeId)) return { result: 'already' };
    if (nodeId === this.nextExpected()) {
      this.connected.push(nodeId);
      if (this.connected.length === this.order.length) {
        this.solved = true;
        return { result: 'solved' };
      }
      return { result: 'good', progress: this.connected.length / this.order.length };
    }
    // mauvaise étoile : le tracé se dissipe (reset doux)
    this.connected = [];
    return { result: 'fail' };
  }
  serialize() { return { solved: this.solved, connected: [...this.connected] }; }
  restore(data) {
    if (!data) return;
    this.solved = !!data.solved;
    this.connected = Array.isArray(data.connected)
      ? data.connected.filter(id => this.nodes.some(n => n.id === id)) : [];
    if (this.solved) this.connected = [...this.order];
  }
}
