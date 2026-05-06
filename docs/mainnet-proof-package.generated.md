# Mainnet Proof Package

> Status note, 2026-05-06: this package is an archived generated readiness packet. The current Testnet reviewer surface is the Anchor 1.0.1 program `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva` plus the 2026-05-06 lifecycle rehearsal. It is not a production mainnet claim.

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-22T00:26:24.617Z`
- package decision: `repository-strong-but-external-blockers-remain`
- legacy program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- current Testnet program id: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- accepted in repo: `9`
- pending external: `3`
- not in repo: `1`

## Core Artifacts

- `docs/mainnet-readiness.generated.md`
- `docs/mainnet-acceptance-matrix.generated.md`
- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/governance-hardening-v3.md`
- `docs/settlement-hardening-v3.md`
- `docs/release-ceremony-attestation.generated.md`
- `docs/release-drill.generated.md`
- `docs/operational-evidence.generated.md`
- `docs/runtime-evidence.generated.md`
- `docs/runtime/real-device.generated.md`
- `docs/deployment-attestation.generated.json`
- `docs/go-live-attestation.generated.json`
- `docs/external-readiness-intake.md`

## Canonical Commands

- `npm run build:mainnet-readiness-report`
- `npm run build:mainnet-acceptance-matrix`
- `npm run build:mainnet-proof-package`
- `npm run verify:mainnet-readiness-report`
- `npm run verify:mainnet-acceptance-matrix`
- `npm run verify:mainnet-proof-package`
- `npm run verify:all`
- `bash scripts/check-mainnet-readiness.sh`

## Purpose

This package is the shortest reviewer-facing path for mainnet readiness discussions. It binds the readiness report, acceptance matrix, baseline and additive V3 proof surfaces, runtime package, release discipline, and honest external-intake boundary into one compact surface.
