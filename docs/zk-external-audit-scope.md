# ZK External Audit Scope

This document defines the exact scope an external auditor should review for the stronger `zk_enforced` path.

## Priority Review Surface

1. `programs/private-dao/src/lib.rs`
2. `tests/private-dao.ts`
3. `docs/phase-c-hardening.md`
4. `docs/zk-verifier-strategy.md`
5. `docs/zk-enforced-threat-review.md`
6. `docs/zk/enforced-runtime-evidence.md`
7. `docs/zk/enforced-runtime.generated.md`
8. `docs/zk/enforced-operator-flow.md`

## Required Questions

The audit should explicitly answer:

- are proposal-bound proof anchors scoped correctly
- are verification receipts proposal-bound and layer-bound
- can `zk_enforced` policy be downgraded or bypassed
- can weaker `parallel` receipts be used where stronger receipts are required
- can a proposal finalize through the stronger path with mismatched receipts
- does the verifier program field need stronger semantic checks before production dominance
- what residual risks remain before promoting the stronger path

## Required Runtime Review

The audit should also inspect the runtime operator flow:

- receipt recording
- receipt upgrade path
- policy activation
- `finalize_zk_enforced_proposal`
- wallet/runtime evidence expectations

## Honest Boundary

This scope prepares the repo for external review. It does not claim that the external audit has happened or that its findings are already closed.
