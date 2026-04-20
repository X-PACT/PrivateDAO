# Supply-Chain Attestation

## Overview

- Generated at: `2026-04-20T01:24:20+02:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `6332c32952797fece01b67b03267ebf6f620d114bcd2682faf7dd88d4ff763fd`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `4`
- Dev dependencies: `14`
- Scripts: `276`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `263` packages
- npm lock: `package-lock.json` with lockfile version `3` and `346` packages
- Yarn lock: `yarn.lock` with `317` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `911d37f026a1616571de0831ef09e21db0dc88cdf0e04155a1088a4e09ff4824` | bytes `333`
- `Cargo.lock` | sha256 `3e1012b11909a5583f43c7d8c8110e71c4c8b363bf2b15b2553971e7074bbc8d` | bytes `74468`
- `Anchor.toml` | sha256 `457f9d356ca7532f52ec730f89e780624d6b2c840e139f04e3a1ec926ec94bf5` | bytes `552`
- `package.json` | sha256 `1e8ef221ca78e2e57a8921cbc85eedac79709e2667e10f1ca00c5334c43d4b33` | bytes `26620`
- `package-lock.json` | sha256 `e853eb2bdcb98bb4b6fcf9d25ca77c131348dfd3311f579455f9a73c9be9c261` | bytes `166992`
- `yarn.lock` | sha256 `58a2660a02495e975f9ded2f5b71d585707c9b2ce86587b8fcab95cd80f163e6` | bytes `94061`

## Review Commands

- `npm run build:supply-chain-attestation`
- `npm run verify:supply-chain-attestation`
- `npm run build:cryptographic-manifest`
- `npm run verify:cryptographic-manifest`
- `npm run verify:all`

## Notes

- Lockfile integrity is reviewer-visible and machine-verified.
- This attestation does not replace external dependency auditing.
- The current posture remains classical-cryptography based rather than post-quantum.
