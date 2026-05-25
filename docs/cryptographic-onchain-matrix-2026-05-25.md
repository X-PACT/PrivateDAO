# Cryptographic On-Chain Matrix — 2026-05-25

PrivateDAO is now tracked through one cryptographic operating matrix. The purpose is simple: every encryption, privacy, custody, and intelligence lane must say what is live on Solana Testnet, what is locally verifiable, what is staged behind Squads timelock, and what is not claimed yet.

This is a Testnet operating packet for the current Anchor `1.0.1` program:

- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- ProgramData: `FKyt5DcmRQcCF8kzMGjCvfGb3ZPHMQnH1SqiG9Mi8xEc`
- Squads multisig: `thHmF7VYNtxE1MaDzYXbfPCiq13RF6JwuWnjvDZuSmF`
- Squads vault authority: `CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv`
- Current binary proposal: Squads proposal index `3`
- Current binary timelock release: `2026-05-27T02:25:39Z`

## Executive Reading

PrivateDAO does not treat privacy as a slogan. It separates the protected payload from the public proof trail:

- governance intent can stay protected until reveal or verification time
- confidential payout settlement can be gated before execution
- ZK proofs can be generated and verified locally, with standalone on-chain verifier evidence already deployed
- upgrade authority is controlled by Squads and enforced by a timelock that cannot be bypassed by signers
- data and intelligence providers supply decision context, telemetry, and reviewer evidence without becoming key custody authorities

## Matrix

