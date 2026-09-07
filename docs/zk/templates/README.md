# ZK-Enforced Runtime Templates

These templates are the fastest safe way to record real `zk_enforced` runtime evidence without inventing values.

## Available Templates

- `phantom-desktop-zk-enforced.json`
- `solflare-desktop-zk-enforced.json`
- `backpack-desktop-zk-enforced.json`
- `glow-desktop-zk-enforced.json`
- `android-runtime-zk-enforced.json`

## Required Real Values

Replace:

- `walletVersion`
- `os`
- `browserOrClient`
- `proposalPublicKey`
- `policyPda`
- `enableModeTxSignature`
- `finalizeTxSignature`
- `capturedAt`

Do not change:

- `network`
- `walletLabel`
- `environmentType`
- the target `id`

Do not mark a capture as `success` unless:

- all three receipt modes are really `zk_enforced`
- `Enable ZK-Enforced` landed on Devnet
- `Finalize` landed on Devnet
- the diagnostics snapshot was actually captured

## Record Command

```bash
npm run record:zk-enforced-runtime -- /path/to/capture.json
npm run build:zk-enforced-runtime
npm run verify:zk-enforced-runtime
```
