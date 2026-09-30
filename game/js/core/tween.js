// DUSHOOD — easing & tweens (animations douces, phase 23/24)
export const Ease = {
  linear: t => t,
  inQuad: t => t * t,
  outQuad: t => t * (2 - t),
  inOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  outCubic: t => 1 + (--t) * t * t,
  inCubic: t => t * t * t,
  outBack: t => { const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
  outElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1,
  sine: t => 0.5 - 0.5 * Math.cos(t * Math.PI),
};

export class Tween {
  constructor(target, props, duration, ease = Ease.inOutQuad, onDone = null) {
    this.target = target; this.props = props; this.duration = Math.max(duration, 0.0001);
    this.ease = ease; this.onDone = onDone;
    this.t = 0; this.done = false;
    this.from = {};
    for (const k of Object.keys(props)) this.from[k] = target[k];
  }
  update(dt) {
    if (this.done) return;
    this.t += dt;
    const p = Math.min(this.t / this.duration, 1);
    const e = this.ease(p);
    for (const k of Object.keys(this.props)) {
      this.target[k] = this.from[k] + (this.props[k] - this.from[k]) * e;
    }
    if (p >= 1) { this.done = true; if (this.onDone) this.onDone(); }
  }
}

export class TweenManager {
  constructor() { this.tweens = []; }
  add(target, props, duration, ease, onDone) {
    const tw = new Tween(target, props, duration, ease, onDone);
    this.tweens.push(tw); return tw;
  }
  update(dt) {
    for (const tw of this.tweens) tw.update(dt);
    this.tweens = this.tweens.filter(t => !t.done);
  }
  clear() { this.tweens = []; }
}
