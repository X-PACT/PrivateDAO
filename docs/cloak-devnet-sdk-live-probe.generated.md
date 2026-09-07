# Cloak Devnet SDK Live Probe

Generated: `2026-05-14T08:30:46.803Z`

This packet verifies the current PrivateDAO Cloak lane against the official Cloak devnet SDK contract without printing private material.

## Network

- Package: `@cloak.dev/sdk-devnet` (`0.1.5-devnet.1`)
- Program: `Zc1kHfp4rajSMeASFDwFFgkHRjv7dFQuLheJoQus27h`
- Relay: `https://api.devnet.cloak.ag`
- Solana RPC: `https://api.devnet.solana.com`
- Mock USDC mint: `61ro7AExqfk4dZYoCyRzTahahCC2TdUUZ4M5epMPunJf`

## Capability Matrix

| Group | Status | Reason |
| --- | --- | --- |
| Note API | not used | The current integration uses the UTXO transaction surface as the primary SDK path. Legacy note helpers are not needed for this settlement lane. |
| UTXO API | used | The probe imports transact, createUtxo, createZeroUtxo, generateUtxoKeypair, transfer, fullWithdraw, partialWithdraw, swapUtxo, and swapWithChange from @cloak.dev/sdk-devnet. |
| Scanner/compliance | available | scanTransactions, scanAllTransactions, scanTransactionsByViewingKey, and formatComplianceCsv are present. Full history scan needs a funded wallet and persisted UTXOs. |
| Viewing keys + metadata encryption | used for readiness | getNkFromUtxoPrivateKey and metadata encryption exports are present. The probe never prints viewing keys, UTXO private keys, seed material, or raw note payloads. |
| Relay/proof/Merkle helpers | used for readiness | RelayService, buildMerkleTreeFromRelay, computeProofFromChain, and readMerkleTreeState are present; relay health is checked live. |
| Utility modules | used | Fee constants, calculateFeeBigint, NATIVE_SOL_MINT, DEVNET_MOCK_USDC_MINT, and error helpers are imported and recorded for reviewer validation. |

## Export Check

| Export | Present |
| --- | --- |
| `CLOAK_PROGRAM_ID` | yes |
| `DEVNET_MOCK_USDC_MINT` | yes |
| `NATIVE_SOL_MINT` | yes |
| `MIN_DEPOSIT_LAMPORTS` | yes |
| `transact` | yes |
| `transfer` | yes |
| `partialWithdraw` | yes |
| `fullWithdraw` | yes |
| `swapUtxo` | yes |
| `swapWithChange` | yes |
| `createUtxo` | yes |
| `createZeroUtxo` | yes |
| `generateUtxoKeypair` | yes |
| `getNkFromUtxoPrivateKey` | yes |
| `RelayService` | yes |
| `buildMerkleTreeFromRelay` | yes |
| `computeProofFromChain` | yes |
| `scanTransactions` | yes |
| `formatComplianceCsv` | yes |
| `calculateFeeBigint` | yes |

## Live Results

- Cloak docs index: ok
- Cloak relay health: ok via https://api.devnet.cloak.ag/health
- Devnet program executable: yes
- Devnet slot: `462266542`
- PrivateDAO read-node intent receipt: ok
- Intent execution reference: `cloak-8ec50ad62805b94b82514786`
- Intent receipt hash: `8ec50ad62805b94b82514786cf237875cb037d2301b7f5c3a9e076b48fb035d6`
- Intent mode: `testnet-intent-receipt`
- Intent source: `cloak-read-node-receipt`
- E2E deposit probe: `funding-unavailable`
- E2E note: Solana devnet faucet rejected all temporary-wallet funding attempts during this run.
- Funding attempts: 3

## Safety Boundary

The probe never prints private keys, viewing keys, UTXO private keys, raw notes, or seed material. Public transaction signatures and public receipt references may be printed for support and verification.

To run the optional funded devnet deposit path:

```bash
PRIVATE_DAO_CLOAK_E2E=1 npm run probe:cloak-devnet-sdk
```

The default run keeps the live check to documentation, relay, program account, exported SDK contract, and PrivateDAO read-node intent receipt.
