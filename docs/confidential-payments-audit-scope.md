<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Confidential Payments Audit Scope

## Audit Objective

Validate that proposal-bound confidential payout plans do not weaken PrivateDAO treasury safety, lifecycle ordering, or execution determinism.

## In Scope

- `configure_confidential_payout_plan`
- `execute_confidential_payout_plan`
- proposal and DAO binding for the payout plan PDA
- conflict rejection between confidential payout plans and direct treasury actions
- settlement recipient validation
- token mint and token account validation for token batches
- replay and double-execute resistance
- execution path separation from the standard treasury action path

## Questions The Audit Should Answer

1. Can a payout plan be rebound to a different proposal or DAO?
2. Can the same proposal execute both a direct treasury action and a confidential payout batch?
3. Can a funded batch execute twice?
4. Can the wrong settlement recipient or wrong mint receive funds?
5. Can a partially configured plan reach the execute path?
6. Do the on-chain hashes and URI create a stable external review boundary?

## External Evidence Expected

- real wallet captures for salary and bonus flows
- explorer links for configure and execute transactions
- operator confirmation that the settlement recipient process is controlled and reviewable

## Related Notes

- [confidential-payments.md](confidential-payments.md)
- [confidential-payroll-flow.md](confidential-payroll-flow.md)
- [audit-handoff.md](audit-handoff.md)
