// DUSHOOD — localisation (phase 84). FR langue du cadeau ; EN disponible.
// La lettre finale reste en français dans toutes les langues (décision D-008).
export class I18n {
  constructor(dicts, lang = 'fr', fallback = 'fr') {
    this.dicts = dicts;
    this.fallback = fallback;
    this.lang = dicts[lang] ? lang : fallback;
  }
  setLang(lang) { if (this.dicts[lang]) { this.lang = lang; return true; } return false; }
  t(key, vars = null) {
    let s = this.dicts[this.lang]?.[key] ?? this.dicts[this.fallback]?.[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  }
  has(key) { return key in (this.dicts[this.lang] || {}) || key in (this.dicts[this.fallback] || {}); }
  languages() { return Object.keys(this.dicts); }
}
