# PrivateDAO Android Devnet Artifact

This directory holds the latest branch-packaged Android APK for the `feat/android-native-private-dao` branch.

## Current packaged APK

- file: `PrivateDAO-android-devnet-debug.apk`
- branch: `feat/android-native-private-dao`
- build type: `debug`
- target network: `devnet`
- sha256: `32d5b07cf29b703d57537b0a6d2746a9ce34b6665fd3c90a597f0d3fd77048a4`

## Real-device proof artifact

- file: `runtime/real-device-runtime-proof.png`
- device: `SM-A235F`
- captured after:
  - `adb -s R58T33JGLHN install -r PrivateDAO-android-devnet-debug.apk`
  - `adb -s R58T33JGLHN shell am start -n io.xpact.privatedao.android/.MainActivity`

## Intended use

This APK is the current downloadable branch artifact for:

- internal review
- reviewer walkthroughs
- device-side devnet testing
- web-to-mobile continuity demos

It should not be described as a production-signed release build.
