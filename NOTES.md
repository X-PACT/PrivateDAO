<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Dev Notes

Short notes that explain the shape of the system as it exists now.

## Why commit-reveal instead of ZK

Because this version needed something shippable, inspectable, and realistic on Solana in the current repo scope. Commit-reveal is an old primitive, but it works, and the tradeoff is explicit: voters must come back to reveal or rely on a keeper.

## Commitment scheme

```text
sha256(vote_byte || salt_32 || voter_pubkey_32)
```

Including the voter pubkey binds the commitment to one voter and prevents replay by another voter on the same proposal.

## Weight snapshot timing

Vote weight is snapshotted at commit time. That is the current anti-flip protection:

- buy
- commit
- dump

does not let a holder move weight around after the vote is sealed.

## Quorum model

Quorum is based on reveal participation among committed voters:

```text
reveal_count / commit_count
```

That means unrevealed votes behave like abstentions in the final result.

## Treasury execution state

Treasury execution is live in the current codebase.

- `SendSol` executes on-chain
- `SendToken` executes on-chain with recipient and mint checks
- `CustomCPI` is still event-only on purpose

## Realms scope

The repo has Realms-compatible pieces, but not a finished one-click Realms replacement.

Current position:

- migration provenance is recorded
- voter-weight record shape exists
- full proposal lifecycle coupling remains future integration work

## What is still honestly hard

1. Commit-reveal still leaks participation timing.
2. Reveal liveness is a real operational risk even with keeper support.
3. Large DAOs will eventually care about account count and storage costs.
4. Any deeper Realms integration should be versioned carefully rather than forced into the current account model.
