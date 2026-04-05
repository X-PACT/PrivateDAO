# Runtime Evidence Package

## Overview

- Generated at: `2026-04-05T12:30:17.510Z`
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

## Real-Device Runtime Intake

- Status: `pending-real-device-capture`
- Target count: `5`
- Completed target count: `0`
- Successful connect count: `0`
- Successful submission count: `0`
- Diagnostics capture count: `0`
- Pending targets: `Phantom, Solflare, Backpack, Glow, Android Native / Mobile`

## Operational Summary

- Canonical wallet count: `50`
- Canonical tx count: `223`
- ZK proof count: `7`
- Adversarial scenarios: `50`
- Unexpected adversarial successes: `0`
- Finalize single-winner: `true`
- Execute single-winner: `true`
- Failover recovered: `true`
- Stale blockhash recovered: `true`

## Runtime Documents

- `docs/wallet-runtime.md`
- `docs/real-device-runtime.md`
- `docs/real-device-runtime-captures.json`
- `docs/real-device-runtime.generated.md`
- `docs/real-device-runtime.generated.json`
- `docs/runtime-attestation.generated.json`
- `docs/operational-evidence.generated.md`
- `docs/operational-evidence.generated.json`
- `docs/wallet-compatibility-matrix.generated.md`
- `docs/devnet-canary.generated.md`
- `docs/devnet-resilience-report.md`
- `docs/fair-voting.md`

## Commands

- `npm run build:operational-evidence`
- `npm run verify:operational-evidence`
- `npm run build:wallet-matrix`
- `npm run verify:wallet-matrix`
- `npm run build:real-device-runtime`
- `npm run verify:real-device-runtime`
- `npm run build:devnet-canary`
- `npm run verify:devnet-canary`
- `npm run test:devnet:resilience`
- `npm run verify:devnet:resilience-report`
- `npm run verify:runtime-surface`
- `npm run verify:all`

## Notes

- This runtime evidence package is Devnet-focused and reviewer-visible.
- It does not replace real device QA across every wallet release and browser combination.
- It binds browser/runtime behavior to diagnostics, wallet matrix, canary, resilience evidence, and real-device capture intake in one summary.
