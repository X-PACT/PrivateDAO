# ZK Verifier Strategy

This document defines the current verifier posture for PrivateDAO and what still needs to be closed before `zk_enforced` can become the stronger production-grade path.

## Current Strategy

PrivateDAO does not yet claim a fully dominant on-chain verifier boundary.

The current model is:

- off-chain witness generation
- off-chain proof generation
- off-chain verification workflow
- on-chain proof anchors
- on-chain parallel verification receipts
- proposal-level `zk_enforced` policy once the required receipts exist

This is intentionally stronger than a pure proof-of-concept, but still not the same as a final production-grade verifier architecture.

## Why This Exists

The current approach keeps the live governance product stable while allowing:

- proposal-bound proof material
- proposal-bound verification receipts
- operator-visible enforcement upgrades
- frontend and CLI support for the stronger path

without rewriting the entire commit-reveal lifecycle in one step.

## What Still Needs To Be Decided

### Verifier Boundary

Before promoting `zk_enforced` as the stronger default path, the project must finalize:

- whether receipt-based verification remains the production trust boundary
- or whether a stricter verifier-program model will be required

### Public Inputs

The project must freeze the exact public inputs for:

- vote proof path
- delegation proof path
- tally proof path

so the enforcement contract and the reviewer expectations match.

### Compute Budget

The stronger path must be costed explicitly for:

- instruction count
- account footprint
- transaction size
- compute-unit pressure
- confirmation behavior under Devnet and mainnet load

### Operator Flow

The canonical operator path must remain proposal-bound:

1. record proposal-bound proof anchors
2. record proposal-bound verification receipts
3. enable `zk_enforced`
4. finalize only through the matching policy path

## Current Production Rule

Until the verifier boundary is frozen and reviewed:

- `zk_enforced` is available
- `zk_enforced` is useful
- `zk_enforced` is not yet the dominant production recommendation
