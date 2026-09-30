# DUSHOOD — Build Android (CLI, Termux, CI)

## Prérequis communs
- JDK 17
- Android SDK (platform 34, build-tools récents)
- Gradle 8.7+ (ou le wrapper de votre installation)

## Option A — GitHub Actions (recommandé, build de référence)
Le workflow `.github/workflows/android-build.yml` :
1. exécute les 66 tests Node ;
2. compile `assembleDebug` + `assembleRelease` ;
3. vérifie les APK (présence AndroidManifest, classes.dex, assets du jeu ; `aapt dump badging` ;
   `apksigner verify`) ;
4. publie `dushood-debug-apk` et `dushood-release-apk` en artefacts.

Téléchargement : onglet Actions du dépôt → dernier run « Android Build » → Artifacts,
ou en CLI : `gh run download <run-id> -n dushood-release-apk`.

## Option B — Termux (sur l'appareil Android)
```bash
pkg update && pkg install openjdk-17 gradle wget unzip
# SDK Android en ligne de commande (cmdline-tools) :
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
mkdir -p ~/android-sdk/cmdline-tools && unzip commandlinetools-*.zip -d ~/android-sdk/cmdline-tools
mv ~/android-sdk/cmdline-tools/cmdline-tools ~/android-sdk/cmdline-tools/latest
export ANDROID_HOME=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0" "platform-tools"

git clone <ce dépôt> && cd Dushood-/android
gradle assembleDebug        # → app/build/outputs/apk/debug/app-debug.apk
gradle assembleRelease      # → app/build/outputs/apk/release/app-release.apk
```
Installation : `termux-open app-debug.apk` (ou transfert + installation manuelle ;
activer « sources inconnues »).

## Option C — Poste de travail
```bash
cd android && gradle assembleDebug assembleRelease
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Signature de production (optionnelle)
Le build release est signé avec la clé de debug pour rester installable sans exposer de secret
dans le dépôt (règle 39). Pour une clé de production :
```bash
keytool -genkeypair -v -keystore dushood.keystore -alias dushood -keyalg RSA -keysize 2048 -validity 10000
# puis dans android/app/build.gradle → signingConfigs { release { ... } } via variables d'environnement :
# DUSHOOD_KEYSTORE, DUSHOOD_KEYSTORE_PASS, DUSHOOD_KEY_ALIAS, DUSHOOD_KEY_PASS
```
Ne JAMAIS committer un keystore ni un mot de passe.

## Vérifications post-build (règle 34)
```bash
unzip -l app-release.apk | grep -E "AndroidManifest|classes.dex|assets/index.html"
$ANDROID_HOME/build-tools/*/aapt dump badging app-release.apk | head -3
$ANDROID_HOME/build-tools/*/apksigner verify app-release.apk
adb install -r app-release.apk && adb shell monkey -p com.esteban.dushood 1
```

## Notes techniques
- Les assets du jeu (`game/`) sont inclus via `sourceSets.main.assets.srcDirs` — pas de copie manuelle.
- La WebView charge `https://appassets.androidx.dev/assets/index.html` via `WebViewAssetLoader`
  (les modules ES ne fonctionnent pas en `file://`).
- WebView système requise : Android System WebView ≥ 61 (ES modules) — couvert par tout appareil
  Android 5+ à jour de 2018+.
