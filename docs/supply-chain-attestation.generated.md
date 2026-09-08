# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-08T13:14:42+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `a74669af8bdbd2ce9730fbb5d4d080386ca98fcac3c701d679d773d96a313e8d`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `12`
- Dev dependencies: `15`
- Scripts: `340`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `379` packages
- npm lock: `package-lock.json` with lockfile version `3` and `781` packages
- Yarn lock: `yarn.lock` with `561` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `3b803b59456219a923ea3a4969ffc49afbc16249a14e5af78708798fd092d469` | bytes `490`
- `Cargo.lock` | sha256 `c9cb17d3d23f402a5cb21c9ef7f8e69de37427f0b307a9fd9bafc7fd3fb803ca` | bytes `108640`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `d303c580aab6bd31001ef536f7030b2ea614aaa8582fb1fcd638bc37cc15811d` | bytes `32923`
- `package-lock.json` | sha256 `029c84f1075ecdadd0dce4b15eb0632e369032412966ccbf3d13445094824737` | bytes `434047`
- `yarn.lock` | sha256 `aa31ed1a714a391c18b4b8792e01a253b3e4a4b7fc3941e69925a722fd75552b` | bytes `183491`

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
