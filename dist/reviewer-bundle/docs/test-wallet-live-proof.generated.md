# Test Wallet Live Proof

This note captures a real end-to-end governance run executed on Solana Devnet using local test-only wallets outside git. It is intentionally separate from the canonical `docs/live-proof.md` path so the reviewer-facing PDAO proof remains stable.

## Context

- generated at: `2026-04-09T11:32:52.662Z`
- mode: `test-wallet-devnet-proof`
- operator wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- recipient wallet: `CXqiqoAKTDJEXiz6VJKQiHVyNm6FBvPMxsDm743mRvzt`
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

## Accounts

- DAO: `8c6NmAwvN2fQcVupmQJcyNKdGvk2xwBYqLobTEh8EvjG`
- DAO explorer: `https://solscan.io/account/8c6NmAwvN2fQcVupmQJcyNKdGvk2xwBYqLobTEh8EvjG?cluster=devnet`
- Governance mint: `GHqb9aYeCeMTx9BvyRRjC8T1btrRpSddwqPEREe82VB4`
- Governance mint explorer: `https://solscan.io/account/GHqb9aYeCeMTx9BvyRRjC8T1btrRpSddwqPEREe82VB4?cluster=devnet`
- Treasury PDA: `7aYwK1LwhGrVQnxvixpbVyLEKq9pBece2zdW6j3EpXXa`
- Treasury explorer: `https://solscan.io/account/7aYwK1LwhGrVQnxvixpbVyLEKq9pBece2zdW6j3EpXXa?cluster=devnet`
- Proposal PDA: `6rSbKcQa3iYZe9i6RYmnZiBqiVFsAZJbzp6WGeoRKqpG`
- Proposal explorer: `https://solscan.io/account/6rSbKcQa3iYZe9i6RYmnZiBqiVFsAZJbzp6WGeoRKqpG?cluster=devnet`

## Transactions

- `createDao`: `2RDviLGPiM39CyDk4K3vzfzME7RS8iUvVmZ168GecEMcrXQjFjzctVK5FqpxwMKY14zqb7ZXbk99gTRGhR6uR2yR`
- Explorer: `https://solscan.io/tx/2RDviLGPiM39CyDk4K3vzfzME7RS8iUvVmZ168GecEMcrXQjFjzctVK5FqpxwMKY14zqb7ZXbk99gTRGhR6uR2yR?cluster=devnet`
- `mintVoting`: `5TP8UHbZVmtBfUbNK34Ut9eJdvECFXGk16MU64Z59fJXUhDZRSA8dVBQF3ru69rgzgFBF8UmUXQJVTpLvE7y3N4L`
- Explorer: `https://solscan.io/tx/5TP8UHbZVmtBfUbNK34Ut9eJdvECFXGk16MU64Z59fJXUhDZRSA8dVBQF3ru69rgzgFBF8UmUXQJVTpLvE7y3N4L?cluster=devnet`
- `deposit`: `2jg3qv9h1Z2iX5ueYCok3TzMJqUzTEwSmrQMqCykthmijGoGUSmCRDe3qdCKbVjuggPgJdh5eJwcysi7ZB6X47hd`
- Explorer: `https://solscan.io/tx/2jg3qv9h1Z2iX5ueYCok3TzMJqUzTEwSmrQMqCykthmijGoGUSmCRDe3qdCKbVjuggPgJdh5eJwcysi7ZB6X47hd?cluster=devnet`
- `createProposal`: `4A7CM7YCx53Nq5uuvv1fBckpDR3MFuUmR11vRknmEFqe8nVKpCM1XHbakdjHXSWXjTgoXAiukZJD1AGmZk7gUjTF`
- Explorer: `https://solscan.io/tx/4A7CM7YCx53Nq5uuvv1fBckpDR3MFuUmR11vRknmEFqe8nVKpCM1XHbakdjHXSWXjTgoXAiukZJD1AGmZk7gUjTF?cluster=devnet`
- `commit`: `2ygogYvHEKeNpvcXRD5qd2CRjhEBLcWjSuHe9Cs16AS5owhn93B7oaAA2KTDTetS6AEE9qPuds8vLPo468fPgaXf`
- Explorer: `https://solscan.io/tx/2ygogYvHEKeNpvcXRD5qd2CRjhEBLcWjSuHe9Cs16AS5owhn93B7oaAA2KTDTetS6AEE9qPuds8vLPo468fPgaXf?cluster=devnet`
- `reveal`: `4MH8PgzQgZ4WCy4A8Yy4sPrqz99fui7bxuJcE4cB7LbzqNmKcitkKZBb6W4NV8PK3R1Grn7xCFebvezYHb8qmHTe`
- Explorer: `https://solscan.io/tx/4MH8PgzQgZ4WCy4A8Yy4sPrqz99fui7bxuJcE4cB7LbzqNmKcitkKZBb6W4NV8PK3R1Grn7xCFebvezYHb8qmHTe?cluster=devnet`
- `finalize`: `46wvMcbwvi53ixcZthMM7UDRPKKZzBXYQqAUXQ5ANWc8GGYYWCbn6a2sb7xk6NmAZCVRTWrgnVqfyb3Yz1zR6od7`
- Explorer: `https://solscan.io/tx/46wvMcbwvi53ixcZthMM7UDRPKKZzBXYQqAUXQ5ANWc8GGYYWCbn6a2sb7xk6NmAZCVRTWrgnVqfyb3Yz1zR6od7?cluster=devnet`
- `execute`: `3agrGvt6GHuSbDbikwLT4UudzMAayVKRs6dRBvTvcR7BP98rbxUDvmGvW7gr3JGoQhMY1WDENQAtpQNHxeG5nm7G`
- Explorer: `https://solscan.io/tx/3agrGvt6GHuSbDbikwLT4UudzMAayVKRs6dRBvTvcR7BP98rbxUDvmGvW7gr3JGoQhMY1WDENQAtpQNHxeG5nm7G?cluster=devnet`

## Observed Invariants

- Proposal result: `Passed`
- `isExecuted = true`
- `yesCapital = 1000000000`
- `noCapital = 0`
- `revealCount = 1 / 1`
- voting end: `2026-04-09 11:32:30 UTC`
- reveal end: `2026-04-09 11:32:38 UTC`
- execution unlock: `2026-04-09 11:32:48 UTC`
- treasury before deposit: `0.0000 SOL`
- treasury before execute: `0.2000 SOL`
- treasury after execute: `0.1500 SOL`
- recipient before: `0.0500 SOL`
- recipient after: `0.1000 SOL`

## Purpose

This artifact proves that the repository can execute a real test-only Devnet lifecycle with local wallets: `Create DAO -> Submit proposal -> Commit -> Reveal -> Execute treasury`. It is not a production-custody or mainnet claim.
