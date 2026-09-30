// Harnais headless : stubs DOM/Canvas pour exécuter le vrai code des scènes sous Node.
export function installDomStubs() {
  const makeGradient = () => ({ addColorStop() {} });
  const ctxHandler = {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') {
        return () => makeGradient();
      }
      if (key === 'measureText') return (text) => ({ width: String(text).length * 11 });
      // toute autre méthode : no-op
      const fn = () => {};
      target[key] = fn;
      return fn;
    },
    set(target, key, value) { target[key] = value; return true; },
  };
  const ctx = new Proxy({}, ctxHandler);

  const canvas = {
    width: 1280, height: 720,
    style: {},
    getContext: () => ctx,
    addEventListener() {}, removeEventListener() {},
    setPointerCapture() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1280, height: 720 }),
  };

  globalThis.window = {
    innerWidth: 1280, innerHeight: 720, devicePixelRatio: 1,
    addEventListener() {}, removeEventListener() {},
    // pas d'AudioContext : l'audio doit se désactiver proprement (cas limite réel)
  };
  globalThis.document = {
    hidden: false, readyState: 'complete',
    addEventListener() {}, removeEventListener() {},
    getElementById: () => null,
  };
  globalThis.Image = class {
    set src(_) { setTimeout(() => this.onerror && this.onerror(), 0); }
  };
  if (!globalThis.performance) globalThis.performance = { now: () => Date.now() };
  return { canvas, ctx };
}

export function memStorage() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
  };
}
