# PrivateDAO Android Devnet Artifact

This directory holds the latest branch-packaged Android APK for the `feat/android-native-private-dao` branch.

## Current packaged APK

- file: `PrivateDAO-android-devnet-debug.apk`
- branch: `feat/android-native-private-dao`
- build type: `debug`
- target network: `devnet`
- sha256: `2785289b8899a7d55a4168b80b15edeca9664478391aca48845e474805930169`

## Real-device proof artifact

- file: `runtime/real-device-runtime-proof.png`
- device: `SM-A235F`
- captured after:
  - `adb -s R58T33JGLHN install -r PrivateDAO-android-devnet-debug.apk`
  - `adb -s R58T33JGLHN shell am start -n io.xpact.privatedao.android/.MainActivity`

Additional runtime captures:

- `runtime/post-refresh-device-state.png`
  - wallet-connected home surface with live `Disconnect`
- `runtime/create-tab-state.png`
  - `Create DAO` form prepared on the physical device
- `runtime/post-create-tap-state.png`
  - attempted lifecycle action from the physical device
- `runtime/post-clean-reinstall-state.png`
  - clean reinstall proof after rebuilding the APK with the latest wallet identity and field-readability fixes

## Intended use

This APK is the current downloadable branch artifact for:

- internal review
- reviewer walkthroughs
- device-side devnet testing
- web-to-mobile continuity demos

It should not be described as a production-signed release build.
