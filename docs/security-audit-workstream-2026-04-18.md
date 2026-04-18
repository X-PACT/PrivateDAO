<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Security Audit Workstream - 2026-04-18

This document tracks the current security-audit execution lane for PrivateDAO.

## Scope

- protocol logic review
- regression tests
- fuzz targets
- coverage tooling
- reviewer-facing evidence integrity

## Current Findings Closed In This Tranche

- `zk_enforced` receipts are now authority-only.
- `zk_enforced` mode activation is now authority-only.
- `zk_enforced` receipts now require a verifier-program boundary.
- receipt validation now rejects `zk_enforced` receipts with no verifier-program boundary.
- `verify:security-remediation` now checks the real legacy cancel implementation location.
- direct Anchor integration tests were added for:
  - `finalize_zk_enforced_proposal_v3`
  - `update_dao_settlement_policy_v3`
  - `update_dao_governance_policy_v3`

## Current Tooling Lane

- TS unit tests: `npm run test:unit:ts`
- TS coverage: `npm run coverage:ts`
- TS ops coverage: `npm run coverage:ts:ops`
- TS focused coverage: `npm run coverage:ts:focused`
- Rust lib coverage: `npm run coverage:rust`
- Rust lib coverage LCOV: `npm run coverage:rust:lcov`
- Fuzz:
  - `npm run fuzz:validate-treasury-action`
  - `npm run fuzz:validate-confidential-settlement`
  - `npm run fuzz:governance-and-signatures`

## Current Baselines

- TS unit tests: `35 passing`
- TS coverage baseline:
  - statements: `64.04%`
  - branches: `68.23%`
  - functions: `67.69%`
  - lines: `64.04%`
- TS ops coverage baseline:
  - total statements: `76.19%`
  - total branches: `62.67%`
  - total functions: `80.51%`
  - total lines: `76.19%`
  - `scripts/lib/read-node.ts`
    - statements/lines: `73.29%`
    - functions: `75.86%`
    - branches: `62.76%`
  - `scripts/lib/micropayment-engine.ts`
    - statements/lines: `83.01%`
    - functions: `94.73%`
    - branches: `62.50%`
- TS focused coverage current run:
  - total statements: `76.32%`
  - total branches: `73.13%`
  - total functions: `81.20%`
  - total lines: `76.32%`
  - `apps/web/src/lib/dao-bootstrap.ts`
    - statements/lines: `71.25%`
    - functions: `75.00%`
    - branches: `72.82%`
  - `scripts/lib/read-node.ts`
    - statements/lines: `78.51%`
    - functions: `82.75%`
    - branches: `77.34%`
  - `scripts/lib/micropayment-engine.ts`
    - statements/lines: `83.01%`
    - functions: `94.73%`
    - branches: `62.50%`
- Rust lib coverage baseline:
  - regions: `17.05%`
  - functions: `14.80%`
  - lines: `16.78%`

## Fuzz Smoke Results

- `validate_treasury_action`
  - `364451` runs in `31` seconds
  - final libFuzzer line: `DONE cov: 145 ft: 187 corp: 16/766b`
- `validate_confidential_settlement`
  - `116984` runs in `31` seconds
  - final libFuzzer line: `DONE cov: 406 ft: 803 corp: 231/83Kb`
- `governance_and_signatures`
  - `133893` runs in `31` seconds
  - final libFuzzer line: `DONE cov: 374 ft: 575 corp: 99/27Kb`

## Execution Notes

- TypeScript test execution was moved from `ts-node` to `tsx` because the old runner stalled on `apps/web` imports.
- `cargo-fuzz` now requires the nightly toolchain on this machine and is wired for smoke runs through the repo scripts.
- The focused TS lane is now the most relevant short-loop metric for the current tranche because it measures the three files explicitly requested for uplift instead of the full frontend/helpers surface.
- The three new Anchor integration tests were verified through `mocha --dry-run` with `ANCHOR_PROVIDER_URL` and `ANCHOR_WALLET` set, which confirms the test file registers the new scenarios correctly before the heavier local-validator runtime pass.

## Truth Boundary

Coverage and fuzzing are now wired into the repo, but no public `>80%` claim should be made until:

1. the coverage commands produce a real baseline
2. the uncovered instruction handlers receive direct tests
3. fuzz targets run cleanly beyond smoke duration
4. the current baselines are lifted materially beyond helper-only coverage

The current tranche clears smoke fuzzing across all three targets and lifts focused TypeScript functions above `80%`, but it still does not justify a broad public `>80% coverage` claim across the repository or the full Solana instruction surface.

The new direct integration scenarios are present in `tests/private-dao.ts`, but a full `anchor test --run tests/private-dao.ts` runtime pass was not allowed to finish in this tranche because the host-side dependency warm build remained expensive. The registration-level proof and the existing Anchor workspace build both succeeded.
