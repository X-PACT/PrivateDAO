# Devnet Release Manifest

## Purpose

This manifest records the live Devnet deployment surface that reviewers and operators should treat as the current canonical reference.

It exists to reduce ambiguity between:

- the deployed program
- the live governance proof
- the review-facing strategy config
- the proof links exposed in the frontend and README

## Canonical Devnet References

- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deployment transaction: `5wGTXjAhp4jBvU4Uu6FbMVziZkrxN7B9boh98XGfueSLTtZVsAvFtiNzPLfZsKpggJUkCgu1yAXjR4bd4T2w9aU1`
- Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`

## Live Governance Proof References

- DAO PDA: `Gj7NgKm1MtB2CDs11pPJDcLExrkHf1styKdge1Lgx7V4`
- Governance mint: `JDu2NmGsNrNTHEm7zepCwYRpD6KZ7CtiSkdCg1KFHyn1`
- Treasury PDA: `S2J1gNCbE8E21pL3VEX4fhz2duxidSwRd7yaV9nriFW`
- Proposal PDA: `8JLRaAnwZc3BXfHKEKdiaK82MyjR1VhgGRKMydqmHxd1`

## Live Lifecycle Transactions

- `create-dao`: `5RnLdHsdFTNSeqB2yFgKrRDDJmsAHXUoWm8h1LgazDqHQr2ebHzRd1mmCHWnFFBcR7QdYQZKfdrE7JWYFz8oRHj1`
- `mint-voting`: `b5ymoL6RHg7786yv2TxjD9VV51fdsfHWaaRGLAFWEJ9HigpS5osZQKY2bSgVqtVC3y1qqnX8vpr9vfiEuHVuWCR`
- `deposit`: `4yw9mzpzWbg33TMtiht4eLBQw9KBa3jV6Yey61RMDzjQ51yXJ3Lp31ScvEXNwr2Q6HGuLQKz8r7PhQnbY5Vcm4RT`
- `create-proposal`: `KaZBBExcKxbnHg6Qm8VsbFZhJqcmDiw3q8GkktCyVEc8sPDMLf1bW6bP3yqSJXaz45kom5eCPMh6rdEWgBSYgam`
- `commit`: `dVhZLy67oWtXPmi9UjirQ7Ndmrg9j3QMBWhsrsKFBa7CnbotV2zXfnCLtDYHbjkepTT5GECi12Umj5NCSXbiS36`
- `reveal`: `3ALcXd4UZam1RVhuTV7ZtpmUVytWmAZKuK8KMK5XtpxgqMZYwMXbo5pKgjoJY5nt269jFT9uAMWCAuM2GM7dKCUB`
- `finalize`: `6394A1ith6ZEXD3N2nFUWDigytPPm9Pucw45y1SweLZZKXYHwxi6GpsaejpdkZyX5mgLRECUgqRSFSm9P6Uo64j`
- `execute`: `Xkoeqbe8g8jcosTQNsrMGCBevfzBtZwwyS2QjVfW9jrupczuj25LyAW3B7noQfPbsveT6eAggUBL3nLJBEASeri`

## Repository Cross-Checks

These values are expected to match:

- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [ranger-strategy-config.devnet.json](/home/x-pact/PrivateDAO/docs/ranger-strategy-config.devnet.json)
- [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md)
- [README.md](/home/x-pact/PrivateDAO/README.md)

## Operator Use

Use this manifest when:

- reviewing whether the repo points to the correct live program
- validating that the strategy package references the same verification wallet
- checking that reviewer-facing docs are synchronized
- preparing a submission package or audit handoff

## Honest Boundary

This manifest documents the current live Devnet release surface.

It is not a claim that:

- mainnet has already been cut over
- external audit is complete
- strategy-side PnL evidence is embedded in this manifest
