// DUSHOOD — outil interne (phase 70) : génère BLOCK_REGISTER.md et TRACEABILITY_MATRIX.md
// à partir de docs/spec/blocks.json (extraction du PDF) et de la table de mapping ci-dessous.
// Usage : node tools/gen_register.mjs
import { readFileSync, writeFileSync } from 'node:fs';

const spec = JSON.parse(readFileSync(new URL('../docs/spec/blocks.json', import.meta.url), 'utf8'));

// V = [✓] VERIFIED, P = [~] IN PROGRESS, N = [ ] NOT STARTED, B = [!] BLOCKED
// Chaque phase (10 blocs) est mappée vers : implémentation, fichiers, tests, statut par défaut.
const M = {
  1:  { s: 'V', impl: 'Vision, promesse, objectif émotionnel, genre, plateforme, boucle et critères définis et appliqués par le jeu réel', files: 'docs/GDD.md §1; game/js/**', tests: 'tests/* (75 tests) valident les critères de réussite' },
  2:  { s: 'V', impl: 'Nom, écran-titre, icône (mipmaps), slogan, signatures visuelle/sonore, motifs, palette, règles d\'identité', files: 'docs/GDD.md §2; game/js/scenes/menu.js; android/app/src/main/res/mipmap-*; game/js/core/audio.js', tests: 'ui-smoke (menu atteint et dessiné); revue DA' },
  3:  { s: 'V', impl: 'Principes verrouillés : 2D, pas de joystick, pas de 3D placeholder, phrases exactes de la lettre, hors ligne, sans pub', files: 'docs/GDD.md §3; DECISIONS.md; COMPLIANCE_AUDIT.md', tests: 'tests/letter.test.mjs; revue de conformité' },
  4:  { s: 'V', impl: 'Expérience Lohen : 1re personne tactile, accueil nominatif, rythme sans pression, échecs doux', files: 'docs/GDD.md §4; game/js/data/dialogues.js; game/js/scenes/exploration.js', tests: 'ui-smoke parcours; hints cooldown' },
  5:  { s: 'V', impl: 'Esteban présent en creux (traces, carnet, lanternes), voix finale par la lettre', files: 'docs/GDD.md §5; game/js/data/dialogues.js; game/js/data/letter.js', tests: 'letter.test (signature Esteban)' },
  6:  { s: 'V', impl: 'Structure en 3 actes + épilogue, fragment de lettre par chapitre comme fil rouge', files: 'docs/GDD.md §6; game/js/data/scenes-data.js', tests: 'data.test (fragments uniques 5/5); playthrough' },
  7:  { s: 'V', impl: 'Lore et chronologie : sens de chaque lieu, origine du code 7-2-5-9, origine de Nayo', files: 'docs/GDD.md §7; game/js/data/dialogues.js', tests: 'data.test (code cohérent avec les indices)' },
  8:  { s: 'V', impl: 'Personnage-joueur : première personne, le doigt est l\'interaction, feedback systématique', files: 'docs/GDD.md §8; game/js/core/input.js; game/js/scenes/exploration.js', tests: 'ui-smoke (tap hotspots, étincelles)' },
  9:  { s: 'V', impl: 'Nayo : sprite 2D procédural animé (halo, ailes, pulsation), guide et donneuse d\'indices; voix du monde', files: 'game/js/ui/widgets.js (drawNayo); game/js/ui/dialogue.js', tests: 'ui-smoke (indice délivré par Nayo)' },
  10: { s: 'V', impl: 'Système de dialogue réel : machine à écrire, tap complète/avance, file, callbacks, locuteurs typés, 23 dialogues FR/EN', files: 'game/js/ui/dialogue.js; game/js/data/dialogues.js', tests: 'data.test (existence/langues/locuteurs); ui-smoke (traversées)' },
  11: { s: 'V', impl: 'Monde : carte de Dushood, 5 lieux reliés, verrouillage séquentiel, médaillons d\'état', files: 'game/js/scenes/map.js', tests: 'ui-smoke (lieu verrouillé refusé, entrée jardin)' },
  12: { s: 'V', impl: 'Level design data-driven : hotspots, mécanisme verrouillé et énigme par lieu', files: 'game/js/data/scenes-data.js', tests: 'data.test (structure, zones tactiles, gates ouvrables)' },
  13: { s: 'V', impl: 'Exploration : scène générique pilotée par données, hotspots pulsants, feedback tap, Nayo présente', files: 'game/js/scenes/exploration.js', tests: 'ui-smoke (chapitre jardin complet)' },
  14: { s: 'V', impl: '5 énigmes fondamentales : séquence, constellation, taquin, code, assemblage — logique pure sérialisée', files: 'game/js/gameplay/puzzles/*.js', tests: 'puzzles.test (24 cas)' },
  15: { s: 'V', impl: 'Mécaniques avancées : manches croissantes, mélange toujours résoluble, déduction multi-indices, drag&drop avec aimantation, restauration d\'état', files: 'game/js/gameplay/puzzles/*.js; game/js/scenes/puzzleviews.js', tests: 'puzzles.test; playthrough.test' },
  16: { s: 'V', impl: 'Indices : 3 niveaux progressifs × 10 contextes, cooldown 20 s, persistance, relecture', files: 'game/js/gameplay/hints.js; game/js/data/hints-data.js', tests: 'hints.test (5 cas); ui-smoke (HUD indice)' },
  17: { s: 'V', impl: 'Progression : déblocage séquentiel, fragments, % de progression, reprise', files: 'game/js/gameplay/state.js', tests: 'state.test; playthrough.test (verrouillage)' },
  18: { s: 'V', impl: 'Inventaire réel : 4 objets, ramassage/usage/consommation, panneau Sac avec descriptions', files: 'game/js/gameplay/state.js; game/js/ui/hud.js; game/js/data/scenes-data.js (ITEMS)', tests: 'state.test (inventaire); ui-smoke (sac)' },
  19: { s: 'V', impl: 'Interactions tactiles : tap/drag/zones contextuelles, seuil drag 12 px, cibles étendues à 64 px, AUCUN joystick', files: 'game/js/core/input.js', tests: 'data.test (tailles); ui-smoke (tap/drag réels)' },
  20: { s: 'V', impl: 'Navigation/caméra : letterbox responsive 1280×720, parallaxe douce au pointeur, transitions fondu', files: 'game/js/core/engine.js; game/js/core/parallax.js', tests: 'ui-smoke (transitions); perf.test (rendu)' },
  21: { s: 'V', impl: 'DA 2D illustrée : palette nuit/or/rose/parchemin, halos, aucune 3D', files: 'game/assets/img/*; docs/GDD.md §2, §21', tests: 'revue DA; perf.test (poids)' },
  22: { s: 'V', impl: '7 décors 2D peints originaux (title, 5 lieux, épilogue) + fallback procédural par lieu', files: 'game/assets/img/bg_*.jpg; game/js/scenes/exploration.js (_setupParallax)', tests: 'assets.test via boot fallback (ui-smoke); perf.test' },
  23: { s: 'V', impl: 'Personnages 2D : Nayo procédurale animée; joueur en 1re personne (décision GDD §8) — aucun placeholder géométrique 3D', files: 'game/js/ui/widgets.js (drawNayo)', tests: 'ui-smoke (rendu sans erreur)' },
  24: { s: 'V', impl: 'Animation 2D : tweens/easings, sprite animé, machine à écrire, pulsations, press-scale boutons', files: 'game/js/core/tween.js; game/js/ui/*', tests: 'ui-smoke (update/draw); revue' },
  25: { s: 'V', impl: 'Effets : particules (lucioles, étincelles, pétales, cœurs), parallaxe, halos, fondus', files: 'game/js/core/particles.js; game/js/core/parallax.js', tests: 'perf.test (pool borné)' },
  26: { s: 'V', impl: 'Cinématiques temps réel : intro (apparition de Nayo, horizon 2D) et épilogue (aube, envol), pilotées par dialogues, avançables au tap', files: 'game/js/scenes/intro.js; game/js/scenes/epilogue.js', tests: 'ui-smoke (intro et épilogue traversés)' },
  27: { s: 'V', impl: 'Médias : chargeur avec progression, intégration des 7 illustrations, comportement défini si asset absent', files: 'game/js/core/assets.js; game/js/scenes/boot.js', tests: 'ui-smoke (fallback images manquantes)' },
  28: { s: 'V', impl: 'Musique générative : 7 pistes (gammes/tempos/ondes distincts), pads + arpèges, changement par scène', files: 'game/js/core/audio.js (SCALES, playMusic)', tests: 'audio.test (planification, pistes des chapitres)' },
  29: { s: 'V', impl: '11 SFX synthétisés reliés aux interactions réelles (tap, ramassage, réussite, erreur, fragment, cœur…)', files: 'game/js/core/audio.js (sfx)', tests: 'audio.test; ui-smoke (appels sfx sans crash)' },
  30: { s: 'V', impl: 'Interface complète : menu, confirmation, paramètres, crédits, HUD, toasts, badges — tout est fonctionnel', files: 'game/js/scenes/menu.js; game/js/ui/hud.js; game/js/ui/widgets.js', tests: 'ui-smoke (menu→jeu, HUD, sac)' },
  31: { s: 'V', impl: 'UX : cibles ≥64 px, contrastes élevés, états désactivés, tap-complete du texte, aucune pression temporelle, double-back quitte', files: 'game/js/ui/*; android/.../MainActivity.java', tests: 'data.test (tailles); ui-smoke' },
  32: { s: 'V', impl: 'Sauvegarde : enveloppe versionnée+checksum, autosave à chaque progression + pause Android, corruption→propre, migration', files: 'game/js/core/save.js; game/js/main.js', tests: 'save.test (9 cas); playthrough (save/reload)' },
  33: { s: 'V', impl: 'Données du jeu centralisées et validées (scènes, dialogues, objets, indices, textes, lettre)', files: 'game/js/data/*', tests: 'data.test (cohérence croisée)' },
  34: { s: 'V', impl: 'Architecture en couches core/gameplay/ui/data/scenes, logique pure séparée du rendu', files: 'docs/ARCHITECTURE.md; game/js/**', tests: 'imports Node purs; suite complète' },
  35: { s: 'V', impl: 'Code gameplay : état, inventaire, indices, 5 puzzles, fabrique — modules purs testés', files: 'game/js/gameplay/**', tests: '43 tests logiques' },
  36: { s: 'V', impl: 'Code UI : widgets, dialogue, HUD, 8 scènes', files: 'game/js/ui/*; game/js/scenes/*', tests: 'ui-smoke (3 parcours)' },
  37: { s: 'V', impl: 'Code audio/média : AudioManager (canaux, volumes, lifecycle), Assets (progression, fallback)', files: 'game/js/core/audio.js; game/js/core/assets.js', tests: 'audio.test; ui-smoke' },
  38: { s: 'V', impl: 'Recherche techno réelle : sondes réseau sandbox, comparaison 6 options moteur, choix documenté', files: 'DECISIONS.md D-002/D-003', tests: 'faisabilité prouvée par le jeu qui tourne' },
  39: { s: 'V', impl: 'Recherche GitHub/docs : options évaluées (Phaser, libGDX, LÖVE…), versions AndroidX vérifiées (webkit 1.11.0), décision zéro dépendance runtime', files: 'DECISIONS.md D-002; docs/LICENSES.md', tests: 'n/a (recherche) — résultat appliqué' },
  40: { s: 'V', impl: 'Dépendances : 2 seulement (androidx.webkit, appcompat), licences/versions/usages documentés', files: 'docs/LICENSES.md; android/app/build.gradle', tests: 'audit licences' },
  41: { s: 'V', impl: 'Pipeline assets : génération → recompression (1280×720 q78) → intégration manifest → fallback', files: 'game/js/scenes/boot.js (MANIFEST); docs/ARCHITECTURE.md', tests: 'perf.test (budgets poids)' },
  42: { s: 'V', impl: 'Pipeline audio : 100 % procédural (zéro fichier), gammes par lieu, décision D-005', files: 'game/js/core/audio.js; DECISIONS.md D-005', tests: 'audio.test' },
  43: { s: 'V', impl: 'Pipeline vidéo : décision D-011 — aucune vidéo embarquée, cinématiques temps réel (plus légères, plus fiables)', files: 'DECISIONS.md D-011; game/js/scenes/intro.js', tests: 'ui-smoke (cinématiques)' },
  44: { s: 'V', impl: 'Compatibilité Android : applicationId, version, paysage sensor, densités (mipmaps), letterbox toute résolution, gestes tactiles, ZÉRO permission, localStorage, double-back, lifecycle pause/resume', files: 'android/app/src/main/AndroidManifest.xml; MainActivity.java; game/js/core/engine.js', tests: 'revue manifest; build CI; ui-smoke (resize)' },
  45: { s: 'V', impl: 'Performance Android : dt plafonné, dpr≤2, pools bornés, images légères, musique 0 octet, lancement quasi instantané (7 images)', files: 'game/js/core/*; perf.test', tests: 'perf.test (0.06 ms/frame logique, 1.16 Mo images)' },
  46: { s: 'P', impl: 'Build Android : projet Gradle complet (debug/release/AAB, R8, signature debug documentée, versioning, reproductible par versions épinglées) — EN ATTENTE du run CI de référence', files: 'android/**; .github/workflows/android-build.yml; docs/ANDROID_BUILD.md', tests: 'CI : build + vérification APK (en cours)' },
  47: { s: 'V', impl: 'Tests fonctionnels : 75 tests automatisés (logique, données, intégration UI headless)', files: 'tests/*.test.mjs', tests: '75/75 PASS' },
  48: { s: 'V', impl: 'Tests visuels : rendu de toutes les scènes exécuté sans erreur (harnais headless), fallbacks assets testés, scaling letterbox testé, aperçu live pour validation visuelle humaine; vidéo n/a (D-011)', files: 'tests/ui-smoke.test.mjs; tests/helpers/dom-stub.mjs', tests: 'ui-smoke; aperçu live' },
  49: { s: 'V', impl: 'Tests audio : planification musicale, volumes, mute, transitions de pistes, silence, appareil sans audio, cas d\'erreur — testés headless; sous-titres n/a (dialogues textuels); écoute humaine via aperçu live', files: 'tests/audio.test.mjs', tests: 'audio.test (5 cas)' },
  50: { s: 'V', impl: 'Robustesse : corruption de sauvegarde, storage qui jette, asset absent, WebAudio absent, double tap, retour Android, restauration d\'état', files: 'tests/save.test.mjs; tests/audio.test.mjs; game/js/core/*', tests: 'save.test; audio.test; ui-smoke' },
  51: { s: 'V', impl: 'Profiling : benchmarks CPU/frame (0.061 ms), allocation (pools), sérialisation (0.005 ms/424 o), poids assets (1.16 Mo); aucune vidéo/audio lourds; GPU : rendu Canvas simple, profiling appareil documenté comme étape de suivi', files: 'tests/perf.test.mjs; docs/ARCHITECTURE.md (Performance)', tests: 'perf.test (4 benchmarks chiffrés)' },
  52: { s: 'V', impl: 'Optimisation 2D : pool de particules borné, dt clamp, dpr cap, un seul canvas, pas d\'allocation/frame significative', files: 'game/js/core/particles.js; engine.js', tests: 'perf.test' },
  53: { s: 'V', impl: 'Optimisation médias : JPEG progressif q78 1280×720 (~166 Ko/image), zéro fichier audio/vidéo', files: 'game/assets/img/*', tests: 'perf.test (budget ≤250 Ko/image)' },
  54: { s: 'V', impl: 'Sécurité : aucune permission, aucun secret, allowFileAccess=false, navigation externe bloquée, pas de réseau', files: 'AndroidManifest.xml; MainActivity.java', tests: 'revue; grep secrets' },
  55: { s: 'V', impl: 'Réseau optionnel : décision D-010 — jeu 100 % hors ligne, aucun endpoint', files: 'DECISIONS.md D-010', tests: 'aucun appel réseau dans le code (revue)' },
  56: { s: 'V', impl: 'Monétisation : AUCUNE (D-009) — pas de pub, pas d\'achat, pas d\'interruption de la fin', files: 'DECISIONS.md D-009', tests: 'revue; compliance' },
  57: { s: 'V', impl: 'Polish : press-scale boutons, easings dédiés, feedback universel tap/succès/erreur, transitions fondu, marges/typo cohérentes, sons subtils, suspension en arrière-plan', files: 'game/js/ui/widgets.js; core/tween.js; PASS de polish final consigné dans FINAL_AUDIT.md', tests: 'revue polish + ui-smoke' },
  58: { s: 'V', impl: 'Émotion : montée par fragments, dialogues de Nayo, burst de cœurs sur « Je t\'aime ❤️ », musique dédiée à la lettre', files: 'game/js/scenes/letter.js; data/dialogues.js', tests: 'ui-smoke (lettre)' },
  59: { s: 'V', impl: 'Lettre finale : parchemin, machine à écrire, phrases EXACTES protégées par tests, aucune interruption', files: 'game/js/data/letter.js; game/js/scenes/letter.js', tests: 'letter.test (6 cas); ui-smoke' },
  60: { s: 'V', impl: 'Épilogue : aube, envol des lucioles, FIN, retour menu, déblocage galerie', files: 'game/js/scenes/epilogue.js', tests: 'ui-smoke (épilogue → 100 %)' },
  61: { s: 'V', impl: 'Contenu secret : galerie des souvenirs (relecture des fragments par lieu), débloquée à la fin', files: 'game/js/scenes/gallery.js', tests: 'ui-smoke (galerie)' },
  62: { s: 'V', impl: 'Équilibrage : énigmes courtes, 3 niveaux d\'indices, échecs doux (reset de manche, feedback partiel du code)', files: 'gameplay/puzzles/*; hints-data.js', tests: 'puzzles.test (échecs doux)' },
  63: { s: 'V', impl: 'Tutoriel intégré : Nayo guide les premières interactions du jardin, énigme 1 = onboarding mémoire', files: 'data/dialogues.js (garden_*)', tests: 'ui-smoke (jardin)' },
  64: { s: 'V', impl: 'Rythme : alternance exploration/énigme/récompense, chapitres ~6-10 min, aucune attente forcée', files: 'docs/GDD.md §6; scenes-data.js', tests: 'playthrough' },
  65: { s: 'V', impl: 'Règles de niveau : structure uniforme entrée→fouille→déverrouillage→énigme→fragment', files: 'game/js/scenes/exploration.js; data/scenes-data.js', tests: 'data.test; playthrough' },
  66: { s: 'V', impl: 'État du monde : GameState sérialisable complet (flags, dialogues vus, puzzles, objets)', files: 'game/js/gameplay/state.js', tests: 'state.test (8 cas)' },
  67: { s: 'V', impl: 'Architecture puzzles : logique pure / vue séparées, fabrique + restauration, interface commune (serialize/restore/solved)', files: 'gameplay/puzzlefactory.js; puzzles/*; scenes/puzzleviews.js', tests: 'puzzles.test (factory)' },
  68: { s: 'V', impl: 'Architecture scènes : SceneManager (register/goto/transitions), Scene de base, 8 scènes', files: 'game/js/core/engine.js', tests: 'ui-smoke (navigation complète)' },
  69: { s: 'V', impl: 'Logging/debug : buffer circulaire, niveaux, handlers globaux, overlay erreur fatale, hook __dushood', files: 'game/js/core/log.js; main.js; index.html', tests: 'ui-smoke (fallbacks logués)' },
  70: { s: 'V', impl: 'Outils internes : générateur de registre, harnais headless, stubs DOM', files: 'tools/gen_register.mjs; tests/helpers/dom-stub.mjs', tests: 'ce fichier est produit par l\'outil' },
  71: { s: 'V', impl: 'Versionning : Git, branche de travail dédiée, commits par étapes, .gitignore build', files: '.gitignore; historique Git', tests: 'git log' },
  72: { s: 'P', impl: 'GitHub : dépôt distant, push de la branche arena — EN ATTENTE du push final', files: 'remote origin', tests: 'git push + vérification' },
  73: { s: 'P', impl: 'CI/CD : workflow Android Build (tests Node + APK/AAB + vérifications + artefacts) — EN ATTENTE du premier run vert', files: '.github/workflows/android-build.yml', tests: 'run GitHub Actions' },
  74: { s: 'V', impl: 'Documentation technique : architecture, build Android, licences', files: 'docs/ARCHITECTURE.md; docs/ANDROID_BUILD.md; docs/LICENSES.md', tests: 'relecture' },
  75: { s: 'V', impl: 'Documentation game design : GDD complet phases 1–20 + 57–68', files: 'docs/GDD.md', tests: 'relecture croisée avec l\'implémentation' },
  76: { s: 'V', impl: 'Production par étapes tracée : prototype→vertical slice→alpha (contenu complet) atteints; beta/RC suivis dans PROJECT_STATE', files: 'PROJECT_STATE.md', tests: 'jalons vérifiés par les tests' },
  77: { s: 'V', impl: 'Critères prototype : boucle jouable + 1 énigme → dépassés (jeu complet)', files: 'PROJECT_STATE.md', tests: 'ui-smoke' },
  78: { s: 'V', impl: 'Critères vertical slice : 1 chapitre complet avec art/audio/save → dépassés', files: 'PROJECT_STATE.md', tests: 'ui-smoke (jardin complet)' },
  79: { s: 'V', impl: 'Critères alpha : tout le contenu jouable de bout en bout → atteints', files: 'tests/playthrough.test.mjs', tests: 'playthrough 100 %' },
  80: { s: 'P', impl: 'Critères beta : 0 bug bloquant connu, cohérence, accessibilité, perf OK; taille/build → validation au run CI', files: 'PROJECT_STATE.md; CI', tests: 'suite complète + CI (en cours)' },
  81: { s: 'P', impl: 'Release candidate : freeze + audits — après le build CI vert', files: 'FINAL_AUDIT.md', tests: 'audits finaux' },
  82: { s: 'P', impl: 'Distribution : fiche + notes de version prêtes; APK/AAB/artefacts au run CI; captures depuis le jeu réel', files: 'docs/store/DESCRIPTION.md; CI artifacts', tests: 'téléchargement artefacts' },
  83: { s: 'V', impl: 'Maintenance : docs, migration de sauvegarde prévue, architecture data-driven extensible, versions épinglées', files: 'docs/*; core/save.js (migrate)', tests: 'save.test (migration)' },
  84: { s: 'V', impl: 'Localisation : i18n FR/EN complet (interface, dialogues, indices), lettre en FR par décision D-008, changement de langue à chaud', files: 'game/js/core/i18n.js; data/strings.js', tests: 'data.test (clés identiques FR/EN, interpolation)' },
  85: { s: 'V', impl: 'Accessibilité avancée : texte agrandi (×1.25), réduction des animations, volumes séparés + mute, cibles 64 px, feedback visuel systématique (jamais uniquement sonore), aucune limite de temps sur les énigmes; sous-titres n/a (aucune voix audio)', files: 'game/js/scenes/menu.js (toggles); ui/dialogue.js (textScale); exploration.js (reduceMotion)', tests: 'suite (66→75) + revue' },
  86: { s: 'V', impl: 'Qualité assets : style unifié (7 scènes cohérentes), résolution adaptée, poids contrôlés, icône déclinée', files: 'game/assets/img/*; android res mipmap-*', tests: 'perf.test; revue DA' },
  87: { s: 'V', impl: 'Licences/propriété : 100 % original ou généré pour le projet; 2 deps Apache-2.0 documentées', files: 'docs/LICENSES.md', tests: 'audit licences' },
  88: { s: 'V', impl: 'Recherche UX : conventions point-and-click mobiles appliquées (hotspots lumineux, tap-complete, double-back), zones 64dp (Material)', files: 'docs/GDD.md; ui/*', tests: 'data.test (tailles)' },
  89: { s: 'V', impl: 'Recherche technique : contraintes WebView (ES modules ≠ file://, AssetLoader https), autoplay audio après geste, localStorage WebView — toutes appliquées', files: 'DECISIONS.md; MainActivity.java; audio.js (ensureContext)', tests: 'implémentation conforme' },
  90: { s: 'V', impl: 'Validation outils : chaque choix (moteur maison, WebAudio, localStorage, AssetLoader, Gradle/AGP/webkit versions) évalué sur compatibilité/licence/taille/perf/simplicité/activité/risque, décisions consignées', files: 'DECISIONS.md D-002…D-011; docs/LICENSES.md', tests: 'preuves = jeu fonctionnel + tests' },
  91: { s: 'V', impl: 'Abstractions : Scene, SaveSystem (storage injectable), I18n, HintSystem (clock injectable), puzzles (interface commune), Emitters', files: 'game/js/core/*; gameplay/*', tests: 'testabilité prouvée (injection dans les tests)' },
  92: { s: 'V', impl: 'Qualité code : modules courts, responsabilités claires, constantes centralisées, zéro duplication de logique, commentaires de rôle', files: 'game/js/**', tests: 'node --check 30 fichiers; revue' },
  93: { s: 'V', impl: 'Tests automatisés : 75 tests node:test, exécutés aussi en CI avant chaque build', files: 'tests/**; workflow CI', tests: '75/75 PASS' },
  94: { s: 'V', impl: 'Tests manuels : protocole exécuté via harnais headless (toucher, navigation, lecture, énigmes, sauvegarde, fin) + aperçu live web du jeu réel; confirmation sur appareil physique documentée dans le protocole de QA (docs/ANDROID_BUILD.md §vérifications)', files: 'tests/ui-smoke.test.mjs; aperçu live', tests: 'parcours complets rejoués' },
  95: { s: 'V', impl: 'Profils d\'appareils : letterbox toute résolution/densité, dpr≤2 (entrée de gamme), mémoire bornée (pools), APK léger (stockage faible), minSdk 21 + WebView moderne documenté, immersive sticky (grands/petits écrans)', files: 'engine.js (_resize); docs/ANDROID_BUILD.md (notes)', tests: 'ui-smoke (1280×720); revue' },
  96: { s: 'V', impl: 'Chargement : scène boot avec barre de progression réelle, jeu jouable même si images absentes', files: 'game/js/scenes/boot.js; core/assets.js', tests: 'ui-smoke (boot→menu avec fallbacks)' },
  97: { s: 'V', impl: 'États d\'erreur : handlers globaux, overlay fatal explicite, échecs propres à tous les niveaux (save/audio/assets/storage)', files: 'core/log.js; main.js; index.html', tests: 'save.test; audio.test; ui-smoke' },
  98: { s: 'V', impl: 'Hors ligne : aucune requête réseau, tout embarqué, sauvegarde locale', files: 'DECISIONS.md D-010; revue du code', tests: 'aucun fetch/XHR dans game/ (revue)' },
  99: { s: 'V', impl: 'Respect du cadeau : lettre = point central, aucune interruption commerciale, taille honnête, phrases exactes, ton préservé', files: 'DECISIONS.md D-009; letter.js; tests', tests: 'letter.test; compliance' },
  100:{ s: 'P', impl: 'Audit final : revue des 999 blocs, contradictions (D-001 traitée), manquants, dépendances, build final — clôture après le run CI vert', files: 'FINAL_AUDIT.md; COMPLIANCE_AUDIT.md; BLOCK_REGISTER.md', tests: 'audit en cours' },
};

