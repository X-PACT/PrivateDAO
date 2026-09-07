# ZK-Enforced Threat Review

This note captures the threat-review focus for the proposal-level `zk_enforced` path.

## Scope

The review surface covers:

- `ProposalZkPolicy`
- `configure_proposal_zk_mode`
- `finalize_zk_enforced_proposal`
- proposal-bound verification receipts
- frontend and CLI mode activation paths

## Key Invariants

- a receipt must be proposal-bound
- a receipt must be layer-bound
- a proposal must not activate `zk_enforced` without vote, delegation, and tally receipts
- once locked to `zk_enforced`, the proposal must not downgrade back to a weaker mode
- finalize must follow the correct path for the configured proposal mode

## Required Negative Paths

The stronger path must continue rejecting:

- missing receipts
- wrong receipts
- cross-proposal receipt substitution
- late mode activation after commits or reveals begin
- downgrade after `zk_enforced` lock
- finalize through the wrong instruction path

## Remaining Review Questions

- should receipt recording remain the sufficient on-chain trust boundary
- should a stricter verifier-program path replace or augment current receipts
- what are the final replay and substitution assumptions for the verifier flow itself

## Current Conclusion

The current repository hardens the new path and makes it reviewable, but the final promotion of `zk_enforced` still depends on broader runtime evidence and external review.
