# Canonical Verifier Boundary Decision

This document is the decision surface for the final `zk_enforced` production boundary.

## Current Options

### Option A: Receipt Boundary

Production trust boundary remains:

- proposal-bound proof anchors
- proposal-bound verification receipts
- proposal-level `zk_enforced` policy
- stronger finalize path

Pros:

- fits the current deployed architecture
- lower migration risk
- lower operational complexity

Cons:

- final verifier semantics remain partially external
- reviewer burden stays higher

### Option B: Verifier Program Boundary

Production trust boundary moves to:

- explicit on-chain verifier program enforcement
- proposal acceptance and/or finalize acceptance gated directly by verifier semantics

Pros:

- strongest security posture
- cleaner reviewer boundary
- strongest long-term production claim

Cons:

- higher engineering cost
- higher compute and transaction pressure
- requires more audit depth and runtime evidence

## Current Recommendation

Do not declare Option B complete yet.

Short-term production hardening should continue with Option A plus:

- stronger receipt hierarchy
- immutable `zk_enforced` policy
- runtime captures
- external audit review

Only after that should the project freeze whether:

- Option A becomes the long-term production boundary
- or Option B is required before full promotion

## Decision Rule

Promote the stronger path only when all of the following are closed:

- `zk_enforced` runtime captures exist across the wallet matrix
- external audit explicitly reviews the stronger path
- verifier boundary is frozen in writing
- operator flow is stable under Devnet evidence
- go-live decision artifacts still remain honest after the boundary is frozen
