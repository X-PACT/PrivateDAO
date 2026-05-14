# Umbra Devnet SDK Live Probe

Generated: `2026-05-14T12:22:19.107Z`

This packet verifies the PrivateDAO Umbra lane against the installed `@umbra-privacy/sdk`, the public devnet relayer, and the live PrivateDAO read-node intent endpoint without printing secret material.

## Network

- Package: `@umbra-privacy/sdk` (`4.0.0`)
- Devnet relayer: `https://relayer.api-devnet.umbraprivacy.com`
- Devnet indexer: `https://utxo-indexer.api-devnet.umbraprivacy.com`

## Capability Matrix

| Group | Status | Reason |
| --- | --- | --- |
| Client setup | used for readiness | getUmbraClient is checked as the browser/client entrypoint; live wallet prompts are intentionally not triggered by this probe. |
| Registration | available | getUserRegistrationFunction and getUserAccountQuerierFunction are checked so the UI can require account setup before private flows. |
| Encrypted balances | available | Direct deposit and withdraw factories are checked for wallet-signed private-balance flows. |
| UTXO mixer | available | Receiver-claimable UTXO creation and claimable UTXO scanning exports are checked; real claims require ZK proof data and UTXO slot data. |
| Relayer | used | The devnet relayer health, address, supported mints, and claim lifecycle are fetched live. |
| Compliance | available | Compliance grant and viewing-key exports are checked without deriving or printing private key material. |

## Export Check

| Export | Present |
| --- | --- |
| `getUmbraClient` | yes |
| `getUmbraRelayer` | yes |
| `getUserRegistrationFunction` | yes |
| `getUserAccountQuerierFunction` | yes |
| `getPublicBalanceToEncryptedBalanceDirectDepositorFunction` | yes |
| `getEncryptedBalanceToPublicBalanceDirectWithdrawerFunction` | yes |
| `getPublicBalanceToReceiverClaimableUtxoCreatorFunction` | yes |
| `getClaimableUtxoScannerFunction` | yes |
| `getComplianceGrantIssuerFunction` | yes |
| `getComplianceGrantRevokerFunction` | yes |
| `getUserComplianceGrantQuerierFunction` | yes |
| `getMasterViewingKeyDeriver` | yes |
| `getMonthlyViewingKeyDeriver` | yes |
| `getUmbraRelayer` | yes |
| `pollClaimUntilTerminal` | yes |

## Live Results

- Umbra docs index: ok
- Devnet relayer health: ok
- Relayer address: `3kbpT5EmRBjDZG5XcTYR4LmXb4EYf2AowfCVd55ePG5B`
- Supported mint count: `3`
- PrivateDAO read-node intent receipt: ok
- Intent execution reference: `umbra-b3310aa53758a0a55b8fc391`
- Intent receipt hash: `b3310aa53758a0a55b8fc39144a5f8f5858178a5789f12715f61e992fcd9ba18`
- Intent mode: `testnet-intent-receipt`
- Claim lifecycle path: `received -> validating -> offsets_reserved -> building_tx -> tx_built -> submitting -> submitted -> awaiting_callback -> callback_received -> finalizing -> completed`

## Safety Boundary

No private keys, master seed, viewing keys, UTXO secrets, raw proof account data, or bearer tokens are printed. Full claim execution is still a wallet-side SDK action because the relayer requires proof account data and UTXO slot data generated from the user's private context.
