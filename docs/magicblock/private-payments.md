<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# MagicBlock Private Payments

PrivateDAO now supports a proposal-bound MagicBlock private payment corridor for confidential token payouts.

This path is intentionally strict:

- the payout proposal remains a normal PrivateDAO proposal
- the confidential payout plan still stores only aggregate amount, recipient count, settlement recipient, and immutable hashes
- the MagicBlock corridor binds an external private payment route to the same proposal and payout plan
- execution is blocked until the corridor is settled on-chain with validator, transfer queue, and transaction evidence

## What the corridor adds

For confidential token payouts, the `MagicBlockPrivatePaymentCorridor` PDA records:

- API base URL
- target cluster
- owner wallet
- settlement wallet
- token mint
- deposit / transfer / withdrawal amounts
- route hash
- validator
- transfer queue
- transaction signatures for deposit, transfer, and withdraw
- settlement status

This means the frontend, reviewers, and operators can all inspect whether the private payment route has actually been completed before treasury execution is allowed.

## Product flow

1. Create a confidential token payout proposal.
2. Configure the payout plan on-chain.
3. Configure the MagicBlock corridor for that proposal.
4. Run the MagicBlock private payment route from the wallet or CLI.
5. Settle the corridor on-chain from the DAO authority wallet with the validator, transfer queue, and transaction signatures.
6. Finalize and execute the proposal through the normal PrivateDAO lifecycle.

## Why this matters

Without this corridor, confidential token payouts would still rely only on proposal approval and payout-plan metadata. With MagicBlock, the product gains a private payment route that is:

- proposal-bound
- reviewable
- execution-gated by DAO-authority settlement evidence
- visible in the live frontend and read node

This is an authority-attested evidence gate. It does not claim that the PrivateDAO program re-verifies MagicBlock transaction contents cryptographically on chain.

## Surface area

- Live frontend: `repo root Next.js export`
- CLI:
  - `npm run configure:magicblock`
  - `npm run settle:magicblock`
  - `npm run inspect:magicblock`
  - `npm run magicblock:payments -- <action>`
- Read node:
  - `/api/v1/magicblock/health`
  - `/api/v1/magicblock/mints/:mint/status`
  - `/api/v1/magicblock/balances/:address?mint=<MINT>`

## Related docs

- `docs/confidential-payments.md`
- `docs/refhe-protocol.md`
- `docs/magicblock/operator-flow.md`
- `docs/rpc-architecture.md`
