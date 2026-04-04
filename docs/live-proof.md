# Live Devnet Proof

This note captures a real end-to-end governance run executed on Solana devnet from the repository surface using the verification wallet.

## Program Deployment

- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deploy transaction: `2FTRdNt2e1AXqPBwYReDiaNHjRZF2N7VtQeF17Ue56S7UoJPqZQxZ5gi32fRvAgE7ToE636EaDkanEoZvvcin9pD`
- Deploy explorer: `https://solscan.io/tx/2FTRdNt2e1AXqPBwYReDiaNHjRZF2N7VtQeF17Ue56S7UoJPqZQxZ5gi32fRvAgE7ToE636EaDkanEoZvvcin9pD?cluster=devnet`

## Live Governance Cycle

- DAO: `FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx`
- DAO explorer: `https://solscan.io/account/FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx?cluster=devnet`
- Governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- Governance mint explorer: `https://solscan.io/account/AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt?cluster=devnet`
- Treasury PDA: `AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c`
- Treasury explorer: `https://solscan.io/account/AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c?cluster=devnet`
- Proposal PDA: `AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP`
- Proposal explorer: `https://solscan.io/account/AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP?cluster=devnet`

## Governance Mint Clarification

The canonical reviewer-facing Devnet DAO now uses `PDAO` itself as the actual on-chain governance mint. The live governance mint and the published PDAO mint are the same address:

- `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`

## Transaction Hashes

- `create-dao`: `5mcyVi3SbZo4hvpVMjH2eZH8FYeywdbbPz4ArmE5wHXH5X9EnP6gSq76ogBWYWVkVUwzrCchPnSdhGV1mFb48s5Q`
- Explorer: `https://solscan.io/tx/5mcyVi3SbZo4hvpVMjH2eZH8FYeywdbbPz4ArmE5wHXH5X9EnP6gSq76ogBWYWVkVUwzrCchPnSdhGV1mFb48s5Q?cluster=devnet`
- `mint-voting`: `reused-existing-governance-balance`
- Note: the live proof reused the verification wallet's existing PDAO balance rather than minting a separate governance token.
- `deposit`: `KHWqfteEQhsH7hk7onQymbmnYdtF8rLoPWwchoQz5XFy8eY3DufeaX8DPiiVS1or7XkMVjMrbH2rsEhPtrPfzi9`
- Explorer: `https://solscan.io/tx/KHWqfteEQhsH7hk7onQymbmnYdtF8rLoPWwchoQz5XFy8eY3DufeaX8DPiiVS1or7XkMVjMrbH2rsEhPtrPfzi9?cluster=devnet`
- `create-proposal`: `E93ikMXVJbtvz8ewAHA2BasZPVKYyUXe3Jy88h3b3AQubm7PSYFMNtDveBkRts7uYodwzb8cGZSVDoneKF16X2L`
- Explorer: `https://solscan.io/tx/E93ikMXVJbtvz8ewAHA2BasZPVKYyUXe3Jy88h3b3AQubm7PSYFMNtDveBkRts7uYodwzb8cGZSVDoneKF16X2L?cluster=devnet`
- `commit`: `3RMbrcYGx297hgcTrov9PqtUqM97ZFg6A21qxmepTboLQAoXov6toY2QTa8yU1i8zmQPvjR3ArNGpvR3jat79uTP`
- Explorer: `https://solscan.io/tx/3RMbrcYGx297hgcTrov9PqtUqM97ZFg6A21qxmepTboLQAoXov6toY2QTa8yU1i8zmQPvjR3ArNGpvR3jat79uTP?cluster=devnet`
- `reveal`: `5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5`
- Explorer: `https://solscan.io/tx/5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5?cluster=devnet`
- `finalize`: `4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG`
- Explorer: `https://solscan.io/tx/4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG?cluster=devnet`
- `execute`: `x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9`
- Explorer: `https://solscan.io/tx/x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9?cluster=devnet`

## Observed Invariants

- Proposal result: `Passed`
- `isExecuted = true`
- `yesCapital = 1000000000000000`
- `noCapital = 0`
- `revealCount = 1 / 1`
- Treasury balance moved from `0.2000 SOL` to `0.1500 SOL`
- Recipient balance increased from `59.8798 SOL` to `59.9298 SOL`

## Reproduction Command

```bash
ANCHOR_PROVIDER_URL="https://api.devnet.solana.com" \
ANCHOR_WALLET="/path/to/wallet-keypair.json" \
npm run live-proof -- --name PDAOCanonical20260404 --governance-mint AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt
```