| Lane | Current State | Testnet / Verification Evidence | Product Meaning | Boundary |
| --- | --- | --- | --- | --- |
| Squads custody | Live authority control | Vault `CALHrBqx6jbzcPn2NVcinqSAHeod65v9LcDuTxsdPqBv`; multisig `thHmF7VYNtxE1MaDzYXbfPCiq13RF6JwuWnjvDZuSmF`; current proposal index `3` approved 2-of-3 and waiting for timelock release | Protocol upgrades are no longer single-key operations | DAO operating handoff waits for proposal index `3` execution after `2026-05-27T02:25:39Z` |
| Timelock enforcement | Live security control | Execution before release fails with Squads `TimeLockNotReleased / 6021` | Even approved signers cannot bypass the waiting period | This is a Testnet custody proof, not mainnet launch completion |
| ZK local Groth16 | Verified local cryptographic path | `npm run zk:all`, `npm run verify:zk-consistency`, `npm run verify:zk-negative`, `docs/zk-capability-matrix.md` | Vote, delegation, and tally proof paths have real artifacts and tamper rejection | Local/off-chain proof verification is not the same as integrated verifier CPI |
| Standalone ZK verifier | Deployed on Solana Testnet | Program `5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j`; receipt tx `zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67` | PrivateDAO has an on-chain BN254/Groth16 verifier receipt path for reviewers | The verifier is standalone; native governance CPI integration is staged, not yet executed |
| Program-integrated ZK path | Staged behind Squads timelock | Current binary buffer `HXcaUbT7Q8euufUbDKuhoRkSSYQPwUwmhw69TdePV6uY`; buffer authority transfer tx `4g7SaVf6yXNouGCvxqDnSsQGD7yuPgJr9fLCSWhd3BaN1uQJgZy5LQ8iZZhMozSy83X8CBKjXfsjZTgdiZVq6fqB` | The stricter protocol path is prepared under multisig release discipline | Do not claim this as executed until proposal index `3` is executed after timelock |
| REFHE confidential envelope | On-chain active as settlement gate | Configure tx `3fygnmHzFpRQEbHq9q6u3djBnkTEcYz9y1TSwxDmbnuemshrMwLmy9CqpjifjRb7SmW3DbmXrkyq35cnjU7mMSPi`; settle tx `5TmS2AcpAmifcoG97U63Unzy7wt7B2NfyhBRs8Z6C4r1eqcWthEqf3GLcZXQ33sVYHf9YwfvBNhZD8ZZdt4HRwEY`; envelope `5UHy5XTrYdTUn9Wfwmeur7kMp2rLneyuZZQJf1mYasy3` | Confidential operations must pass a governed encryption-envelope gate before payout execution | This does not claim full on-chain FHE computation re-execution |
| MagicBlock private corridor | On-chain active as execution corridor | Configure tx `4UiUumtuGeDciojDA26PkQby7RFiTNb12UG4ACcvGMGfQj24PUPxK5Apeno7EY8mbCvq8nR6h6nfxDcBpjPvGvPj`; settle tx `22XW8XVhWwQtChNQK2aEqXv5BVBbckxUmu4NsisoZQW21KA5ii87gVNUTcNoZ9e1vYKnHmm62qP1girpzVXWN1WY`; corridor `CwB641sj7R6GAL84kf5xThi4zjN9Edx5S7yXz7GDuo85` | Private payments can move through an explicit settlement corridor instead of a UI-only label | Corridor receipts are Testnet operational evidence |
| Evidence-gated payout | Executed on Solana Testnet | Execute tx `2a8sHWgiVCZkstybMff2M9R6DVU4Y96Rfsg8mqYs7K3xcYSEG1zMcq2iSTNwLD6FgfXvxxxWpwEP9Tbyin47RXvE`; treasury token balance `60000000 -> 10000000`; recipient token balance `0 -> 50000000` | The encrypted settlement lane has proof of execution, not only proof of configuration | Token motion is Testnet and should be presented as such |
| IKA / 2PC-MPC | Live readiness and approval route prepared | Sui Testnet latest network encryption key `0xe7c79a60931299e110297554fc02e0a0e095e96778775092c97f07a1bd1337cc`; Solana pre-alpha program `87W54kGYFQ1rgWqMeu4XTPHWXWmXSQCcjm8vCTfiq1oY`; route `ika-approval-e58f98a89fa650dcc587a848` | PrivateDAO has a concrete dWallet path for threshold-controlled signing and cross-chain policy work | No funded IKA dWallet DKG or final 2PC-MPC signature is claimed in this run |
| Token-2022 governance asset | Live fixed-supply Testnet token | Mint `DFYvBdivHCe4bSErgCiKm2RhwGEcZYbBPFQzLNr37Bie`; supply `1,000,000 PDAO`; mint authority disabled | Governance and reward lanes have a fixed Testnet asset for reviewer-visible flows | Testnet token has no monetary value |
| QuickNode stream/read-node | Data and telemetry lane | Testnet endpoint and stream are configured for read-node and Programs + Logs routing | Backend telemetry can feed visitor counters, live proof surfaces, and operational monitoring | RPC tokens and stream secrets stay out of repository and public docs |
| GoldRush / Covalent / QVAC intelligence | Decision-support lane | Indexed into the intelligence and reviewer evidence surfaces | Intelligence helps turn raw chain activity into explainable policy, treasury, and risk decisions | These providers do not replace wallet signatures or protocol authority checks |

## What Changed Since The Older Devnet Narrative

The older Devnet material is now treated as archived proof history. The current reviewer path should lead with:

- Anchor `1.0.1`
- Solana Testnet
- Program `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- REFHE and MagicBlock Testnet settlement gates
- evidence-gated token motion
- Squads proposal index `3` waiting for enforced timelock release

Any surface that still references the old Devnet program as the primary product state should be considered stale and routed to this matrix or the current network state document.

## Verification Commands

```bash
npm run verify:encrypted-integrations-activation
npm run verify:cryptographic-onchain-matrix
npm run verify:test-wallet-live-proof:v3
npm run verify:zk-standalone-verifier
npm run verify:operation-ledger
```

## Reviewer Shortcut

Open these in order:

1. `/documents/cryptographic-onchain-matrix-2026-05-25`
2. `/documents/testnet-encrypted-integrations-activation-2026-05-23`
3. `/documents/zk-capability-matrix`
4. `/documents/operation-ledger.generated`
5. `/judge`

The expected reading is: encrypted operations have real Testnet execution evidence; ZK has both local proof discipline and a standalone on-chain verifier receipt; the newest integrated binary is protected by Squads timelock until the scheduled release.
