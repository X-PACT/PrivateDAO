# Umbra Devnet SDK Live Probe

Generated: `2026-08-27T20:35:25.163Z`

This packet verifies the PrivateDAO Umbra lane against the installed `@umbra-privacy/sdk`, the public devnet relayer, and the live PrivateDAO read-node intent endpoint without printing secret material.

## Network

- Package: `@umbra-privacy/sdk` (`5.0.0-rc.6`)
- Devnet relayer: `https://relayer.api-devnet.umbraprivacy.com`
- Devnet indexer: `https://utxo-indexer.api-devnet.umbraprivacy.com`

## Capability Matrix

| Group | Status | Reason |
| --- | --- | --- |
| Client setup | used for readiness | getUmbraClient is checked as the browser/client entrypoint; live wallet prompts are intentionally not triggered by this probe. |
| Registration | available | The rc.6 getUserRegistrationProver export is checked; wallet registration remains an explicit browser-signing step. |
| Encrypted balances | available | The rc.6 client exposes encrypted-balance provers; wallet signing is not triggered by this read-only probe. |
| UTXO mixer | available | The rc.6 client exposes claim provers, UTXO fetchers, and Groth16 helpers; real claims require ZK proof data and UTXO slot data. |
| Relayer | used | The devnet relayer health, address, supported mints, and claim lifecycle are fetched live. |
| Compliance | available | The rc.6 client exposes the compliance primitives available in this release without deriving or printing private key material. |

## Export Check

| Export | Present |
| --- | --- |
| `getUmbraClient` | yes |
| `getUmbraRelayer` | yes |
| `getUserRegistrationProver` | yes |
| `getCreateStealthPoolNoteFromNetworkBalanceWithEncryptedAddressProver` | yes |
| `getETAIntoStealthPoolNoteCreatorProver` | yes |
| `getATAIntoStealthPoolNoteCreatorProver` | yes |
| `getClaimReceiverClaimableUtxoIntoEncryptedBalanceProver` | yes |
| `getClaimSelfClaimableUtxoIntoEncryptedBalanceProver` | yes |
| `getClaimSelfClaimableUtxoIntoPublicBalanceProver` | yes |
| `getUtxoDataFetcher` | yes |
| `proveGroth16` | yes |
| `getUmbraRelayer` | yes |
| `pollClaimUntilTerminal` | yes |

## Live Results

- Umbra docs index: ok
- Devnet relayer health: ok
- Relayer address: `3kbpT5EmRBjDZG5XcTYR4LmXb4EYf2AowfCVd55ePG5B`
- Supported mint count: `4`
- PrivateDAO read-node intent receipt: ok
- Intent execution reference: `umbra-22fd98be8bb36bc49a615b38`
- Intent receipt hash: `22fd98be8bb36bc49a615b3852ee485837d2cf22699de442e453be3e499ff8f4`
- Intent mode: `testnet-intent-receipt`
- Claim lifecycle path: `received -> validating -> offsets_reserved -> building_tx -> tx_built -> submitting -> submitted -> awaiting_callback -> callback_received -> finalizing -> completed`

## Safety Boundary

No private keys, master seed, viewing keys, UTXO secrets, raw proof account data, or bearer tokens are printed. Full claim execution is still a wallet-side SDK action because the relayer requires proof account data and UTXO slot data generated from the user's private context.
