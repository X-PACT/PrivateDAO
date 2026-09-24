# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-24T23:24:07+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `abf13bc302a89e3e2b5afa925b0e125c4a6b18d9abed8d5df1ba567647cb2ce4`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `17`
- Dev dependencies: `15`
- Scripts: `361`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `590` packages
- npm lock: `package-lock.json` with lockfile version `3` and `793` packages
- Yarn lock: `yarn.lock` with `693` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `fb69dc1f2b9785bc0d0a6127e3efa98e5ae1c1aec54d7657b9752041a8c76260` | bytes `532`
- `Cargo.lock` | sha256 `7476f3b9b9d7d9f4e66610076d6ef9f4101f37efac5e603449ccfd561bc679b0` | bytes `164868`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `88263d0bd6b74774c130f4c33b754535b90d382492054f6ea285bd0d03708e19` | bytes `35334`
- `yarn.lock` | sha256 `3366f599b1db71b9d94e82572179f0d0c0f9fd3824fdcfde381182ab45906508` | bytes `233377`
- `package-lock.json` | sha256 `50421349e68125fa7914ec7a11110bfec5f6b731eb2294db33d122a37329e908` | bytes `426187`

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
