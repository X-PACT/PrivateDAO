# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-25T06:32:21+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `ba620e3bd02ce9ba86b8e0d399a4a0107630952353ce8d16f3a2689d3239ce7d`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `16`
- Dev dependencies: `15`
- Scripts: `361`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `590` packages
- npm lock: `package-lock.json` with lockfile version `3` and `621` packages
- Yarn lock: `yarn.lock` with `584` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `30b256a478b15b9f03c3f8f6b49c16944dd14470f339a09a274619f14db7416e` | bytes `532`
- `Cargo.lock` | sha256 `e5d5c3f673ff85dd8ef7d2b56ce4465fd169c9176a0c3b57859fc13c7267198e` | bytes `164838`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `d07f9bfec5feced2eb94fefc266fdc5d62497109ecff5b667e5b26b7a5a649a2` | bytes `35550`
- `yarn.lock` | sha256 `d5beb1f2f677016c69b265269703912b4c77cfc4670786ccc42014bd5521a590` | bytes `189199`
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
