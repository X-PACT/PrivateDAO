# Testnet Encrypted Integrations Activation — 2026-05-23

PrivateDAO now has a fresh Testnet activation run for the encrypted execution lane. The run uses the current Anchor `1.0.1` program ID `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`, not the archived Devnet program surface.

## What Executed On Solana Testnet

The live V3 packet is stored in:

- `docs/test-wallet-live-proof-v3.generated.json`
- `docs/test-wallet-live-proof-v3.generated.md`

Core settlement accounts:

- Settlement DAO: `B8kydmvWdwNvGoGhgdP7oTNPphzNs2E6wfXpAoxHpeoo`
- Settlement proposal: `3oJ4hkmHr7dZ29MAREMAvDgMxYAMKbrHrFFbZG7TWTuQ`
- REFHE envelope: `5UHy5XTrYdTUn9Wfwmeur7kMp2rLneyuZZQJf1mYasy3`
- MagicBlock corridor PDA: `CwB641sj7R6GAL84kf5xThi4zjN9Edx5S7yXz7GDuo85`
- Settlement evidence: `ALdonAM3L5BnBYiknkQ2AVrHLjHc8nHQPqi2kJUW6zE1`

Execution transactions:

- Configure confidential token payout: `3MsNfd1bXM9gCiozCCb9tyV3v8D6YEU2o57a2gTymfAqTqLC9NXka6SsacAaZ54nB17hE3HQwNqwGmVUAZqJHkXS`
- Configure REFHE envelope: `3fygnmHzFpRQEbHq9q6u3djBnkTEcYz9y1TSwxDmbnuemshrMwLmy9CqpjifjRb7SmW3DbmXrkyq35cnjU7mMSPi`
- Configure MagicBlock private payment corridor: `4UiUumtuGeDciojDA26PkQby7RFiTNb12UG4ACcvGMGfQj24PUPxK5Apeno7EY8mbCvq8nR6h6nfxDcBpjPvGvPj`
- Settle REFHE envelope: `5TmS2AcpAmifcoG97U63Unzy7wt7B2NfyhBRs8Z6C4r1eqcWthEqf3GLcZXQ33sVYHf9YwfvBNhZD8ZZdt4HRwEY`
- Settle MagicBlock private payment corridor: `22XW8XVhWwQtChNQK2aEqXv5BVBbckxUmu4NsisoZQW21KA5ii87gVNUTcNoZ9e1vYKnHmm62qP1girpzVXWN1WY`
- Record settlement evidence V2: `5rPqdGuz2TD8fydmTgLAKQpxhdjwxjNwfXnSCZ6DRvtu5sfVuTfcgYkGXQrSAHsbzMKL9sUPZn4oRxS3smBXHBXs`
- Execute evidence-gated payout V3: `2a8sHWgiVCZkstybMff2M9R6DVU4Y96Rfsg8mqYs7K3xcYSEG1zMcq2iSTNwLD6FgfXvxxxWpwEP9Tbyin47RXvE`

## Observed Result

- Proposal status: `Passed`
- Proposal executed: `true`
- Settlement evidence consumed: `true`
- Treasury token balance: `60000000 -> 10000000`
- Recipient token balance: `0 -> 50000000`
- REFHE settlement required: `true`
- MagicBlock settlement required: `true`

This proves the current on-chain gate sequence: confidential token payout plan, REFHE envelope configuration, MagicBlock corridor configuration, governance and settlement snapshots, REFHE settlement, MagicBlock settlement, settlement evidence recording, evidence consumption, and final token payout execution.

## IKA / 2PC-MPC Readiness

The read-node IKA checks completed live on 2026-05-23:

- IKA Sui SDK readiness: `ok`
- Network: `testnet`
- SDK initialized: `true`
- Latest network encryption key: `0xe7c79a60931299e110297554fc02e0a0e095e96778775092c97f07a1bd1337cc`
- Execution boundary: `ika-sui-network-read-complete-ready-for-dwallet-execution`

The Solana pre-alpha lane also returned live readiness:

- Source: `ika-solana-prealpha-readiness`
- Program ID: `87W54kGYFQ1rgWqMeu4XTPHWXWmXSQCcjm8vCTfiq1oY`
- Program executable: `true`
- Operator wallet: `EFpoUvDwHwQJDW1dY2otjRbeH8todKSe8kJK9M2U5g2P`
- Operator funded: `true`

Approval preparation also returned:

- Source: `ika-solana-prealpha-approval-intent`
- Route ID: `ika-approval-e58f98a89fa650dcc587a848`
- Boundary: `approval-route-prepared-for-dwallet-execution`

## MagicBlock Live Probe

The MagicBlock probe was refreshed on 2026-05-23:

- MagicBlock payments health: `ok`
- PrivateDAO MagicBlock health proxy: `ok`
- Direct challenge readiness: `ok`
- PrivateDAO challenge proxy: `ok`
- Devnet USDC mint initialization: `ok`
- Devnet regions live: Asia, Europe, TEE, USA

The generated probe files are:

- `docs/generated/magicblock-private-payments-probe.generated.json`
- `docs/magicblock/private-payments-live-probe.generated.md`

## Verification Commands

Run:

```bash
npm run build:test-wallet-live-proof:v3
npm run verify:test-wallet-live-proof:v3
npm run probe:magicblock-private-payments
```

## Truth Boundary

REFHE and MagicBlock are now activated as Solana Testnet proposal-bound settlement gates in the PrivateDAO Anchor program. IKA is live-readiness through `@ika.xyz/sdk`, Sui Testnet network reads, and the IKA Solana pre-alpha readiness/approval lane. This packet does not claim that a funded IKA dWallet DKG and final 2PC-MPC signing transaction has been executed in this run.
