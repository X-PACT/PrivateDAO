# Changelog

All notable changes to this project are documented in this file.

## v0.3.2 - 2026-02-25

- Adopted hybrid legal configuration:
  - core protocol (`programs/`) licensed under AGPL-3.0-or-later
  - SDK layer (`sdk/`) licensed under Apache-2.0
  - frontend/docs layers (`frontend/`, `docs/`) licensed under MIT
- Added root license files:
  - `LICENSE` (AGPL-3.0 text)
  - `LICENSE-APACHE`
  - `LICENSE-MIT`
- Added per-layer license files:
  - `sdk/LICENSE`
  - `frontend/LICENSE`
  - `docs/LICENSE`
- Added initial SDK helper module in `sdk/src/index.ts` with Apache SPDX header.
- Added AGPL SPDX header to `programs/private-dao/src/lib.rs`.

## v0.3.1 - 2026-02-25

- Hardened container build environment in `Dockerfile` for Solana/Anchor development:
  - pinned Anchor via AVM (`0.31.1`)
  - added native build dependencies required by Anchor/Solana workflows
  - enabled reproducible Node/Yarn toolchain setup
- Extended deterministic verification flow in `scripts/verify.sh` with explicit stages:
  - `tools`, `fmt`, `lint`, `build`, `test`, `scan`, `rpc`, `rpc-health`, `rpc-health-unit`
- Reduced devnet test flakiness in test suites:
  - removed treasury faucet dependence from integration/demo tests
  - switched treasury seeding to payer-funded transfers
  - reduced wallet funding requirements for test wallets
- Updated ownership metadata:
  - migrated source-code licensing to `AGPL-3.0-or-later + commercial`
  - added `NOTICE`

## v0.3.0 - 2026-02-24

- Added/extended governance lifecycle coverage for commit-reveal and timelocked execution:
  - create DAO
  - create proposal
  - commit/reveal voting
  - finalize proposal
  - execute treasury action
- Added negative-path tests for recipient substitution and invalid action configuration.
- Updated docs site and repository docs to reflect current Solana devnet program configuration.
