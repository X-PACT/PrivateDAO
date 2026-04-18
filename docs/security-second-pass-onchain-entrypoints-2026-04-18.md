<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Security Second Pass - On-chain Entrypoints - 2026-04-18

This pass ranks the still-uncovered on-chain entrypoints by security value and execution risk.

## Highest-value next targets

1. `execute_confidential_payout_plan_v2`
   - why first: moves treasury assets under settlement-evidence gates
   - source: `programs/private-dao/src/treasury.rs`
   - review focus:
     - stale or mismatched evidence rejection
     - payout hash canonicalization
     - token-account owner/mint checks
     - duplicate-execution prevention

2. `finalize_zk_enforced_proposal_v3`
   - why second: final governance-state transition under strict ZK proof verification
   - source: `programs/private-dao/src/privacy.rs`
   - review focus:
     - snapshot/DAO/proposal binding
     - proof verification freshness
     - canonical payload hash enforcement
     - post-reveal finalization path

3. `update_dao_settlement_policy_v3`
   - why third: changes the policy envelope that later governs confidential payout execution
   - source: `programs/private-dao/src/dao.rs`
   - review focus:
     - rollback prevention
     - max payout monotonic tightening
     - settlement requirement monotonic tightening

## Remaining uncovered entrypoints

- `update_dao_governance_policy_v3`
- `veto_proposal`
- `finalize_zk_enforced_proposal`
- `cancel_proposal_v2`
- `update_voter_weight_record_v2`
- `update_voter_weight_record`
- `migrate_from_realms`
- `get_voter_weight_record`

## Findings from static pass

- No new obvious authority-bypass or unchecked state-transition flaw was found in the top 3 paths during this code pass.
- The largest remaining risk is not an obvious bug in the reviewed logic; it is the absence of direct regression coverage around the strict settlement and strict ZK-finalization paths.
- `update_dao_settlement_policy_v3` already enforces monotonic hardening and rejects rollback via `SettlementPolicyRollbackNotAllowed`.
- `execute_confidential_payout_plan_v2` already enforces:
  - strict policy snapshot requirement
  - verified settlement evidence
  - evidence validity window
  - canonical payout field hash match
  - timelock and one-time execution gates
  - token mint / owner / duplicate account checks in the token branch
- `finalize_zk_enforced_proposal_v3` already enforces:
  - snapshot binding to DAO and proposal
  - strict policy requirement
  - verified proof status
  - proof freshness
  - canonical payload hash match
  - reveal-window completion
  - `Voting`-only finalize state

## Immediate execution order

1. finish one fuzz smoke target cleanly
2. add direct regression coverage for `execute_confidential_payout_plan_v2`
3. add direct regression coverage for `finalize_zk_enforced_proposal_v3`
4. add direct regression coverage for `update_dao_settlement_policy_v3`
