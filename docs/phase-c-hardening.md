# Phase C Hardening

PrivateDAO is not yet claiming full production-grade `zk_enforced` dominance.

The repository is now at:

- Phase A: proposal-bound on-chain proof anchors and parallel verification receipts
- Phase B: proposal-level `zk_enforced` mode with frontend and CLI support
- Phase C: pending hardening before `zk_enforced` can become the stronger production path

## What Is Already Live

- `commit-reveal` remains the canonical live governance path
- `verify_zk_proof_on_chain` records proposal-bound verification receipts on chain
- `configure_proposal_zk_mode` can lock a proposal into `zk_enforced`
- `finalize_zk_enforced_proposal` is available and surfaced in the frontend and CLI
- once a proposal is locked to `zk_enforced`, the policy cannot be downgraded

## What Still Blocks Phase C

### 1. Verifier Boundary

The current stack records anchors and verification receipts on chain, but the proving and verification workflow is still generated and checked off chain before receipts are written.

To move to a stronger production-grade `zk_enforced` model, the project still needs:

- a final verifier boundary decision
- production compute-budget analysis
- final proof/public-input policy for vote, delegation, and tally
- verifier-program provenance and versioning discipline

### 2. Runtime Validation

`zk_enforced` must be validated through:

- wallet-connected proposal creation
- proof anchoring
- receipt recording
- mode activation
- finalize path execution

This must be repeated across:

- Phantom
- Solflare
- Backpack
- Glow
- Android runtime captures

### 3. Multi-Proposal And Negative Paths

The stronger path still needs expanded coverage for:

- missing receipt rejection
- wrong receipt rejection
- policy immutability after `zk_enforced`
- cross-proposal receipt substitution rejection
- mixed proposal sets where some DAOs remain companion mode and others use `zk_enforced`

### 4. External Security Review

Before `zk_enforced` becomes the strongest production recommendation, the repo still needs:

- external audit coverage for the new policy account and finalize path
- review of verifier receipts as a trust boundary
- operational review of upgrade, rollback, and authority handling

## Safe Execution Path

Use the following order:

1. keep commit-reveal live as the default path
2. expand `zk_enforced` Devnet evidence with more proposal runs
3. validate wallet/runtime behavior on real devices
4. complete external review
5. only then consider promoting `zk_enforced` as the stronger production path

## Current Rule

The repo is deliberately explicit:

- `zk_enforced` exists
- `zk_enforced` is usable
- `zk_enforced` is not yet declared the dominant production path

That promotion requires additional runtime evidence, review, and operator confidence beyond the current repository state.
