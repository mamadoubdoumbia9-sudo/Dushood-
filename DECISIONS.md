# DUSHOOD — JOURNAL DES DÉCISIONS

## D-001 — Nombre réel de blocs : 999 (et non 500)
**Contradiction détectée** : le titre du PDF (« Cahier des charges V2 — 500 blocs ») annonce 500 blocs,
mais le document contient réellement **999 blocs** (100 phases × 10 blocs, la phase 100 en contenant 9 : blocs 991–999).
**Blocs concernés** : tous.
**Résolution** : aucune exigence n'est supprimée. Le registre (`BLOCK_REGISTER.md`) couvre la **totalité des 999 blocs**
du PDF, ce qui satisfait a fortiori l'objectif « 500/500 blocs validés ». L'objectif final devient **999/999 VERIFIED**.
**Statut** : appliqué.

## D-002 — Choix technologique du moteur
**Contrainte** : interdiction Unity / Unreal / Godot ; build Android CLI compatible Termux ; 2D ; tactile ; exécutable
dans l'environnement Arena Agent Mode (sandbox Linux, Node 22 disponible, `dl.google.com` et `services.gradle.org`
inaccessibles localement, GitHub accessible).
**Options évaluées** :
| Option | Verdict |
|---|---|
| libGDX (Java) | Rejeté : build local impossible sans SDK Android ; itération lente ; pas de préview live. |
| LÖVE (Lua) | Rejeté : packaging APK (love-android) exige SDK Android + NDK ; chaîne complexe sous Termux. |
| Flutter/Flame | Rejeté : SDK Flutter + SDK Android indisponibles dans le sandbox ; lourd sous Termux. |
| React Native | Rejeté : pas un moteur de jeu 2D ; dépendances lourdes. |
| Phaser 3 (MIT) | Écarté : viable mais dépendance ~1,2 Mo non nécessaire ; contrôle moindre sur la taille APK et la testabilité Node pure. |
| **HTML5 Canvas 2D + moteur custom JS (« Dushood Engine ») + wrapper WebView Android (Gradle)** | **Retenu.** |
**Justification** : 0 dépendance runtime ; logique de jeu en modules JS purs testables sous Node (node:test) ;
rendu Canvas 2D (sprites, parallaxe, particules, transitions) ; WebAudio pour l'audio réel ; localStorage pour la
sauvegarde ; APK final = projet Gradle standard minimal (1 activité WebView), compilable en CLI (GitHub Actions,
Android Studio, ou Termux via openjdk-17 + android-sdk CLI — procédure documentée dans `docs/ANDROID_BUILD.md`).
Taille APK minimale, performances maîtrisées, aucun joystick, direction 2D respectée.
**Statut** : appliqué.

## D-003 — Stratégie de build APK
**Contrainte sandbox** : `dl.google.com` (SDK Android) et `services.gradle.org` (distributions Gradle) sont bloqués
dans le sandbox → build local direct impossible ici.
**Résolution** (aucune exigence supprimée) :
1. Le dépôt contient un **projet Gradle Android complet et standard** (`android/`), compilable en CLI partout où le
   SDK est disponible (Termux inclus — voir `docs/ANDROID_BUILD.md`).
2. Un **workflow GitHub Actions** (`.github/workflows/android-build.yml`) effectue le **build réel de l'APK**
   (debug + release signé) sur les runners GitHub (SDK préinstallé) ; l'APK est vérifié (structure zip, manifest,
   taille non nulle) puis publié en artefact téléchargeable.
3. Le build est déclenché et son résultat vérifié via `gh` depuis le sandbox — preuve de build réelle, pas simulée.
**Statut** : appliqué.

