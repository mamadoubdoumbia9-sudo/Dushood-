# DUSHOOD PROJECT STATE

## Project
Nom : Dushood — expérience interactive 2D romantique (cadeau d'Esteban pour Lohen)
Techno : « Dushood Engine » (Canvas 2D + WebAudio + localStorage, zéro dépendance) + wrapper Android WebView (Gradle)

## Global progress
Blocks : 930 / 999 verified — 69 in progress — 0 blocked — 0 not started
(le PDF contient 999 blocs réels, pas 500 — voir DECISIONS.md D-001)

## Current phase
Build Android CI + audits finaux (phases 46, 72, 73, 80–82, 100)

## Current block
451–460 (ANDROID - BUILD) : en attente du run GitHub Actions de référence

## Completed blocks
Phases 01–45, 47–71, 74–79, 83–99 : voir BLOCK_REGISTER.md (généré par tools/gen_register.mjs)

## In-progress blocks
- 451–460 (build Android) : projet Gradle complet, run CI en cours de déclenchement
- 711–720 (GitHub) : push de la branche en cours
- 721–730 (CI/CD) : premier run attendu
- 791–800 (beta) / 801–810 (RC) / 811–820 (distribution) : dépendent du build vert
- 991–999 (audit final) : clôture après build

## Blocked blocks
Aucun.

## Technical decisions
Voir DECISIONS.md (D-001 → D-013). Points clés : 999 blocs réels ; moteur custom JS (pas de
Unity/Unreal/Godot) ; build APK via CI GitHub (dl.google.com bloqué dans le sandbox) + procédure
Termux documentée ; audio 100 % procédural ; pas de vidéo ; hors ligne ; zéro monétisation.

## Architecture decisions
docs/ARCHITECTURE.md : couches core/gameplay/ui/data/scenes ; logique pure testable sous Node ;
data-driven ; échec propre partout ; sauvegarde versionnée+checksum avec autosave.

## Design decisions
docs/GDD.md : 5 chapitres (jardin, forêt, lac, ville, tour), 5 énigmes, fragments de lettre,
Nayo guide, lettre finale avec phrases exactes, épilogue, galerie secrète.

## Git state
Branche : arena/01a0f23d-dushood (base : main@4b405af). Commit de production en cours.

## Files created
~60 fichiers : game/ (30 modules JS + html/css + 7 illustrations), tests/ (9 suites, 75 tests),
android/ (projet Gradle complet + icônes 5 densités), .github/workflows/android-build.yml,
docs/ (GDD, ARCHITECTURE, ANDROID_BUILD, LICENSES, store, spec/blocks.json, art/),
tools/gen_register.mjs, 7 documents de pilotage à la racine.

## Files modified
sequence.js (garde-fou rng dégénéré — bug trouvé par test), dialogue.js/menu.js/exploration.js et al.
(accessibilité : bigText, reduceMotion), strings.js (2 clés), workflow (AAB).

## Tests executed
- node --check sur les 30 modules : PASS
- 75/75 tests node:test : PASS (sauvegarde 9, état 8, puzzles 24, indices 5, lettre 6, données 8,
  parcours complet 3, UI headless 3, audio 5, perf 4)
- Benchmarks : 0.061 ms/frame logique ; images 1160 Ko ; save 424 octets / 0.005 ms
- Serveur web du jeu : 200 OK sur /, JS, CSS, images (aperçu live actif, port 8000)

## Known issues
- Écoute audio réelle et test sur appareil Android physique : hors de portée du sandbox —
  couverts par tests headless + aperçu live + vérifications CI (aapt/apksigner).
- Captures d'écran store : à réaliser depuis le jeu réel (aperçu ou appareil).

## Remaining work
1. Commit + push branche arena → GitHub (blocs 711–720)
2. Run CI « Android Build » vert : APK debug + release + AAB vérifiés (blocs 451–460, 721–730)
3. Télécharger et vérifier les artefacts APK depuis le sandbox (règle 34)
4. Basculer les 69 blocs [~] → [✓] ; FINAL_AUDIT.md + COMPLIANCE_AUDIT.md complets (991–999)
5. Mise à jour finale de ce fichier + checkpoint

## Next action
git add/commit/push, puis suivi du run GitHub Actions.
