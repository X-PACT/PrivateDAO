# Android Native Reviewer Runbook

This runbook is the shortest Android-native path for reviewers, operators, and release checks on the `feat/android-native-private-dao` branch.

## Scope

This branch proves three things:

- the Android-native app compiles and packages cleanly
- the wallet lifecycle uses the current Mobile Wallet Adapter path without deprecated lifecycle gating
- reviewer and runtime surfaces stay reachable from the app itself instead of living only in external docs
- release packaging is moving toward a production-ready path with dedicated launcher icons and explicit signing inputs

## Web / Mobile Parity Standard

Review this branch as part of one product surface:

- web and Android both read the same on-chain DAO/proposal state
- web and Android both point reviewers to the same proof center and incident/monitoring docs
- Android now exposes authority-only `cancel` and `veto` flows, so mobile is no longer limited to voter-only happy paths

The intended product direction is clear: the Android app is being developed as a mobile-operable counterpart to the web app, with the same governance lifecycle, the same authority model, and progressively deeper access to the same service corridors.

## Verified Build Commands

From `apps/android-native/`:

```text
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew :app:compileDebugKotlin
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew assembleDebug
```

Expected artifact:

```text
apps/android-native/app/build/outputs/apk/debug/app-debug.apk
```

Packaged branch download:

```text
artifacts/android/PrivateDAO-android-devnet-debug.apk
```

Direct URL:

```text
https://github.com/X-PACT/PrivateDAO/raw/feat/android-native-private-dao/artifacts/android/PrivateDAO-android-devnet-debug.apk
```

## Android Runtime Path

From the repo root:

```text
./scripts/bootstrap-android-emulator.sh
./scripts/run-android-emulator.sh
./scripts/install-android-debug-apk.sh
```

Notes:

- `bootstrap-android-emulator.sh` installs `emulator` and `system-images;android-36;google_apis;x86_64`, then creates `PrivateDAO_API_36`
- `bootstrap-android-emulator.sh` now also respects `ANDROID_AVD_HOME` and pins a smaller data partition for tighter hosts
- `run-android-emulator.sh` now prefers a headless cold-boot path (`-no-window`, `-no-boot-anim`, `-no-snapshot`, `-wipe-data`) for CI-style verification on constrained Linux hosts
- `install-android-debug-apk.sh` installs and launches the debug build through `adb`

## Reviewer Surfaces Inside The App

The Android UI now exposes reviewer-operable links and validation gates in-app:

- Home:
  - reviewer/runtime ops links
  - latest submission proof card
- Create:
  - validation gates before treasury/proposal submission
  - proof, monitoring, reviewer docs continuity
- Proposal detail:
  - proposal explorer
  - DAO authority
  - execution delay
  - execution packet and runtime continuity cards
  - timelock validation messaging
  - proof center / judge mode / live proof / monitoring / incident response links
- Settings:
  - environment and mainnet-readiness links

## External Reviewer Links

- Proof Center: `https://privatedao.org/proof`
- Judge Mode: `https://privatedao.org/proof?judge=1`
- Live Proof: `https://privatedao.org/documents/live-proof-v3`
- Monitoring Alerts: `https://privatedao.org/documents/monitoring-alert-rules`
- Incident Response: `https://privatedao.org/documents/incident-response`
- Reviewer Fast Path: `https://privatedao.org/documents/reviewer-fast-path`
- Mainnet Readiness: `https://privatedao.org/documents/mainnet-readiness`
- Android Surface: `https://privatedao.org/android`

## Runtime Status

Current verified runtime state on this branch:

- `system-images;android-36;google_apis;x86_64` is installed
- the AVD can now be created under `/data` on hosts where `/` is too small
- the emulator reaches `adb device` on the repaired headless cold-boot path
- `adb shell getprop sys.boot_completed` now returns `1`
- the emulator package service is unstable on this host and can flip between `Service package: found` and `Service package: not found`

Current remaining runtime gate:

- the emulator still breaks inside PackageInstaller during `adb install`, so install proof on this host remains blocked by package-service instability rather than by build/bootstrap state
