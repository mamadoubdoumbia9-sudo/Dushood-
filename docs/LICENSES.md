# DUSHOOD — Licences et propriété (phase 87)

## Contenu original (créé pour ce projet)
- Code source (moteur, gameplay, UI, Android) : original, écrit pour Dushood.
- Textes, dialogues, lettre, univers, noms : originaux.
- 7 illustrations (`game/assets/img/*.jpg`) et icône (`docs/art/icon_source.png`) :
  générées spécifiquement pour ce projet, sans ayant droit tiers.
- Musique et effets sonores : synthétisés en temps réel par le code (WebAudio) — aucun
  échantillon tiers, aucun fichier audio embarqué.

## Dépendances (build Android uniquement)
| Dépendance | Version | Licence | Usage |
|---|---|---|---|
| androidx.webkit:webkit | 1.11.0 | Apache-2.0 | WebViewAssetLoader (service des assets en https) |
| androidx.appcompat:appcompat | 1.7.0 | Apache-2.0 | AppCompatActivity / OnBackPressedCallback |
| Android Gradle Plugin | 8.5.2 | Apache-2.0 | outil de build (non embarqué) |
| Gradle | 8.7 | Apache-2.0 | outil de build (non embarqué) |

Le jeu web (`game/`) n'a **aucune** dépendance : ni framework, ni bibliothèque, ni police externe
(polices système Georgia/serif).

## Polices
Aucune police embarquée : pile `Georgia, serif` du système (aucune licence requise).
