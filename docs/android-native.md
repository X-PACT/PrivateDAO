# Android Native App

PrivateDAO now includes a first-class Android-native app under `apps/android-native/`.

This is not a hybrid wrapper and not a generic wallet demo. It is a Kotlin Android counterpart of the current PrivateDAO product and follows the same governance lifecycle and protocol assumptions already used by the Solana program, scripts, tests, and live web surface.

## Web / Mobile Integration Direction

The Android app is being developed to serve the same governance product as the web app, not a parallel mobile-only product.

That means:

- the same on-chain program ID
- the same DAO / proposal / treasury PDAs
- the same proposal phases
- the same authority semantics
- the same proof-first reviewer links
- the same explorer and monitoring continuity

The Android branch is therefore developed against web parity, not against a standalone mobile demo standard.

## Why Android-first

PrivateDAO is Android-first on mobile because Solana Mobile Wallet Adapter is the official mobile dApp path for Android wallets today. This app therefore uses:

- Kotlin native
- Jetpack Compose
- Solana Mobile Wallet Adapter
- Devnet by default

Seed Vault is intentionally not used for the dApp transaction flow. Seed Vault is the wallet-app path; PrivateDAO is implemented here as a mobile dApp.

## Path

```text
apps/android-native/
```

## What Was Ported From The Current Project

The Android app is derived from the existing repository and mirrors these repo-native truths:

- program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- devnet explorer conventions from `scripts/utils.ts`
- PDA derivations from the program/tests:
  - DAO PDA
  - Proposal PDA
  - VoteRecord PDA
  - Treasury PDA
  - Delegation PDA
- proposal/DAO account layouts from `programs/private-dao/src/lib.rs`
- proposal phase logic from the current frontend/docs product
- commit-reveal hash semantics from `sdk/src/index.ts`
- action naming from the existing program and scripts:
  - `create_proposal`
  - `commit_vote`
  - `reveal_vote`
  - `finalize_proposal`
  - `execute_proposal`

## Architecture

The Android app is intentionally separated from the current web frontend.

High-level layers:

- `config/`
  - devnet RPC
  - program ID
  - explorer links
- `model/`
  - DAO / proposal / treasury action / wallet state models
- `solana/`
  - binary helpers
  - base58
  - PDA derivation
  - account decoding
  - Anchor discriminator encoding
  - legacy transaction building
- `repository/`
  - live DAO/proposal loading
  - tx construction for current governance actions
- `wallet/`
  - Mobile Wallet Adapter integration
  - auth token persistence
- `presentation/`
  - Compose UI
  - dashboard
  - proposals
  - proposal detail action surface
  - awards
  - settings

## Android System Diagram

```text
Android user
  -> Jetpack Compose screens
     - splash
     - wallet connect
     - dashboard
     - proposal list / detail
     - create DAO / deposit / create proposal
     - commit / reveal / finalize / execute
     - awards / settings

Compose + ViewModel layer
  -> PrivateDaoViewModel
     - wallet session state
     - live DAO / proposal state
     - proposal phase decisions
     - transaction submission state
     - locally stored vote salt for reveal

Domain / repository layer
  -> PrivateDaoRepository
     - devnet RPC reads
     - DAO / proposal decoding
     - PDA derivation
     - instruction payload building
     - explorer link generation

Wallet layer
  -> MobileWalletAdapterManager
     - local association flow
     - authorize / reauthorize / deauthorize
     - signAndSendTransactions
     - auth token persistence

Solana layer
  -> live PrivateDAO program on devnet
  -> DAO PDA
  -> Proposal PDA
  -> VoteRecord PDA
  -> Treasury PDA
  -> SPL token accounts

Verification surface
  -> tx signature returned to app
  -> Solscan devnet link
  -> same lifecycle and terminology as the current web product
```

## Mobile Wallet Adapter Integration

The app uses the official Solana Mobile Wallet Adapter Android-native path:

- local association flow
- wallet availability detection
- `authorize`
- `reauthorize`
- `deauthorize`
- `signAndSendTransactions`
- persistent auth token and wallet URI base storage

This means the Android app is designed to work with compatible Android wallets such as Phantom / Solflare when exposed through the MWA flow.

## Current Native Screens

- splash / launch
- wallet connect
- home dashboard
- proposal list
- proposal detail surface
- create DAO
- deposit treasury
- create proposal
- commit vote
- reveal vote
- finalize flow
- execute flow
- awards / recognition
- settings / network info

