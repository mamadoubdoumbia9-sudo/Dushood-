// DUSHOOD — particules 2D (phase 25) : lucioles, étincelles, pétales, poussière d'étoiles.
export class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x = 0; this.y = 0; this.vx = 0; this.vy = 0;
    this.life = 0; this.maxLife = 1; this.size = 2;
    this.color = '#ffe9a8'; this.alpha = 1; this.glow = false;
    this.phase = Math.random() * Math.PI * 2;
    this.wander = 0; this.gravity = 0; this.dead = true;
  }
}

export class ParticleSystem {
  constructor(max = 300) {
    this.pool = Array.from({ length: max }, () => new Particle());
  }
  spawn(cfg) {
    const p = this.pool.find(p => p.dead);
    if (!p) return null;
    p.reset();
    Object.assign(p, cfg);
    p.dead = false;
    p.life = 0;
    return p;
  }
  burst(x, y, count, cfgFn) {
    for (let i = 0; i < count; i++) this.spawn(cfgFn(i));
  }
  update(dt) {
    for (const p of this.pool) {
      if (p.dead) continue;
      p.life += dt;
      if (p.life >= p.maxLife) { p.dead = true; continue; }
      p.phase += dt * 2;
      if (p.wander) {
        p.vx += Math.cos(p.phase * 1.3) * p.wander * dt;
        p.vy += Math.sin(p.phase) * p.wander * dt;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }
  draw(ctx) {
    for (const p of this.pool) {
      if (p.dead) continue;
      const t = p.life / p.maxLife;
      const fade = t < 0.15 ? t / 0.15 : t > 0.7 ? (1 - t) / 0.3 : 1;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha * fade);
      if (p.glow) {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, p.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  activeCount() { return this.pool.filter(p => !p.dead).length; }
}

// Préréglages
export const Emitters = {
  firefly(ps, w, h) {
    if (Math.random() < 0.03 && ps.activeCount() < 40) {
      ps.spawn({
        x: Math.random() * w, y: h * 0.25 + Math.random() * h * 0.65,
        vx: (Math.random() - 0.5) * 18, vy: (Math.random() - 0.5) * 10,
        maxLife: 6 + Math.random() * 5, size: 2 + Math.random() * 2,
        color: '#ffe9a8', glow: true, wander: 30, alpha: 0.9,
      });
    }
  },
  sparkleBurst(ps, x, y, color = '#ffd76e') {
    ps.burst(x, y, 18, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 220, vy: (Math.random() - 0.5) * 220 - 40,
      maxLife: 0.6 + Math.random() * 0.5, size: 1.5 + Math.random() * 2.5,
      color, glow: true, gravity: 120, alpha: 1,
    }));
  },
  heartBurst(ps, x, y) {
    ps.burst(x, y, 26, (i) => {
      const a = (i / 26) * Math.PI * 2;
      return {
        x, y, vx: Math.cos(a) * 130, vy: Math.sin(a) * 130 - 50,
        maxLife: 1.4, size: 3, color: i % 2 ? '#ff7eb3' : '#ffd1e0',
        glow: true, gravity: 40, alpha: 1,
      };
    });
  },
  petals(ps, w) {
    if (Math.random() < 0.02 && ps.activeCount() < 60) {
      ps.spawn({
        x: Math.random() * w, y: -10,
        vx: (Math.random() - 0.5) * 30, vy: 25 + Math.random() * 20,
        maxLife: 12, size: 2.5 + Math.random() * 2, color: '#f7c6d9',
        wander: 25, alpha: 0.8, glow: false,
      });
    }
  },
};
