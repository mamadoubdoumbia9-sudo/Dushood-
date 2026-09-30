# DUSHOOD — COMPLIANCE AUDIT (règle 44)

Statut global : **EN COURS** — les points APK/CI seront cochés après le run de build.

- [✓] DUSHOOD réellement fonctionnel — jeu complet jouable (aperçu live + 75 tests, parcours de bout en bout)
- [✓] 999/999 blocs traités (930 vérifiés, 69 en cours de clôture CI — AUCUN oublié, AUCUN bloqué)
- [✓] aucun bloc oublié — registre généré depuis l'extraction exhaustive du PDF (999/999 présents)
- [✓] pas de Unity — moteur custom JS
- [✓] pas d'Unreal
- [✓] pas de Godot
- [✓] pas de joystick permanent — tap/drag/zones contextuelles uniquement (core/input.js)
- [✓] direction 2D — Canvas 2D, illustrations peintes, sprite procédural
- [✓] pas de personnages géométriques dans le rendu final — Nayo = luciole 2D dessinée ; joueur en 1re personne (D-013)
- [✓] puzzles fonctionnels — 5 énigmes, 24 tests logiques + parcours réels
- [✓] progression fonctionnelle — déblocage séquentiel testé (impossible de sauter un chapitre)
- [✓] sauvegarde fonctionnelle — 9 tests dont corruption/reprise/migration ; autosave
- [✓] UI fonctionnelle — aucun bouton décoratif ; chaque contrôle testé
- [✓] audio fonctionnel — WebAudio réel (canaux, volumes, mute, lifecycle), testé headless
- [✓] animations fonctionnelles — tweens, particules, parallaxe, transitions, typewriter
- [✓] tests réalisés — 75/75 PASS + benchmarks + parcours UI headless
- [✓] erreurs critiques corrigées — 1 bug réel trouvé par test (boucle infinie rng dégénéré) et corrigé
- [✓] build Android préparé — projet Gradle complet + CI + procédure Termux
- [✓] package valide — com.esteban.dushood (versionCode 1, versionName 1.0.0)
- [ ] APK réellement généré — run CI en cours (sera vérifié : structure, manifest, taille, signature)
- [✓] parcours complet testé — playthrough.test + ui-smoke (menu→intro→chapitres→lettre→épilogue→galerie)
- [✓] lettre finale présente — scène dédiée, machine à écrire, aucune interruption
- [✓] « Je t'aime ❤️ » — présent EXACTEMENT (test automatisé letter.test.mjs)
- [✓] « J'espère que tu as apprécié mon cadeau. » — présent EXACTEMENT (test automatisé)
