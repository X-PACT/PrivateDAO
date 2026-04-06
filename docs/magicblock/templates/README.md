# MagicBlock Runtime Templates

These templates are the fastest safe way to record real MagicBlock corridor runtime evidence without inventing values.

## Available Templates

- `phantom-desktop-magicblock.json`
- `solflare-desktop-magicblock.json`
- `backpack-desktop-magicblock.json`
- `glow-desktop-magicblock.json`
- `android-runtime-magicblock.json`

## Required Real Values

Replace:

- `walletVersion`
- `os`
- `browserOrClient`
- `proposalPublicKey`
- `corridorPda`
- `settlementWallet`
- `validator`
- `transferQueue`
- `depositTxSignature`
- `transferTxSignature`
- `withdrawTxSignature`
- `settleTxSignature`
- `executeTxSignature`
- `capturedAt`

Do not change:

- `network`
- `walletLabel`
- `environmentType`
- the target `id`

Do not mark a capture as `success` unless:

- the private transfer really landed on Devnet
- the corridor was really settled on-chain
- the execution path really succeeded through the MagicBlock-bound payout path
- the diagnostics snapshot was actually captured

## Record Command

```bash
npm run record:magicblock-runtime -- /path/to/capture.json
npm run build:magicblock-runtime
npm run verify:magicblock-runtime
```
