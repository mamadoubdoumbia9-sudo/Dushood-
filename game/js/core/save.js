// DUSHOOD — système de sauvegarde fiable (phase 32) : versionné, checksum,
// tolérant à la corruption, migration, testable sous Node (storage injectable).
export function checksum(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export class SaveSystem {
  constructor(storage, key, version = 1) {
    this.storage = storage; // interface {getItem, setItem, removeItem}
    this.key = key;
    this.version = version;
  }
  save(data) {
    try {
      const payload = JSON.stringify(data);
      const envelope = JSON.stringify({ v: this.version, c: checksum(payload), d: payload, t: Date.now() });
      this.storage.setItem(this.key, envelope);
      return true;
    } catch (e) {
      return false;
    }
  }
  load() {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return null; // première installation / sauvegarde vide
      const env = JSON.parse(raw);
      if (typeof env !== 'object' || env === null || typeof env.d !== 'string') return null;
      if (checksum(env.d) !== env.c) return null; // corruption détectée → échec propre
      let data = JSON.parse(env.d);
      if (env.v !== this.version) data = this.migrate(data, env.v);
      return data;
    } catch (e) {
      return null; // données invalides → repartir proprement
    }
  }
  migrate(data, fromVersion) {
    // Point d'extension pour les futures versions ; v1 = identité.
    return data;
  }
  exists() {
    try { return this.storage.getItem(this.key) !== null; } catch { return false; }
  }
  clear() {
    try { this.storage.removeItem(this.key); return true; } catch { return false; }
  }
}

// Adaptateur localStorage sûr (localStorage peut jeter en WebView selon config)
export function safeLocalStorage() {
  try {
    const t = '__dushood_test__';
    window.localStorage.setItem(t, '1');
    window.localStorage.removeItem(t);
    return window.localStorage;
  } catch {
    // Fallback mémoire : le jeu reste jouable même sans stockage persistant
    const mem = new Map();
    return {
      getItem: k => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, String(v)),
      removeItem: k => mem.delete(k),
    };
  }
}