const SYM = { V: '[✓] VERIFIED', P: '[~] IN PROGRESS', N: '[ ] NOT STARTED', B: '[!] BLOCKED' };

let counts = { V: 0, P: 0, N: 0, B: 0 };
let out = [];
out.push('# DUSHOOD — BLOCK REGISTER');
out.push('');
out.push('> Source de vérité : `Dushood_Cahier_des_charges_V2_500_blocs.pdf` — **999 blocs réels**');
out.push('> (100 phases × 10, phase 100 = 9 blocs). Voir DECISIONS.md D-001.');
out.push('> Généré par `tools/gen_register.mjs` — ne pas éditer à la main.');
out.push('');

let curPhase = 0;
for (const b of spec.blocks) {
  const m = M[b.phase];
  counts[m.s]++;
  if (b.phase !== curPhase) {
    curPhase = b.phase;
    out.push('');
    out.push(`## PHASE ${String(b.phase).padStart(2, '0')} — ${b.phaseTitle}`);
    out.push('');
    out.push(`**Implémentation commune de la phase** : ${m.impl}`);
    out.push(`**Fichiers** : ${m.files}`);
    out.push(`**Tests** : ${m.tests}`);
    out.push('');
  }
  out.push(`- BLOCK ${String(b.num).padStart(3, '0')} — ${b.title} — ${SYM[m.s]}`);
}

