# DUSHOOD 🎮✨

> Un monde fabriqué pour toi.

**Dushood** est une aventure narrative 2D tactile : Lohen explore un monde construit par Esteban,
guidé par la luciole Nayo, résout les énigmes de cinq lieux, rassemble les fragments d'une lettre…
et découvre ce que ce monde essaie de lui dire depuis le début.

## Jouer
- **Navigateur** : servir `game/` (ex. `python3 -m http.server -d game 8000`) et ouvrir `http://localhost:8000`.
- **Android** : APK produit par le workflow *Android Build* (onglet Actions) — voir `docs/ANDROID_BUILD.md`.

## Caractéristiques
- 5 chapitres (Jardin des Lucioles, Forêt des Échos, Lac des Reflets, Ville des Lanternes, Tour des Souvenirs)
- 5 énigmes réelles (mémoire, constellation, taquin, code déduit, assemblage) + indices progressifs (Nayo)
- Inventaire, dialogues, progression verrouillée, sauvegarde automatique fiable (reprise après fermeture)
- Direction 2D illustrée, parallaxe, particules, cinématiques temps réel
- Musique générative + SFX synthétisés (WebAudio), volumes/mute persistants
- FR / EN — 100 % hors ligne — aucune publicité — aucun joystick
- Contenu secret après la fin : la galerie des souvenirs

## Développement
```bash
node --test tests/*.test.mjs     # 66 tests (logique + parcours UI headless)
cd android && gradle assembleDebug   # APK (voir docs/ANDROID_BUILD.md)
```

## Documentation
| Fichier | Rôle |
|---|---|
| `docs/GDD.md` | Game design complet |
| `docs/ARCHITECTURE.md` | Architecture technique |
| `docs/ANDROID_BUILD.md` | Build APK (CI, Termux, CLI) |
| `docs/LICENSES.md` | Licences |
| `PROJECT_STATE.md` | État de production |
| `BLOCK_REGISTER.md` | Registre des 999 blocs du cahier des charges |
| `TRACEABILITY_MATRIX.md` | Traçabilité exigences → code → tests |
| `DECISIONS.md` | Journal des décisions |

*Moteur : « Dushood Engine » — Canvas 2D + WebAudio + localStorage, zéro dépendance.
Pas de Unity, pas d'Unreal, pas de Godot.*
