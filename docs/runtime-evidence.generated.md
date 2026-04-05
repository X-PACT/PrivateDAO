# Runtime Evidence Package

## Overview

- Generated at: `2026-04-04T23:56:04.867Z`
- Program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Diagnostics page: `https://x-pact.github.io/PrivateDAO/?page=diagnostics`
- Supported wallet classes: `5`

## Wallet Matrix

- Auto Detect (`auto-detect`) | status: `devnet-review-ready` | diagnostics: `true` | selector: `true`
- Phantom (`phantom`) | status: `devnet-review-ready` | diagnostics: `true` | selector: `true`
- Solflare (`solflare`) | status: `devnet-review-ready` | diagnostics: `true` | selector: `true`
- Backpack (`backpack`) | status: `devnet-review-ready` | diagnostics: `true` | selector: `true`
- Glow (`glow`) | status: `manual-runtime-qa-required` | diagnostics: `true` | selector: `true`

## Devnet Canary Summary

- Network: `devnet`
- Primary healthy: `true`
- Fallback healthy: `true`
- Anchor accounts present: `true`
- Unexpected failures: `0`

## Resilience Summary

- RPC fallback recovered: `true`
- Stale blockhash rejected: `true`
- Stale blockhash recovered: `true`
- Unexpected failures: `0`

## Runtime Documents

- `docs/wallet-runtime.md`
- `docs/runtime-attestation.generated.json`
- `docs/wallet-compatibility-matrix.generated.md`
- `docs/devnet-canary.generated.md`
- `docs/devnet-resilience-report.md`
- `docs/fair-voting.md`

## Commands

- `npm run build:wallet-matrix`
- `npm run verify:wallet-matrix`
- `npm run build:devnet-canary`
- `npm run verify:devnet-canary`
- `npm run test:devnet:resilience`
- `npm run verify:devnet:resilience-report`
- `npm run verify:runtime-surface`
- `npm run verify:all`

## Notes

- This runtime evidence package is Devnet-focused and reviewer-visible.
- It does not replace real device QA across every wallet release and browser combination.
- It binds browser/runtime behavior to diagnostics, wallet matrix, canary, and resilience evidence in one summary.