## Real On-Chain Coverage In Android

The current Android app is wired for real devnet interaction, not mock state.

Implemented mobile transaction paths:

- create DAO
- deposit treasury
- create proposal
- commit vote
- reveal vote
- finalize proposal
- cancel proposal (authority-only)
- veto proposal during timelock (authority-only)
- execute proposal for SOL and token treasury paths

Implemented mobile read paths:

- load DAO accounts from the live devnet program
- load proposal accounts from the live devnet program
- decode proposal state and phase
- fetch recent proposal transaction signatures
- generate explorer links

## Current Surface And Expansion Path

The Android app is already strong enough to operate the core governance lifecycle on devnet. The remaining work is now focused on expanding the mobile surface until it reaches broader service parity with the web product.

Current expansion items:

- `SendToken` execution is now wired in the Android client, but it still depends on the recipient associated token account existing on-chain for the configured mint
- the Android app currently prioritizes the governance lifecycle and treasury/operator essentials; the broader browser-only proof center and judge-mode surfaces still live primarily in the web product
- release hardening for production signing is not closed yet; the verified output in this branch is a local debug APK

None of these change the protocol or on-chain behavior. They only define the current stage of the mobile delivery surface while the app is being expanded toward fuller web parity.

## Build

The branch now ships a Gradle wrapper, so the canonical entry point is:

```text
apps/android-native/gradlew
```

Open the Android app in Android Studio from:

```text
apps/android-native/
```

Typical steps:

1. Install Android Studio with Android SDK support
2. Open `apps/android-native`
3. Copy `local.properties.example` to `local.properties`
4. Point `sdk.dir` to your Android SDK in `local.properties`
5. Ensure Gradle runs under JDK 17 (`JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64` on Ubuntu-like systems)
6. Let Gradle sync dependencies
7. Run on an Android device or emulator
8. Install an MWA-compatible wallet on the target device for real wallet flows

Canonical shell build:

```text
cd apps/android-native
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64 ./gradlew assembleDebug
```

Required SDK packages for the verified local build:

- `platform-tools`
- `platforms;android-36`
- `build-tools;36.0.0`
- `build-tools;35.0.0`
- `emulator`
- `system-images;android-36;google_apis;x86_64`

Verified local output on this branch:

- command: `./gradlew assembleDebug`
- result: `BUILD SUCCESSFUL`
- artifact: `apps/android-native/app/build/outputs/apk/debug/app-debug.apk`

## Emulator / Device Runtime Path

The branch now includes explicit shell entry points for Android runtime verification:

1. Bootstrap emulator packages and the AVD:

```text
./scripts/bootstrap-android-emulator.sh
```

2. Boot the emulator:

```text
./scripts/run-android-emulator.sh
```

3. Install and launch the debug APK:

```text
./scripts/install-android-debug-apk.sh
```

Default emulator settings:

- AVD name: `PrivateDAO_API_36`
- system image: `system-images;android-36;google_apis;x86_64`
- device profile: `pixel_6`

Environment overrides are supported through:

- `ANDROID_HOME` / `ANDROID_SDK_ROOT`
- `PRIVATE_DAO_ANDROID_AVD_NAME`
- `PRIVATE_DAO_ANDROID_SYSTEM_IMAGE`
- `PRIVATE_DAO_ANDROID_DEVICE_ID`

This keeps emulator setup reproducible instead of relying on ad-hoc Android Studio state.

## Reviewer / Release Runbook

For the shortest Android-native review and release-check path, use:

- `docs/android-native-reviewer-runbook.md`

This captures:

- the verified build commands
- the emulator bootstrap path
- the in-app reviewer/runtime surfaces
- the remaining runtime limitation when Google emulator packages are still downloading

## Run / Judge Flow

Recommended review path for judges:

1. Install an Android wallet that supports Mobile Wallet Adapter
2. Launch the PrivateDAO Android app
3. Connect wallet
4. Load live proposals from devnet
5. Select a proposal
6. Run one of the lifecycle actions that matches the current phase
7. Verify the resulting signature in Solscan devnet explorer

## Relation To The Current Web Product

The web/docs surface remains the main live public frontend.

The Android-native app is:

- a mobile-native counterpart
- Android-first
- wallet-native
- protocol-faithful

It does not replace the web frontend and does not change the on-chain protocol.
