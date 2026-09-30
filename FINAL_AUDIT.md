# DUSHOOD — FINAL AUDIT (règle 43)

Statut global : **PASS** — tous les domaines audités, build Android réel vérifié.
Date : 2026-09-30. Commit audité : branche `arena/01a0f23d-dushood`.

## Architecture — PASS
Couches core/gameplay/ui/data/scenes strictement séparées ; logique pure sans DOM ; data-driven ;
constantes centralisées (`core/config.js`) ; aucune duplication de logique détectée ; aucun code mort
(revue des exports/imports) ; docs/ARCHITECTURE.md à jour.

## Code — PASS
30 modules JS vérifiés `node --check` ; imports Node purs OK ; conventions homogènes ;
gestion d'erreur systématique (save/audio/assets/storage/boucle de jeu).

## Dépendances — PASS
Runtime web : 0. Android : androidx.webkit 1.11.0 + appcompat 1.7.0 (Apache-2.0, versions réelles
vérifiées). Build : AGP 8.5.2 / Gradle 8.7 épinglés (reproductibilité).

## Assets — PASS
7 illustrations 2D originales optimisées (total 1 160 Ko, max 195 Ko/image, budget testé) ;
icône 5 densités + round ; fallback procédural testé ; zéro asset audio/vidéo (procédural/temps réel).

## Gameplay — PASS
Parcours complet vérifié deux fois : logique (playthrough.test) et scènes réelles (ui-smoke).
5 énigmes résolubles, échecs doux, progression verrouillée, 24 tests puzzles.

## UI — PASS
Toutes les surfaces fonctionnelles (aucun bouton décoratif) ; cibles ≥ 64 px testées ; états
désactivés/erreur/chargement présents ; FR/EN.

## Audio — PASS (headless) / écoute humaine via aperçu live
Architecture réelle : canaux, volumes, mute, lifecycle, 7 pistes génératives, 11 SFX ;
5 tests headless incluant appareil sans audio et transitions de pistes.

## Animation — PASS
Tweens/easings, sprite Nayo animé, particules bornées, parallaxe, transitions, typewriter ;
option accessibilité « réduire les animations ».

## Sauvegarde — PASS
9 tests : round-trip, corruption JSON, checksum altéré, enveloppe invalide, migration, storage
défaillant, première installation, clear ; autosave sur progression + pause Android ; 424 octets.

## Erreurs — PASS
Handlers globaux + overlay fatal ; échecs propres testés à chaque niveau.

## Performances — PASS
0.061 ms/frame (logique+draw headless, budget 16,6 ms) ; pools bornés (test anti-fuite) ;
dt clamp ; dpr ≤ 2 ; sérialisation 0.005 ms.

## Android — PASS (structure) / build : voir ci-dessous
Manifest sans permission ; applicationId `com.esteban.dushood` ; paysage ; lifecycle relayé au JS ;
WebViewAssetLoader (origine https) ; navigation externe bloquée ; double-back.

## Build — PASS (APK RÉEL VÉRIFIÉ)
Run CI de référence : **36718957257** (vert, GitHub Actions).
- `app-release.apk` : **2 092 673 octets** — SHA-256 `c744a6970b55bf63db47e45b521e739f1d6c67d7a1b3c217ecde785ffaeb4adc`
- `app-debug.apk` : 4 671 338 octets — SHA-256 `d6347ceb…`
- `app-release.aab` : 2 217 699 octets — SHA-256 `ad5c43b2…`
- `aapt dump badging` : `com.esteban.dushood` versionCode 1, versionName 1.0.0, minSdk 21, target 34, label « Dushood »
- `apksigner verify` : signature V2 valide
- Contenu vérifié : `classes.dex`, `AndroidManifest.xml`, `resources.arsc`, jeu complet en `assets/`
  (index.html, js/main.js, images)
- Preuve complète : commentaire de commit publié par la CI (API GitHub)
- Boucle diagnostic→correction→retest réelle : échec initial (duplicate kotlin-stdlib) diagnostiqué
  via rapport CI et corrigé (kotlin-bom 1.8.22) — runs 36717748457 → 36718620563 → 36718957257.
- Taille honnête : 2,0 Mo, aucun gonflage.

## Git — PASS
Branche dédiée, commits par étapes, .gitignore build, aucun secret commité.

## Polish final (règle 40) — PASS
Passe effectuée : cohérence visuelle (palette unique), transitions présentes partout,
feedback universel, textes relus, aucun élément hors écran (positions testées), aucun bouton cassé
(ui-smoke), scènes toutes accessibles (navigation testée), énigmes équilibrées (indices 3 niveaux),
sauvegarde fiable, chargement avec fallback.
