# DUSHOOD PROJECT STATE

## Project
Nom : Dushood — expérience interactive 2D romantique (cadeau d'Esteban pour Lohen)
Techno : « Dushood Engine » (Canvas 2D + WebAudio + localStorage, zéro dépendance) + wrapper Android WebView (Gradle)

## Global progress
**Blocks : 999 / 999 VERIFIED — 0 in progress — 0 blocked — 0 not started**
(le PDF contient 999 blocs réels, pas 500 — voir DECISIONS.md D-001)

## Current phase
TERMINÉ — production complète, audits clos (FINAL_AUDIT.md : PASS ; COMPLIANCE_AUDIT.md : PASS)

## Current block
Aucun — cycle complet achevé.

## Completed blocks
001–999 : voir BLOCK_REGISTER.md (généré par tools/gen_register.mjs)

## In-progress blocks
Aucun.

## Blocked blocks
Aucun.

## Technical decisions
DECISIONS.md D-001 → D-013. Points clés : 999 blocs réels ; moteur custom JS (pas de Unity/Unreal/
Godot) ; APK via CI GitHub (sandbox sans SDK) + procédure Termux ; audio 100 % procédural ;
pas de vidéo ; hors ligne ; zéro monétisation ; kotlin-bom 1.8.22 (fix build réel).

## Architecture decisions
docs/ARCHITECTURE.md : couches core/gameplay/ui/data/scenes ; logique pure testable sous Node ;
data-driven ; échec propre partout ; sauvegarde versionnée+checksum avec autosave.

## Design decisions
docs/GDD.md : 5 chapitres, 5 énigmes, fragments de lettre, Nayo guide, lettre finale avec
phrases exactes (testées), épilogue, galerie secrète, accessibilité (texte agrandi, réduction
d'animations).

## Git state
Branche `arena/01a0f23d-dushood` poussée sur GitHub. Commits : jeu complet → fixes CI →
fix kotlin-bom → preuve APK → clôture audits. CI « Android Build » : VERTE.

## Files created
~65 fichiers : game/ (30 modules JS + html/css + 7 illustrations), tests/ (10 suites, 75 tests),
android/ (Gradle + icônes 5 densités), workflow CI, docs/ complets, tools/, 8 documents de pilotage.

## Tests executed
- 75/75 tests node:test PASS (localement ET en CI avant chaque build)
- node --check sur les 30 modules : PASS
- Benchmarks : 0.061 ms/frame ; images 1 160 Ko ; save 424 o / 0.005 ms
- Parcours complet : 2 fois (logique pure + scènes réelles headless)
- 1 bug réel trouvé par test et corrigé (boucle infinie rng dégénéré, sequence.js)

## Build final (preuve)
Run CI 36718957257 : APK release 2 092 673 o (SHA-256 c744a697…), APK debug 4 671 338 o,
AAB 2 217 699 o ; badging com.esteban.dushood 1.0.0 minSdk 21 ; signature V2 OK ; contenu
vérifié. Artefacts : dushood-debug-apk / dushood-release-apk / dushood-release-aab (onglet Actions).

## Known limitations (documentées, non bloquantes)
- Écoute audio et test sur appareil physique : hors sandbox — couverts par tests headless,
  vérifications CI et aperçu live web du jeu réel.
- Captures store : à réaliser depuis le jeu réel (docs/store/DESCRIPTION.md).

## Remaining work
Aucun. Protocole de reprise (règle session) : relire ce fichier + BLOCK_REGISTER.md +
DECISIONS.md + `git log` avant toute évolution future.

## Next action
—
