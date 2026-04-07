<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# REFHE Security Model

REFHE adds a stronger encrypted-computation boundary to confidential payouts without moving treasury authority away from the existing governance lifecycle.

## Security Goals

- keep employee-level or recipient-level manifests off-chain
- bind encrypted evaluation inputs to the exact payout proposal
- prevent payout execution if the encrypted evaluation has not been settled by the DAO authority
- require a verifier program binding before a REFHE-gated payout can execute

## Protected Invariants

### Proposal Binding

The REFHE envelope is derived from the proposal PDA and stores:

- DAO
- proposal
- payout plan

This prevents cross-proposal reuse.

### Ciphertext Binding

The REFHE envelope requires:

- `input_ciphertext_hash == confidential_payout_plan.ciphertext_hash`

This prevents evaluating a different encrypted manifest than the one approved by governance.

### Execution Gate

If the REFHE envelope account exists, `execute_confidential_payout_plan` requires:

- matching DAO / proposal / payout plan
- `status == Settled`
- settlement was recorded by the DAO authority
- `verifier_program.is_some()`

### Immutable Settlement Boundary

Execution uses the settled envelope only as an enforcement gate. Treasury release remains:

- proposal-bound
- timelocked
- wallet-visible
- auditable on-chain

## What REFHE Does Not Claim

- it does not claim fully homomorphic computation on-chain
- it does not claim the PrivateDAO program cryptographically re-verifies REFHE computation on-chain
- it does not claim that verifier execution is the canonical governance boundary yet
- it does not hide aggregate payout totals from on-chain execution

## Current Threat Model Focus

- wrong proposal / wrong payout-plan linkage
- missing or downgraded verifier binding
- attempted execution before encrypted evaluation settlement
- operator mis-routing of the encrypted bundle
- stale or conflicting payout ciphertext inputs

## Recommended External Review Focus

- PDA binding correctness
- settlement gating correctness
- payout-plan / envelope mismatch rejection
- execution path safety under malformed envelope data
- auditability of emitted events and explorer-visible transitions
