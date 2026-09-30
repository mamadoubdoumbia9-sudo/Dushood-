// DUSHOOD — parallaxe 2D (phase 22/25) : couches réagissant doucement au pointeur.
export class ParallaxLayer {
  constructor(draw, depth) {
    this.draw = draw;   // fn(ctx, ox, oy, t)
    this.depth = depth; // 0 = fixe, 1 = très mobile
  }
}

export class Parallax {
  constructor() {
    this.layers = [];
    this.targetX = 0; this.targetY = 0;
    this.curX = 0; this.curY = 0;
    this.amplitude = 14;
  }
  add(drawFn, depth) { this.layers.push(new ParallaxLayer(drawFn, depth)); }
  setTargetFromPointer(px, py, w, h) {
    this.targetX = (px / w - 0.5) * 2;
    this.targetY = (py / h - 0.5) * 2;
  }
  update(dt) {
    const k = Math.min(dt * 2.5, 1);
    this.curX += (this.targetX - this.curX) * k;
    this.curY += (this.targetY - this.curY) * k;
  }
  draw(ctx, t) {
    for (const l of this.layers) {
      const ox = -this.curX * this.amplitude * l.depth;
      const oy = -this.curY * this.amplitude * l.depth * 0.6;
      l.draw(ctx, ox, oy, t);
    }
  }
}
