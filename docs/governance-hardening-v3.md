<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Governance Hardening V3

`Governance Hardening V3` is an additive path on top of the existing DAO program. It does not remove or reinterpret legacy governance objects.

## What V3 Adds

- DAO-level governance policy companion account
- Proposal-level governance policy snapshot
- Token-supply participation quorum mode
- Dedicated reveal rebate vault PDA
- `reveal_vote_v3`
- `finalize_proposal_v3`
- `finalize_zk_enforced_proposal_v3`

## Why It Exists

Two governance behaviors remained intentionally unchanged in legacy mode:

- quorum was based on `reveal_count / commit_count`
- reveal rebates could be paid from proposal lamports

Those semantics are still preserved for old objects and legacy flows. V3 adds a stricter path for new flows without breaking old PDA derivations, account layouts, or instruction interfaces.

## V3 Security Goals

### 1. Stronger quorum semantics

V3 can snapshot the governance mint supply at proposal time and require participation against that snapshot instead of only against revealed voters.

### 2. Safer rebate funding

V3 moves reveal rebates into a dedicated DAO-bound vault PDA so proposal accounts are no longer used as an implicit rebate source.

### 3. Stable policy interpretation

V3 snapshots proposal governance policy at proposal scope so future DAO-level policy changes do not silently reinterpret existing proposals.

## Compatibility Boundary

- Legacy instructions remain callable.
- Existing proposals remain readable and executable under their original semantics.
- V3 strictness applies only when the operator explicitly uses the V3 path.

## Current Verification Status

Implemented and locally verified:

- Rust compile and unit test pass
- TypeScript typecheck passes
- portable core checks pass

Operational note:

- the local portable suite in this environment does not run the full AVX2-dependent Anchor validator path
- V3 should therefore be treated as implemented and regression-covered, not as a replacement for the broader Devnet rehearsal evidence already recorded for legacy and V2 flows
