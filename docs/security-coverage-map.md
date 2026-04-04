# Security Coverage Map

| Threat Class | Mitigation | Test File | Coverage Status |
| --- | --- | --- | --- |
| Lifecycle bypass | `status` and timing guards on commit, reveal, finalize, execute | `tests/full-flow-test.ts`, `tests/private-dao.ts` | Covered |
| Replay | `AlreadyCommitted`, `AlreadyRevealed`, `AlreadyFinalized`, `AlreadyExecuted` checks | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Covered |
| Duplicate execution | `is_executed` gate and execute-twice rejection | `tests/full-flow-test.ts` | Covered |
| Signer misuse | reveal signer authorization and delegated signer binding | `tests/private-dao.ts` | Covered |
| Authority misuse | authority-only cancel/veto paths via `has_one = authority`; permissionless finalize/execute still seed-bound | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Partially Covered |
| PDA misuse | seed-bound proposal, vote, delegation, and treasury relations | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Covered |
| Account confusion | wrong DAO/proposal, wrong proposal/delegation, wrong treasury/DAO pairings rejected | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Covered |
| Treasury miswiring | recipient, mint, ownership, duplicate token-account, and treasury-PDA checks | `tests/full-flow-test.ts` | Covered |
| Invalid reveal | wrong salt, wrong vote payload, wrong signer, wrong timing | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Covered |
| Timing boundary misuse | before/at/after commit, reveal, finalize, execute boundaries | `tests/full-flow-test.ts` | Covered |
| Delegation misuse | self-delegation rejection, non-delegatee rejection, cross-proposal delegation rejection | `tests/private-dao.ts` | Covered |
| Execution invariants | failed execute leaves `is_executed` and balances unchanged; successful execute moves exact amount | `tests/full-flow-test.ts` | Covered |
| Partial state mutation | failed finalize/execute preserve critical fields and lifecycle status | `tests/full-flow-test.ts` | Covered |
| State regression | failed paths do not regress passed/failed proposals into earlier states | `tests/full-flow-test.ts` | Covered |
| Commit-reveal binding | voter record binds commitment to voter and proposal | `tests/private-dao.ts`, `tests/full-flow-test.ts` | Covered |
| Direct/delegated overlap | proposal-bound vote/delegation marker accounts reject overlap on-chain; scripts/frontend still mirror the same guardrails | `tests/private-dao.ts`, `scripts/commit-vote.ts`, `scripts/delegate-vote.ts`, `docs/index.html` | Covered |
| External validator environment | local validator startup is environment-dependent and currently flaky in this shell | `npm run test:core`, `npm run test:full`, `npm run demo` operational evidence | Residual Risk |
