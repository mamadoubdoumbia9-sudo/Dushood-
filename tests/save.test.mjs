// Tests du système de sauvegarde (phases 32, 50) : corruption, première installation, migration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SaveSystem, checksum } from '../game/js/core/save.js';

function memStorage() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    _raw: m,
  };
}

test('première installation : load() retourne null sans erreur', () => {
  const s = new SaveSystem(memStorage(), 'k', 1);
  assert.equal(s.load(), null);
  assert.equal(s.exists(), false);
});

test('sauvegarde puis rechargement : round-trip fidèle', () => {
  const s = new SaveSystem(memStorage(), 'k', 1);
  const data = { a: 1, b: [1, 2, 3], c: { x: 'été ❤️' } };
  assert.equal(s.save(data), true);
  assert.deepEqual(s.load(), data);
  assert.equal(s.exists(), true);
});

test('données corrompues (JSON invalide) : échec propre → null', () => {
  const st = memStorage();
  const s = new SaveSystem(st, 'k', 1);
  st.setItem('k', '{{{pas du json');
  assert.equal(s.load(), null);
});

test('checksum invalide (altération) : rejet propre', () => {
  const st = memStorage();
  const s = new SaveSystem(st, 'k', 1);
  s.save({ progress: 3 });
  const env = JSON.parse(st.getItem('k'));
  env.d = env.d.replace('3', '5'); // altère les données sans refaire le checksum
  st.setItem('k', JSON.stringify(env));
  assert.equal(s.load(), null);
});

test('enveloppe non-objet : rejet propre', () => {
  const st = memStorage();
  const s = new SaveSystem(st, 'k', 1);
  st.setItem('k', '"juste une chaine"');
  assert.equal(s.load(), null);
});

test('clear() efface la sauvegarde', () => {
  const s = new SaveSystem(memStorage(), 'k', 1);
  s.save({ x: 1 });
  assert.equal(s.clear(), true);
  assert.equal(s.load(), null);
});

test('migration appelée quand la version diffère', () => {
  const st = memStorage();
  const v1 = new SaveSystem(st, 'k', 1);
  v1.save({ old: true });
  const v2 = new SaveSystem(st, 'k', 2);
  let migrated = false;
  v2.migrate = (d, from) => { migrated = true; assert.equal(from, 1); return { ...d, upgraded: true }; };
  const out = v2.load();
  assert.equal(migrated, true);
  assert.deepEqual(out, { old: true, upgraded: true });
});

test('checksum : déterministe et sensible au contenu', () => {
  assert.equal(checksum('abc'), checksum('abc'));
  assert.notEqual(checksum('abc'), checksum('abd'));
});

test('storage qui jette : save() retourne false sans crash', () => {
  const s = new SaveSystem({ getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); }, removeItem() { throw new Error('x'); } }, 'k', 1);
  assert.equal(s.save({ a: 1 }), false);
  assert.equal(s.load(), null);
  assert.equal(s.exists(), false);
});
