<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Settlement Hardening V3

`Settlement Hardening V3` is an additive confidential-payout execution path. It does not remove or reinterpret legacy payout plans or `V2` settlement evidence.

## What V3 Adds

- DAO-level settlement policy companion account
- Proposal-level settlement policy snapshot
- minimum settlement evidence age before execution
- maximum payout cap per governed payout
- optional REFHE settlement requirement
- optional MagicBlock settlement requirement for token payouts
- `execute_confidential_payout_plan_v3`

## Why It Exists

`V2` already added threshold-attested settlement evidence, freshness windows, and single-use consumption. V3 adds execution policy locking on top of that so a payout can be forced to respect the same economic and integration assumptions it was reviewed under.

## V3 Security Goals

- prevent executing immediately on newly recorded evidence when an operator wants a minimum evidence aging window
- prevent executing payout amounts above a DAO-defined cap
- force REFHE settlement when the DAO requires it
- force MagicBlock settlement for token payouts when the DAO requires it
- bind those requirements to a proposal-scoped snapshot so later DAO policy changes do not silently reinterpret an existing payout

## Compatibility Boundary

- legacy payout execution remains callable
- `execute_confidential_payout_plan_v2` remains callable
- V3 strictness applies only when the operator explicitly initializes the V3 policy, snapshots it for the proposal, and uses the V3 execute path

## Current Verification Status

Implemented and locally verified:

- Rust compile and unit test pass
- TypeScript typecheck passes

Operational note:

- this is an additive hardening layer
- broader live Devnet execution evidence still comes from the existing runtime/reviewer packets unless and until dedicated V3 Devnet rehearsal artifacts are recorded
