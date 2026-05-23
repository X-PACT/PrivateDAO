# PrivateDAO Android Testnet APK

Current downloadable APK:

- File: `PrivateDAO-android-testnet-debug.apk`
- Version: `1.2.0-testnet`
- Version code: `3`
- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Network: Solana Testnet
- SHA-256: `00b55e1b0db3696a6aaae4bd418affe35e7c56fea9929c121c3cf3c9b91a8869`
- Size: `16 MB`
- Build source: `apps/android-native`
- Site download URL: `https://privatedao.org/downloads/PrivateDAO-android-testnet-debug.apk`
- Public parity manifest: `https://privatedao.org/android-testnet-parity-manifest.json`
- Repository parity manifest: `artifacts/android/private-dao-android-testnet-parity-manifest.json`

This is a debug-signed Testnet build for judges and live product review. It is not a Play Store production-signed release.

The `1.2.0-testnet` build adds direct parity links for API Status, RPC Services, QuickNode stream intelligence, and GoldRush decision intelligence so the Android route exposes the same live product proof lanes as the web surface.

Run `npm run verify:android-testnet-parity` from the repository root to confirm the Android config, web constants, public manifest, repository APK, and site APK copy still point to the same Testnet program and checksum.
