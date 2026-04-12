# Android Native Reviewer Runbook

This runbook is the shortest Android-native path for reviewers, operators, and release checks on the `feat/android-native-private-dao` branch.

## Scope

This branch proves three things:

- the Android-native app compiles and packages cleanly
- the wallet lifecycle uses the current Mobile Wallet Adapter path without deprecated lifecycle gating
- reviewer and runtime surfaces stay reachable from the app itself instead of living only in external docs

## Web / Mobile Parity Standard

Review this branch as part of one product surface:

- web and Android both read the same on-chain DAO/proposal state
- web and Android both point reviewers to the same proof center and incident/monitoring docs
- Android now exposes authority-only `cancel` and `veto` flows, so mobile is no longer limited to voter-only happy paths

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

## Android Runtime Path

From the repo root:

```text
./scripts/bootstrap-android-emulator.sh
./scripts/run-android-emulator.sh
./scripts/install-android-debug-apk.sh
```

Notes:

- `bootstrap-android-emulator.sh` installs `emulator` and `system-images;android-36;google_apis;x86_64`, then creates `PrivateDAO_API_36`
- `run-android-emulator.sh` boots the emulator and waits for `sys.boot_completed=1`
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
  - timelock validation messaging
  - proof center / judge mode / live proof / monitoring / incident response links
- Settings:
  - environment and mainnet-readiness links

## External Reviewer Links

- Proof Center: `https://x-pact.github.io/PrivateDAO/?page=proof`
- Judge Mode: `https://x-pact.github.io/PrivateDAO/?page=proof&judge=1`
- Live Proof: `https://x-pact.github.io/PrivateDAO/docs/live-proof.md`
- Monitoring Alerts: `https://x-pact.github.io/PrivateDAO/docs/monitoring-alerts.md`
- Incident Response: `https://x-pact.github.io/PrivateDAO/docs/incident-response.md`
- Reviewer Fast Path: `https://x-pact.github.io/PrivateDAO/docs/reviewer-fast-path.md`
- Mainnet Readiness: `https://x-pact.github.io/PrivateDAO/docs/mainnet-readiness.md`

## Remaining Runtime Limitation

If Android emulator packages are still downloading slowly from the Google repository, that is an environment bandwidth issue, not an app blocker. The app branch remains ready to boot once:

- `emulator`
- `system-images;android-36;google_apis;x86_64`

finish installing under the configured Android SDK.
