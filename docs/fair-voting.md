# Fair Voting Model

PrivateDAO is designed to make voting harder to manipulate without pretending that all governance metadata can be hidden.

## What "Fair Voting" Means Here

The fairness target is not absolute anonymity.

The fairness target is:

- no live vote-choice leakage during the commit phase
- no direct replay into duplicate execution effects
- no casual account substitution across proposal, vote, delegation, and treasury paths
- no treasury execution before lifecycle completion
- no open-ended participation without governance identity or weight

## Current Fairness Layers

### Commit-Reveal Privacy

The deployed Solana protocol keeps vote choice hidden during the commit window.

That matters because it reduces:

- whale pressure
- vote buying pressure
- treasury signaling pressure
- strategic coordination against visible live tallies

### Lifecycle Enforcement

Fair voting depends on a strict state machine.

PrivateDAO enforces:

- commit before reveal
- reveal before finalize
- finalize before execute
- timelock before treasury execution

Without this, privacy would be cosmetic rather than protective.

### Governance Identity And Weight

Voting is not treated as anonymous noise.

The system binds participation to governance weight and proposal-scoped vote records, so voting power remains accountable even when live intent is hidden.

### Delegation Safety

Delegation is proposal-scoped and bounded.

The review surface, tests, and browser/operator guards treat delegation as a controlled extension of governance rights rather than a loose secondary channel.

### Replay And Execution Safety

Fairness requires that outcomes cannot be duplicated or replayed after the lifecycle has already advanced.

That is why PrivateDAO ties fairness to:

- replay analysis
- duplicate-execution rejection
- failed-path state preservation
- cryptographic integrity for reviewer artifacts

## ZK And Fair Voting

The current zk stack does not replace the deployed governance lifecycle.

It strengthens the fairness story by adding:

- vote validity proofs
- delegation authorization proofs
- tally integrity proofs
- provenance and transcript-backed zk review artifacts

This means the fairness model is no longer only "hidden until reveal."

It also becomes:

- proof-backed
- transcript-backed
- attested
- tamper-evident in the reviewer surface

## Honest Boundary

PrivateDAO does not currently claim:

- fully anonymous on-chain voting
- hidden treasury execution
- complete metadata privacy
- deployed on-chain zk verifier integration

The current fair-voting claim is narrower and defensible:

PrivateDAO provides private intent during the vote window, hardened execution after finalization, and an additive zk stack that strengthens validity and reviewability without rewriting the live contracts.
