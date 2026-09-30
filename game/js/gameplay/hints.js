// DUSHOOD — système d'indices progressifs (phase 16) : 3 niveaux par puzzle,
// délai anti-spam, comptage persistant. Module pur testable.
export class HintSystem {
  constructor(hintData, state, now = () => Date.now()) {
    this.data = hintData;    // { puzzleId: [hint1, hint2, hint3] }
    this.state = state;      // GameState (hintsUsed persisté)
    this.now = now;
    this.cooldownMs = 20000; // 20 s entre deux indices du même puzzle
    this._lastAsk = {};
  }
  available(puzzleId) {
    const hints = this.data[puzzleId] || [];
    const used = this.state.hintsUsed[puzzleId] || 0;
    return hints.length - Math.min(used, hints.length);
  }
  canAsk(puzzleId) {
    if (this.available(puzzleId) <= 0) return { ok: false, reason: 'exhausted' };
    const last = this._lastAsk[puzzleId] || 0;
    const elapsed = this.now() - last;
    if (elapsed < this.cooldownMs) return { ok: false, reason: 'cooldown', waitMs: this.cooldownMs - elapsed };
    return { ok: true };
  }
  ask(puzzleId) {
    const c = this.canAsk(puzzleId);
    if (!c.ok) return { ok: false, ...c };
    const used = this.state.hintsUsed[puzzleId] || 0;
    const hint = (this.data[puzzleId] || [])[used];
    this.state.hintsUsed[puzzleId] = used + 1;
    this._lastAsk[puzzleId] = this.now();
    return { ok: true, hint, level: used + 1 };
  }
  // Relire les indices déjà débloqués (sans coût)
  unlockedHints(puzzleId) {
    const used = this.state.hintsUsed[puzzleId] || 0;
    return (this.data[puzzleId] || []).slice(0, used);
  }
}
