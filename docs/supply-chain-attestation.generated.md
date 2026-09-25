# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-25T06:11:54+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `27b97e483f893afd2470aec7944aa4560f59a4239900f321a12c3b7b80eaee77`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `16`
- Dev dependencies: `15`
- Scripts: `361`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `590` packages
- npm lock: `package-lock.json` with lockfile version `3` and `621` packages
- Yarn lock: `yarn.lock` with `599` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `30b256a478b15b9f03c3f8f6b49c16944dd14470f339a09a274619f14db7416e` | bytes `532`
- `Cargo.lock` | sha256 `e5d5c3f673ff85dd8ef7d2b56ce4465fd169c9176a0c3b57859fc13c7267198e` | bytes `164838`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `daa2dc40c0075add3277bb3b440e0ff1139e0f9d0dc8ca51399525511dc0ce75` | bytes `35294`
- `yarn.lock` | sha256 `a761df66777ef913e3598acba11603d8eec3d77a07855ddadaad40e259f22f7a` | bytes `193403`
- `package-lock.json` | sha256 `5b52a5eb0aeccd047d7fa2eb58972d705405e702d027a3990589dd561de39fab` | bytes `316495`

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
