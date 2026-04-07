# PrivateDAO V2 Security Hardening

This document describes the additive hardening layer introduced after the security review of `programs/private-dao/src/lib.rs`.

The goal is not to break legacy accounts, PDAs, or instruction interfaces. Legacy flows remain readable and callable. New strict guarantees are exposed through companion accounts and V2 instructions.

## Compatibility Model

- Existing account layouts are not reordered.
- Existing PDA derivations are not changed.
- Existing instructions are not removed.
- Strict behavior is opt-in through companion policy accounts.
- Proposal behavior is snapshotted at the object level so future DAO policy changes do not silently reinterpret old proposals.

## New Companion Accounts

- `DaoSecurityPolicy`
  Stores rollout mode, feature policies, cancel policy, proof attestors, settlement attestors, thresholds, TTLs, and emergency disable state.

- `ProposalExecutionPolicySnapshot`
  Stores the DAO policy mode and feature policies captured for a specific proposal at the time the strict path is selected.

- `ProposalProofVerification`
  Stores verified proof metadata with explicit `VerificationStatus`, canonical payload binding, domain separator, expiry, and verification kind.

- `SettlementEvidence`
  Stores source-specific settlement evidence with `SettlementEvidenceKind`, `EvidenceStatus`, settlement identifier, exact payout-field binding, expiry, and recorder.

- `SettlementConsumptionRecord`
  A single-use PDA keyed by settlement evidence. If it already exists, the same evidence cannot execute a payout again.

- `VoterWeightScopeRecord`
  Adds explicit chamber/scope semantics to the legacy Realms-compatible voter weight record.

## ZK-Enforced Governance

Root cause:
Legacy ZK receipts were anchored metadata and administrative attestations, not cryptographic verification.

Strict V2 objective:
A proposal using the strict path cannot finalize unless `ProposalProofVerification` exists, has `status == Verified`, is fresh, binds to the exact proposal, and matches the canonical payload hash.

Implementation:
- `record_proof_verification_v2`
- `finalize_zk_enforced_proposal_v2`
- `ProposalProofVerification`
- `ProposalExecutionPolicySnapshot`

Trust model:
The current production-safe fallback is threshold attestation. The attestors and threshold are encoded on-chain in `DaoSecurityPolicy`, and enough attestors must sign the transaction. This is an explicit trust model, not a fake verifier claim. A future verifier CPI can be added as another `VerificationKind` without breaking legacy state.

Invariant:
Strict V2 finalization fails if proof status is not verified, proof is stale, domain separator mismatches, or payload hash does not match the canonical proposal payload.

## REFHE and MagicBlock Settlement

Root cause:
Legacy settlement status was stored as proposal-bound metadata, but external settlement was not independently verified on-chain.

Strict V2 objective:
Confidential payout execution must fail unless a verified, fresh, authorized, proposal-bound, payout-bound, single-use evidence account exists.

Implementation:
- `record_settlement_evidence_v2`
- `execute_confidential_payout_plan_v2`
- `SettlementEvidence`
- `SettlementConsumptionRecord`

Invariant:
Strict V2 payout execution fails if evidence is stale, not verified, mismatched to another DAO/proposal/payout plan, mismatched to canonical payout fields, or already consumed.

## Cancellation

Root cause:
Legacy `cancel_proposal` could cancel a proposal while status remained `Voting`, including after meaningful participation.

Strict V2 objective:
Ordinary cancellation must not be allowed after meaningful participation.

Implementation:
- `cancel_proposal_v2`
- `DaoSecurityPolicy.cancel_policy`

Invariant:
Strict V2 cancellation requires `status == Voting`, current time before `voting_end`, `commit_count == 0`, and `reveal_count == 0`.

## Realms Voter Weight

Root cause:
Legacy `DualChamber` export mapped to the community chamber weight but did not encode the chamber semantics in a separate record.

Strict V2 objective:
New integrations can request and inspect an explicit voter weight scope.

Implementation:
- `update_voter_weight_record_v2`
- `VoterWeightScopeRecord`

Invariant:
New integrations can distinguish token-weighted, quadratic, capital-leg, and community-leg semantics without changing the legacy Realms-compatible account layout.

## Rollout Plan

1. Ship additive accounts and V2 instructions.
2. Keep existing DAOs in legacy mode by default.
3. Initialize `DaoSecurityPolicy` for DAOs that want strict rollout.
4. Snapshot proposal policy with `snapshot_proposal_execution_policy` before using strict V2 finalization or settlement execution.
5. Use threshold attestation until a dedicated verifier CPI is available.
6. Add verifier-CPI support as a new `VerificationKind` in a later additive upgrade.
7. Recommend strict mode after tests, external review, and operational attestor setup are complete.

## Regression Tests Added

- Policy snapshot creation.
- Threshold-attested proof verification record creation.
- Payload substitution failure for strict finalization.
- Correct payload reaches lifecycle timing checks instead of failing proof binding.

Further test work should add live full-path `execute_confidential_payout_plan_v2` settlement consumption checks on an AVX2-capable local validator or Devnet test account.
