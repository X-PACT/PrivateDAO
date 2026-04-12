# Android Native Release Hardening

This note tracks the steps that move the Android branch from a reviewer-safe debug APK toward a production-ready mobile delivery surface.

## Already Closed

- launcher icon is no longer the Android default placeholder
- release signing inputs are wired in `app/build.gradle.kts`
- `release-signing.properties.example` documents the expected keystore fields
- runtime continuity links target the live `https://privatedao.org` surface
- branch-packaged debug APK remains available under `artifacts/android/`

## Signing Inputs

The release build can read signing inputs from either:

- `apps/android-native/release-signing.properties`
- or environment variables:
  - `PRIVATEDAO_RELEASE_STORE_FILE`
  - `PRIVATEDAO_RELEASE_STORE_PASSWORD`
  - `PRIVATEDAO_RELEASE_KEY_ALIAS`
  - `PRIVATEDAO_RELEASE_KEY_PASSWORD`

The example file is:

- `apps/android-native/release-signing.properties.example`

## Still Required Before A Production Claim

- final keystore generation and storage policy
- successful boot on emulator or real device for the current branch state
- wallet-connect proof for the current APK
- version bump and release notes
- production distribution decision:
  - direct APK
  - internal testing track
  - Play release track

## Recommended Next Gate

1. Complete `AVD boot + APK install`.
2. Capture one mobile runtime proof sequence.
3. Wire final signing inputs in a secure local or CI environment.
4. Produce the first signed release candidate artifact.
