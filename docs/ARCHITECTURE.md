# DUSHOOD — Architecture technique
*Couvre les phases 34–37, 40–43, 54–55, 66–74, 91–93 du cahier des charges.*

## Vue d'ensemble
```
game/                         ← jeu web complet (embarqué tel quel dans l'APK)
  index.html                  ← hôte : canvas plein écran + overlay d'erreur fatale
  css/style.css
  js/
    core/                     ← moteur réutilisable, sans logique de jeu
      config.js               ← toutes les constantes (résolution, clés, chapitres)
      engine.js               ← boucle, letterbox responsive, SceneManager + transitions
      input.js                ← tap / drag / zones tactiles (PAS de joystick)
      assets.js               ← chargeur d'images avec progression + fallback
      audio.js                ← WebAudio : musique générative + SFX synthétisés
      save.js                 ← sauvegarde versionnée + checksum + storage injectable
      i18n.js                 ← localisation FR/EN avec fallback
      tween.js  particles.js  parallax.js  log.js
    gameplay/                 ← logique PURE (testable sous Node, zéro DOM)
      state.js                ← état du monde sérialisable
      hints.js                ← indices progressifs
      puzzlefactory.js        ← instanciation + restauration des puzzles
      puzzles/{sequence,constellation,sliding,code,jigsaw}.js
    ui/                       ← composants (widgets, dialogue, hud)
    data/                     ← contenu (scènes, dialogues, textes, lettre, indices)
    scenes/                   ← scènes (boot, menu, intro, map, exploration,
                                puzzleviews, letter, epilogue, gallery)
  assets/img/                 ← 7 illustrations 2D optimisées
tests/                        ← 66 tests node:test (logique + intégration UI headless)
android/                      ← projet Gradle (WebView + WebViewAssetLoader)
.github/workflows/            ← CI : tests + build APK debug/release + vérification
tools/                        ← scripts internes (registre des blocs…)
docs/                         ← GDD, architecture, build, art source
```

## Principes
1. **Séparation logique/rendu** : chaque puzzle existe en deux couches — classe logique pure
   (`gameplay/puzzles/*`, sérialisable, testée) et vue Canvas (`scenes/puzzleviews.js`).
   Idem pour l'état (`state.js`) vs les scènes.
2. **Data-driven** : chapitres, hotspots, objets, dialogues, indices et textes sont des données
   (`data/*`), pas du code. Ajouter un lieu = ajouter une entrée + une image.
3. **Zéro dépendance runtime** : moteur 100 % maison (Canvas 2D + WebAudio + localStorage).
   Côté Android : 2 dépendances AndroidX seulement (webkit, appcompat — Apache-2.0).
4. **Échec propre partout** : image absente → fond procédural ; WebAudio absent → jeu silencieux
   mais jouable ; storage inaccessible → fallback mémoire ; sauvegarde corrompue → nouvelle partie ;
   erreur JS fatale → overlay explicite (progression déjà autosauvée).
5. **Testabilité** : les modules purs s'importent sous Node ; les scènes s'exécutent sous Node via
   le harnais headless (`tests/helpers/dom-stub.mjs`) qui stubbe Canvas/DOM.

## Flux de données
```
input (tap/drag) → Scene → logique (state/puzzles) → persist() → SaveSystem → localStorage
                                    ↓
                            AudioManager (feedback)
                                    ↓
                            draw(ctx) chaque frame
```

## Sauvegarde (phase 32)
Enveloppe JSON `{v, c, d, t}` : version, checksum djb2, données, timestamp.
Autosave : à chaque progression (objet, drapeau, puzzle, fragment, chapitre) + `visibilitychange`
+ `pagehide` (couvre la mise en pause / fermeture Android). Migration par version prévue (`migrate()`).

## Android (phases 44–46)
- `applicationId com.esteban.dushood`, minSdk 21, targetSdk 34, versionName 1.0.0.
- WebView unique ; assets servis par `WebViewAssetLoader` sous `https://appassets.androidx.dev/`
  (origine sécurisée → modules ES + localStorage fonctionnels ; `file://` interdit).
- Aucune permission (jeu hors ligne). `allowFileAccess=false`. Navigation externe bloquée.
- Lifecycle : `onPause/onResume` → WebView → `visibilitychange` JS → suspension audio + autosave.
- Release : R8 minify + shrinkResources, signé debug pour installation directe
  (procédure de signature production : `docs/ANDROID_BUILD.md`).

## Performance (phases 45, 51–53)
Canvas unique 2D, pool de particules borné (200–300), dt plafonné à 100 ms, images 1280×720 JPEG q78
(~170 Ko chacune), musique générée (0 octet d'asset audio), pas d'allocation par frame significative
(pools, réutilisation), `devicePixelRatio` plafonné à 2.

## Logging & debug (phases 69–70)
`core/log.js` : buffer circulaire 300 lignes + console, handlers globaux d'erreurs.
`window.__dushood` : accès à l'état pour QA manuelle. Outils internes dans `tools/`.
