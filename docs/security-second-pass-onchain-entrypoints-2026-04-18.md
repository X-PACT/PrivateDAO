<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Security Second Pass - On-chain Entrypoints - 2026-04-18

This pass ranks the still-uncovered on-chain entrypoints by security value and execution risk.

## Highest-value next targets

1. `finalize_zk_enforced_proposal_v3`
   - why first: final governance-state transition under strict ZK proof verification
   - source: `programs/private-dao/src/privacy.rs`
   - review focus:
     - snapshot/DAO/proposal binding
     - proof verification freshness
     - canonical payload hash enforcement
     - post-reveal finalization path
   - existing partial integration references:
     - `tests/private-dao.ts:3806`
     - `tests/private-dao.ts:3906`

2. `update_dao_settlement_policy_v3`
   - why second: changes the policy envelope that later governs confidential payout execution
   - source: `programs/private-dao/src/dao.rs`
   - review focus:
     - rollback prevention
     - max payout monotonic tightening
     - settlement requirement monotonic tightening
   - existing partial integration references:
     - `tests/private-dao.ts:285`

3. `update_dao_governance_policy_v3`
   - why third: governs strict governance-state envelopes before later ZK finalization and execution
   - source: `programs/private-dao/src/dao.rs`
   - review focus:
     - governance snapshot monotonicity
     - strict mode tightening without rollback
     - invalid policy combinations and freezing semantics
   - existing partial integration references:
     - `tests/private-dao.ts:3985`

4. `execute_confidential_payout_plan_v2`
   - why fourth: moves treasury assets under settlement-evidence gates, but the adjacent V3 path already has stronger partial coverage than the top 3 items above
   - source: `programs/private-dao/src/treasury.rs`
   - review focus:
     - stale or mismatched evidence rejection
     - payout hash canonicalization
     - token-account owner/mint checks
     - duplicate-execution prevention
   - existing partial integration references:
     - `tests/private-dao.ts:4089`
     - `tests/private-dao.ts:4140`
     - `tests/private-dao.ts:4183`

## Remaining uncovered entrypoints

- `veto_proposal`
- `finalize_zk_enforced_proposal`
- `cancel_proposal_v2`
- `update_voter_weight_record_v2`
- `update_voter_weight_record`
- `migrate_from_realms`
- `get_voter_weight_record`

## Findings from static pass

- No new obvious authority-bypass or unchecked state-transition flaw was found in the top 4 paths during this code pass.
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
- `update_dao_governance_policy_v3` already appears to preserve monotonic governance tightening in the same family as the settlement-policy path, but still lacks its own direct regression harness for invalid transitions.

## Immediate execution order

1. deepen direct regression coverage for `execute_confidential_payout_plan_v2`
2. add a full runtime `anchor test` pass that executes the new V3 governance / settlement / ZK-finalization scenarios end-to-end
3. extend negative-path coverage for `finalize_zk_enforced_proposal_v3` beyond the existing success-path direct test
4. extend negative-path coverage for `update_dao_governance_policy_v3` and `update_dao_settlement_policy_v3` beyond the current rollback / invalid-config cases
