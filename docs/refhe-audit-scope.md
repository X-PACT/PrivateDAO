<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# REFHE Audit Scope

This file scopes external review for the REFHE layer added to confidential payroll and bonus execution.

## In Scope

- `configure_refhe_envelope`
- `settle_refhe_envelope`
- `execute_confidential_payout_plan` REFHE gating path
- `RefheEnvelope` account layout
- frontend and CLI operator flow consistency
- proposal-bound PDA derivation

## Review Questions

1. Can a payout execute with a malformed or mismatched REFHE envelope?
2. Can the envelope be attached to the wrong proposal or payout plan?
3. Can the operator downgrade or bypass the verifier-program requirement?
4. Can a stale or unrelated ciphertext hash be used?
5. Are status transitions monotonic and safe?
6. Are Anchor events sufficient for operator and reviewer audit trails?

## Expected Rejections

- missing REFHE settlement
- missing verifier program
- mismatched DAO, proposal, or payout plan
- invalid envelope payload
- configuration after the proposal lifecycle is already active

## Runtime Evidence Needed

- create confidential proposal with REFHE fields
- verify REFHE envelope configuration tx on Devnet
- demonstrate execution rejection before settlement
- settle REFHE on Devnet
- execute confidential payout successfully after settlement

## Linked Material

- [refhe-protocol.md](refhe-protocol.md)
- [refhe-operator-flow.md](refhe-operator-flow.md)
- [refhe-security-model.md](refhe-security-model.md)
- [confidential-payments-audit-scope.md](confidential-payments-audit-scope.md)
