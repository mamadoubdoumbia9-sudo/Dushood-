// DUSHOOD — état du monde (phase 66) : flags, chapitres, fragments, inventaire, puzzles.
// Module pur, sérialisable, testable sous Node.
import { CONFIG } from '../core/config.js';

export class GameState {
  constructor() { this.reset(); }
  reset() {
    this.startedAt = Date.now();
    this.playTime = 0;
    this.chapter = null;              // chapitre courant ('garden'...)
    this.unlocked = ['garden'];       // chapitres accessibles
    this.completed = [];              // chapitres terminés
    this.fragments = [];              // indices de fragments de lettre obtenus (0..4)
    this.inventory = [];              // ids d'objets possédés
    this.usedItems = [];              // ids d'objets consommés
    this.flags = {};                  // drapeaux narratifs { key: true }
    this.puzzles = {};                // états sérialisés des puzzles { id: {...} }
    this.dialoguesSeen = [];          // ids de dialogues déjà joués
    this.hintsUsed = {};              // { puzzleId: n }
    this.introSeen = false;
    this.letterRead = false;
    this.epilogueSeen = false;
    this.galleryUnlocked = false;
  }
  // ---- flags ----
  setFlag(k) { this.flags[k] = true; }
  hasFlag(k) { return !!this.flags[k]; }
  // ---- inventaire ----
  addItem(id) { if (!this.inventory.includes(id)) { this.inventory.push(id); return true; } return false; }
  hasItem(id) { return this.inventory.includes(id); }
  useItem(id) {
    const i = this.inventory.indexOf(id);
    if (i < 0) return false;
    this.inventory.splice(i, 1);
    if (!this.usedItems.includes(id)) this.usedItems.push(id);
    return true;
  }
  // ---- fragments de lettre ----
  addFragment(index) {
    if (index < 0 || index >= CONFIG.FRAGMENTS_TOTAL) return false;
    if (this.fragments.includes(index)) return false;
    this.fragments.push(index);
    this.fragments.sort((a, b) => a - b);
    return true;
  }
  hasAllFragments() { return this.fragments.length >= CONFIG.FRAGMENTS_TOTAL; }
  // ---- progression chapitres ----
  unlockChapter(id) {
    if (!CONFIG.CHAPTERS.includes(id)) return false;
    if (!this.unlocked.includes(id)) { this.unlocked.push(id); return true; }
    return false;
  }
  isUnlocked(id) { return this.unlocked.includes(id); }
  completeChapter(id) {
    if (!this.completed.includes(id)) this.completed.push(id);
    const idx = CONFIG.CHAPTERS.indexOf(id);
    if (idx >= 0 && idx + 1 < CONFIG.CHAPTERS.length) this.unlockChapter(CONFIG.CHAPTERS[idx + 1]);
  }
  isCompleted(id) { return this.completed.includes(id); }
  nextChapter() {
    for (const c of CONFIG.CHAPTERS) if (!this.completed.includes(c)) return c;
    return null;
  }
  progressPercent() {
    // 5 chapitres + lettre + épilogue = 7 jalons
    let done = this.completed.length;
    if (this.letterRead) done++;
    if (this.epilogueSeen) done++;
    return Math.round((done / 7) * 100);
  }
  // ---- dialogues ----
  markDialogue(id) { if (!this.dialoguesSeen.includes(id)) this.dialoguesSeen.push(id); }
  sawDialogue(id) { return this.dialoguesSeen.includes(id); }
  // ---- puzzles ----
  savePuzzle(id, data) { this.puzzles[id] = data; }
  loadPuzzle(id) { return this.puzzles[id] || null; }
  isPuzzleSolved(id) { return !!(this.puzzles[id] && this.puzzles[id].solved); }
  // ---- sérialisation ----
  serialize() {
    return {
      startedAt: this.startedAt, playTime: this.playTime, chapter: this.chapter,
      unlocked: [...this.unlocked], completed: [...this.completed],
      fragments: [...this.fragments], inventory: [...this.inventory],
      usedItems: [...this.usedItems], flags: { ...this.flags },
      puzzles: JSON.parse(JSON.stringify(this.puzzles)),
      dialoguesSeen: [...this.dialoguesSeen], hintsUsed: { ...this.hintsUsed },
      introSeen: this.introSeen, letterRead: this.letterRead,
      epilogueSeen: this.epilogueSeen, galleryUnlocked: this.galleryUnlocked,
    };
  }
  static deserialize(data) {
    const s = new GameState();
    if (!data || typeof data !== 'object') return s;
    const arr = (v) => Array.isArray(v) ? v : [];
    const obj = (v) => (v && typeof v === 'object') ? v : {};
    s.startedAt = Number(data.startedAt) || Date.now();
    s.playTime = Number(data.playTime) || 0;
    s.chapter = typeof data.chapter === 'string' ? data.chapter : null;
    s.unlocked = arr(data.unlocked).filter(c => CONFIG.CHAPTERS.includes(c));
    if (!s.unlocked.includes('garden')) s.unlocked.unshift('garden');
    s.completed = arr(data.completed).filter(c => CONFIG.CHAPTERS.includes(c));
    s.fragments = arr(data.fragments).filter(n => Number.isInteger(n) && n >= 0 && n < CONFIG.FRAGMENTS_TOTAL);
    s.inventory = arr(data.inventory).filter(x => typeof x === 'string');
    s.usedItems = arr(data.usedItems).filter(x => typeof x === 'string');
    s.flags = obj(data.flags);
    s.puzzles = obj(data.puzzles);
    s.dialoguesSeen = arr(data.dialoguesSeen);
    s.hintsUsed = obj(data.hintsUsed);
    s.introSeen = !!data.introSeen;
    s.letterRead = !!data.letterRead;
    s.epilogueSeen = !!data.epilogueSeen;
    s.galleryUnlocked = !!data.galleryUnlocked;
    return s;
  }
}