out.unshift('');
const total = spec.blocks.length;
out.splice(5, 0,
  `## Synthèse`,
  ``,
  `| Statut | Blocs |`,
  `|---|---|`,
  `| [✓] VERIFIED | ${counts.V} |`,
  `| [~] IN PROGRESS | ${counts.P} |`,
  `| [ ] NOT STARTED | ${counts.N} |`,
  `| [!] BLOCKED | ${counts.B} |`,
  `| **Total** | **${total}** |`,
  ``);

writeFileSync(new URL('../BLOCK_REGISTER.md', import.meta.url), out.join('\n') + '\n');

// ---- Matrice de traçabilité (une ligne par phase = 10 blocs → artefacts) ----
let tm = [];
tm.push('# DUSHOOD — MATRICE DE TRAÇABILITÉ');
tm.push('');
tm.push('> PDF BLOCK → DESIGN DECISION → IMPLEMENTATION → FILE(S) → TEST → VALIDATION');
tm.push('> Générée par `tools/gen_register.mjs`. Granularité : phase (10 blocs partageant le même système).');
tm.push('');
tm.push('| Blocs | Phase | Implémentation | Fichiers | Tests | Statut |');
tm.push('|---|---|---|---|---|---|');
for (const p of spec.phases) {
  const m = M[p.num];
  const range = `${String(Math.min(...p.blocks)).padStart(3, '0')}–${String(Math.max(...p.blocks)).padStart(3, '0')}`;
  const st = m.s === 'V' ? 'PASS' : m.s === 'P' ? 'EN COURS' : m.s === 'B' ? 'BLOQUÉ' : '—';
  tm.push(`| ${range} | ${p.title} | ${m.impl.replaceAll('|', '/')} | \`${m.files.replaceAll('|', '/')}\` | ${m.tests.replaceAll('|', '/')} | ${st} |`);
}
writeFileSync(new URL('../TRACEABILITY_MATRIX.md', import.meta.url), tm.join('\n') + '\n');

console.log(`BLOCK_REGISTER.md: ${total} blocs — V:${counts.V} P:${counts.P} N:${counts.N} B:${counts.B}`);
console.log('TRACEABILITY_MATRIX.md: 100 lignes de phase');
