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

## Current Tooling Lane

- TS unit tests: `npm run test:unit:ts`
- TS coverage: `npm run coverage:ts`
- Rust lib coverage: `npm run coverage:rust`
- Rust lib coverage LCOV: `npm run coverage:rust:lcov`
- Fuzz:
  - `npm run fuzz:validate-treasury-action`
  - `npm run fuzz:validate-confidential-settlement`
  - `npm run fuzz:governance-and-signatures`

## Current Baselines

- TS unit tests: `9 passing`
- TS coverage baseline:
  - statements: `64.04%`
  - branches: `68.23%`
  - functions: `67.69%`
  - lines: `64.04%`
- Rust lib coverage baseline:
  - regions: `17.05%`
  - functions: `14.80%`
  - lines: `16.78%`

## Execution Notes

- TypeScript test execution was moved from `ts-node` to `tsx` because the old runner stalled on `apps/web` imports.
- `cargo-fuzz` now requires the nightly toolchain on this machine and is wired for smoke runs through the repo scripts.

## Truth Boundary

Coverage and fuzzing are now wired into the repo, but no public `>80%` claim should be made until:

1. the coverage commands produce a real baseline
2. the uncovered instruction handlers receive direct tests
3. fuzz targets run cleanly beyond smoke duration
4. the current baselines are lifted materially beyond helper-only coverage
