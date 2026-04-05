<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# ZK-Enforced Operator Flow

This is the exact operator path for moving a proposal from the normal commit-reveal lifecycle into the stronger `zk_enforced` path.

## Current Boundary

PrivateDAO still keeps commit-reveal as the canonical governance boundary.

`zk_enforced` is already live, but it is promoted proposal by proposal only after the stronger receipt set exists on chain.

## Exact Sequence

1. Create the proposal normally.
2. Record or upgrade the three verification receipts in `zk_enforced` mode:
   - vote
   - delegation
   - tally
3. Inspect the proposal receipt state:
   - `npm run inspect:zk-proposal -- --proposal <PROPOSAL_PDA>`
4. Lock the proposal into `zk_enforced`:
   - `npm run configure:zk-mode -- --proposal <PROPOSAL_PDA> --mode zk_enforced`
5. Finalize through the correct path:
   - `yarn finalize -- --proposal <PROPOSAL_PDA>`
6. Execute only after normal lifecycle success and timelock clearance:
   - `yarn execute -- --proposal <PROPOSAL_PDA>`

## Receipt Strength Rule

Parallel receipts are not enough for `zk_enforced`.

A proposal can only move into `zk_enforced` when:

- vote receipt is `zk_enforced`
- delegation receipt is `zk_enforced`
- tally receipt is `zk_enforced`

If even one receipt is still only `parallel`, the stronger finalize path must remain blocked.

## Operator Checks

Before enabling `zk_enforced`, confirm:

- the proposal PDA is correct
- all three receipt PDAs exist
- each receipt is proposal-bound
- each receipt is in `zk_enforced` mode
- the verifier program field is present for the stronger receipts

## What This Does Not Claim Yet

This flow does not claim that full Groth16 verifier enforcement is already the final canonical boundary on chain.

What it does provide today is:

- proposal-bound on-chain proof anchors
- on-chain verification receipts
- stronger receipt mode hierarchy
- proposal-level policy locking
- a distinct finalize path for `zk_enforced`

## Why This Matters

This operator flow makes the stronger path usable without breaking existing governance.

It gives reviewers and operators a deterministic sequence for:

- inspecting receipt strength
- enabling the stronger policy
- finalizing with the stronger path
- keeping the remaining blockers explicit