## D-004 — Design du jeu (résumé, détail dans docs/GDD.md)
Point-and-click / exploration tactile 2D illustrée, orientation paysage. Lohen traverse 5 chapitres
(Jardin des Lucioles → Forêt des Échos → Lac des Reflets → Ville des Lanternes → Tour des Souvenirs),
guidé par **Nayo**, une luciole-esprit laissée par Esteban. Chaque chapitre contient exploration, interactions,
objets d'inventaire, un ou plusieurs puzzles réels, et livre un **fragment de la lettre**. La Tour assemble les
fragments (puzzle final) et révèle la **lettre d'Esteban** contenant exactement « Je t'aime ❤️ » et
« J'espère que tu as apprécié mon cadeau. », suivie d'un épilogue. Contenu secret : galerie des souvenirs
débloquée après la fin. Contrôles : tap, drag, zones tactiles contextuelles — **aucun joystick**.
**Statut** : appliqué.

## D-005 — Audio procédural WebAudio
Musiques d'ambiance génératives (pads, arpèges par gamme pentatonique propre à chaque chapitre) et SFX synthétisés
en WebAudio : zéro asset audio externe → zéro problème de licence, taille APK minimale, architecture audio réelle
(canaux musique/SFX, volumes, mute, persistance des réglages, gestion du lifecycle Android via visibilitychange/pause).
**Statut** : appliqué.

## D-006 — Assets visuels
Illustrations 2D générées spécifiquement pour Dushood (fonds de scène, écran titre, icône) — identité visuelle
propre, aucune licence tierce. Sprites dynamiques (lucioles, particules, UI) dessinés par code Canvas.
Aucun personnage 3D géométrique. **Statut** : appliqué.

## D-007 — Sauvegarde
localStorage (WebView Android l'active via `domStorageEnabled`) avec enveloppe versionnée + checksum,
récupération sur données corrompues, migration de version, autosave sur chaque progression + save à la mise en
pause Android. Testé sous Node avec un mock localStorage. **Statut** : appliqué.

## D-008 — Localisation
Français langue principale (le cadeau est en français : textes narratifs, lettre). Architecture i18n réelle
(dictionnaires `fr`/`en`, clé → chaîne, fallback) pour satisfaire la phase 84 sans dénaturer la lettre,
qui reste en français dans toutes les langues (exigence identité, blocs 581–590). **Statut** : appliqué.

## D-009 — Monétisation
Phase 56 « Monétisation — règle par défaut » : **aucune monétisation** (pas de pub, pas d'achat, pas de paywall,
pas d'interruption commerciale — c'est un cadeau). Aucune permission réseau superflue. **Statut** : appliqué.

## D-010 — Réseau
Phase 55 « Réseau optionnel » + phase 98 « Expérience hors ligne » : le jeu est **100 % hors ligne**.
Aucune fonctionnalité ne dépend d'un serveur. Permission `INTERNET` non requise par le gameplay.
**Statut** : appliqué.

## D-011 — Pas de fichiers vidéo
Phase 43 « Pipeline vidéo » et blocs associés (479, 487, 508, 937) : **aucune vidéo embarquée**.
Les cinématiques (intro, épilogue) sont rendues en temps réel par le moteur 2D (dialogues, particules,
dégradés animés) : plus légères (0 octet vidéo), plus fiables (pas de codec), skippables, localisées.
L'exigence « pipeline vidéo » est résolue par cette décision documentée — pas supprimée silencieusement.
**Statut** : appliqué.

## D-012 — Signature release avec la clé de debug
Le build release est minifié (R8) et signé avec la clé de debug afin de produire un APK **installable**
sans committer de keystore ni de secret (règle 39). La procédure de signature de production
(keystore + variables d'environnement) est documentée dans `docs/ANDROID_BUILD.md`.
**Statut** : appliqué.

## D-013 — Joueur en première personne
Lohen n'a pas d'avatar à l'écran : le jeu est vu par ses yeux, le doigt est son geste. Décision de
design (GDD §8) qui renforce l'adresse personnelle du cadeau ET garantit l'absence de tout
personnage-placeholder. Nayo, seule figure animée, est un sprite 2D procédural.
**Statut** : appliqué.

