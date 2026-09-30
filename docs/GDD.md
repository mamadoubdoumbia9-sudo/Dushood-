# DUSHOOD — Game Design Document
*Couvre les phases 01–20, 57–68, 75 du cahier des charges (blocs 001–200, 561–680, 741–750).*

## 1. Vision et concept (phase 01, blocs 001–010)
- **Vision créative (001)** : un monde entier construit comme une déclaration. Chaque lieu, chaque énigme,
  chaque lueur de Dushood est un geste d'Esteban envers Lohen. Le jeu EST la lettre.
- **Promesse joueur (002)** : « Explore un monde fabriqué pour toi, résous ses énigmes, et découvre
  ce qu'il essaie de te dire depuis le début. »
- **Objectif émotionnel (003)** : curiosité → émerveillement → tendresse → révélation (« Je t'aime ❤️ »).
  La courbe émotionnelle monte à chaque fragment de lettre retrouvé.
- **Genre principal (004)** : aventure narrative point-and-click 2D.
- **Sous-genres (005)** : puzzle game contemplatif, jeu-cadeau (gift game), escape doux.
- **Plateforme cible (006)** : Android 5.0+ (minSdk 21), tactile, paysage. Jouable aussi en navigateur.
- **Profil de joueur (007)** : Lohen — un seul joueur destinataire ; aucune connaissance du jeu vidéo requise ;
  contrôles = tap et drag uniquement ; aucune pression de temps, aucune mort, échecs toujours doux.
- **Durée cible (008)** : 30–60 minutes pour le parcours complet ; rejouable via la galerie des souvenirs.
- **Boucle de gameplay (009)** : Explorer une scène → toucher ce qui brille → obtenir objets/indices →
  ouvrir le mécanisme du lieu → résoudre l'énigme → recevoir un fragment de lettre → lieu suivant.
- **Critères de réussite (010)** : parcours complet sans blocage ; lettre finale lisible avec les phrases
  exactes ; sauvegarde/reprise fiable ; APK réel installable. Vérifiés par les tests (tests/) et l'audit.

## 2. Identité (phase 02, blocs 011–020)
- **Nom (011)** : DUSHOOD — le nom du monde qu'Esteban a construit. Prononcé « dou-choud », il n'existe
  dans aucune langue : c'est un mot inventé pour un endroit qui n'existe que pour Lohen.
- **Logo/écran-titre (012, 015)** : typographie serif dorée lumineuse sur ciel nocturne, halo de lucioles.
- **Icône (013)** : luciole dorée (Nayo) dont la trajectoire dessine un cœur discret — `docs/art/icon_source.png`,
  déclinée en mipmaps Android (mdpi→xxxhdpi).
- **Slogan (014)** : « Un monde fabriqué pour toi » (clé i18n `app.subtitle`).
- **Signature visuelle (016)** : lucioles dorées omniprésentes, halos chauds sur nuit bleue-violette.
- **Signature sonore (017)** : arpèges pentatoniques doux, cloche « firefly » aiguë ; motif ascendant
  4 notes (do–mi–sol–do) sur chaque réussite.
- **Motifs récurrents (018)** : lumière qui guide, fragments qui se rassemblent, initiales E + L, cœurs.
- **Palette symbolique (019)** : nuit (#05060f, mystère) / or (#ffd76e, présence d'Esteban) /
  rose (#ff7eb3, sentiment) / parchemin (#f7ecd4, la lettre).
- **Règles d'identité (020)** : la lettre reste en français dans toutes les langues ; aucune publicité ;
  aucune interruption de la scène finale ; le ton reste tendre, jamais ironique.

## 3. Principes non négociables (phase 03, blocs 021–030)
2D illustré uniquement ; aucun joystick virtuel permanent ; aucun personnage 3D géométrique ;
pas de Unity/Unreal/Godot ; la lettre contient exactement « Je t'aime ❤️ » et
« J'espère que tu as apprécié mon cadeau. » ; jeu hors ligne ; aucune monétisation ; échec toujours doux ;
progression sauvegardée ; le jeu doit rester finissable sans aide externe (indices intégrés).
→ Vérifiés dans `tests/letter.test.mjs`, `COMPLIANCE_AUDIT.md`.

## 4. Expérience de Lohen (phase 04, blocs 031–040)
Lohen est le joueur : vue à la première personne (pas d'avatar à l'écran — c'est SON regard).
Il est accueilli par son prénom dès l'intro. Le monde le reconnaît (banc E + L, indices sur LOHEN,
carnet « Pour L. »). Rythme contemplatif, zéro pression, indices progressifs via Nayo.
Le retour Android quitte proprement (double appui, progression sauvée automatiquement).

## 5. Rôle d'Esteban (phase 05, blocs 041–050)
Esteban n'apparaît jamais à l'écran : il est présent PAR le monde (traces, inscriptions, objets laissés,
carnet, lanternes-messages). Cette absence rend la lettre finale plus forte : c'est la première fois
qu'il « parle » directement. Sa signature clôt la lettre.

## 6. Structure narrative (phase 06, blocs 051–060)
Actes : I. Éveil (intro + jardin/tutoriel) — II. Voyage (forêt, lac, ville : montée des souvenirs) —
III. Révélation (tour, lettre) — Épilogue (aube, envol des lucioles, galerie débloquée).
Chaque chapitre livre un fragment de lettre (5 au total) ; le fragment est le fil rouge narratif et mécanique.

## 7. Chronologie et lore (phase 07, blocs 061–070)
Dushood a été « construit » par Esteban comme on écrit une lettre : le jardin = le début (banc E+L),
la forêt = les silences partagés, le lac = la mémoire des reflets (le sourire de Lohen),
la ville = les messages jamais envoyés (lanternes), la tour = l'endroit où il a déposé ce qu'il avait
de plus fragile. Chiffres du code : 7 (jour de la rencontre), 2 (deux cafés), 5 (lettres de LOHEN),
9 (septembre, premier message). Nayo est la dernière luciole qu'Esteban a apprivoisée, chargée de guider Lohen.

## 8. Personnage du joueur (phase 08, blocs 071–080)
Première personne tactile : le doigt de Lohen EST l'interaction. Aucun déplacement d'avatar → aucun
joystick nécessaire (conformité bloc 022). Feedback systématique au toucher (étincelles + son).

## 9. Personnages secondaires (phase 09, blocs 081–090)
**Nayo** (luciole-esprit, sprite procédural animé : halo, ailes battantes, lueur pulsante) : guide,
voix des indices, présence émotionnelle. **Le monde** lui-même parle (voix « world » en italique).
**Esteban** : présent en creux, voix finale par la lettre.

## 10. Dialogues (phase 10, blocs 091–100)
Système réel : `ui/dialogue.js` (machine à écrire, tap = compléter puis avancer, file de répliques,
callback de fin), données dans `data/dialogues.js` (FR/EN, locuteur typé). 23 dialogues, tous testés
(existence, langues, locuteurs — `tests/data.test.mjs`).

## 11–13. Monde, level design, exploration (phases 11–13, blocs 101–130)
Carte de Dushood (`scenes/map.js`) : 5 lieux reliés par un chemin, verrouillage séquentiel réel,
médaillons animés (cadenas / Nayo / coche). Chaque lieu (`data/scenes-data.js`) : décor illustré,
2 à 5 hotspots contextuels (zones ≥ 64 px, testé), 1 mécanisme verrouillé, 1 énigme.
Structure d'un chapitre : entrée (dialogue) → fouille (objets/indices) → déverrouillage → énigme → fragment.

## 14–15. Énigmes (phases 14–15, blocs 131–150)
| # | Lieu | Énigme | Mécanique | Compétence |
|---|------|--------|-----------|-----------|
| 1 | Jardin | La ronde des lucioles | séquence à mémoriser, 3 manches croissantes | mémoire |
| 2 | Forêt | La constellation des échos | relier 6 étoiles dans l'ordre (tap/drag) | observation |
| 3 | Lac | Le reflet brisé | taquin 3×3 image (mélange toujours résoluble) | logique spatiale |
| 4 | Ville | Le code des lanternes | code 4 chiffres déduit de 4 indices narratifs | déduction |
| 5 | Tour | La lettre recomposée | 5 fragments à glisser-déposer (aimantation) | assemblage |
Logique pure séparée du rendu (`gameplay/puzzles/*` vs `scenes/puzzleviews.js`), état sérialisé,
échec doux partout (reset de manche/tracé, feedback du nombre de chiffres corrects).

## 16. Indices (phase 16, blocs 151–160)
`gameplay/hints.js` : 3 niveaux progressifs par énigme ET par phase d'exploration (10 jeux d'indices,
FR/EN), cooldown 20 s, persistance des indices consommés, relecture gratuite des indices débloqués.
Délivrés par Nayo en dialogue. Testé (`tests/hints.test.mjs`).

## 17–18. Progression et inventaire (phases 17–18, blocs 161–180)
`gameplay/state.js` : chapitres débloqués/terminés, fragments, drapeaux narratifs, dialogues vus,
pourcentage de progression (7 jalons). Inventaire réel : 4 objets (clé de lanterne, flûte, pierre de lune,
clé de la Tour), ramassage → usage → consommation, panneau Sac dans le HUD avec noms et descriptions.

## 19–20. Tactile, navigation, caméra (phases 19–20, blocs 181–200)
`core/input.js` : tap / drag (seuil 12 px) / zones contextuelles, hit-test cercle+rect, extension
automatique des cibles à 64 px. AUCUN joystick. Caméra fixe par scène + parallaxe douce réagissant
au pointeur (`core/parallax.js`) ; letterbox responsive 1280×720 sur tout ratio d'écran.

## 21–27. Direction artistique et médias (phases 21–27, blocs 201–270)
7 illustrations 2D peintes originales (title, 5 lieux, épilogue — 1280×720 JPEG optimisés, ~1,2 Mo total),
personnage 2D procédural animé (Nayo), particules (lucioles, étincelles, pétales, cœurs), parallaxe,
transitions fondu, cinématiques temps réel (intro, épilogue). Décision : pas de fichiers vidéo —
les cinématiques sont jouées par le moteur (D-011). Fallback procédural si image absente (robustesse).

## 28–29. Audio (phases 28–29, blocs 271–290)
Musique générative par lieu (gammes/tempos distincts : jardin majeur doux, forêt mineur mystérieux,
lac suspendu, ville chaleureuse, tour grave, lettre lumineuse) + 11 SFX synthétisés (tap, hotspot,
ramassage, réussite, erreur, carillon, luciole, page, porte, fragment, cœur). Canaux musique/SFX,
volumes réglables, mute, persistance, suspension automatique en arrière-plan Android.

## 30–31. Interface et UX (phases 30–31, blocs 291–310)
Menu (Nouvelle partie/Continuer/Souvenirs/Paramètres/Crédits), confirmation d'écrasement de sauvegarde,
paramètres (2 sliders, mute, langue FR/EN, reset), HUD (menu, sac avec badge, indice, compteur de
fragments-cœurs), toasts, états désactivés visibles, cibles ≥ 64 px, contrastes élevés,
texte complétable d'un tap, aucune pression temporelle, écran d'erreur fatal propre.

## 57–68. Polish, émotion, fins (phases 57–68)
Lettre finale : parchemin, machine à écrire, « Je t'aime ❤️ » en rose et corps agrandi, burst de cœurs
au moment exact, musique dédiée, aucune interruption. Épilogue : aube, envol de lucioles, « FIN ».
Contenu secret : galerie des souvenirs (relecture des 5 fragments par lieu). Tutoriel intégré au jardin
(Nayo guide les 2 premières interactions). Équilibrage : énigmes courtes, indices à 3 niveaux,
échecs non punitifs.

## Références croisées
- Architecture technique : `docs/ARCHITECTURE.md`
- Build Android : `docs/ANDROID_BUILD.md`
- Décisions : `DECISIONS.md` — Traçabilité : `TRACEABILITY_MATRIX.md`
