# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-25T04:33:22+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `45449a1a0eadf53847df04141e9158ad9f68b83c9ea96469aa121586389869a9`

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

- `Cargo.toml` | sha256 `30b256a478b15b9f03c3f8f6b49c16944dd14470f339a09a274619f14db7416e` | bytes `532`
- `Cargo.lock` | sha256 `e5d5c3f673ff85dd8ef7d2b56ce4465fd169c9176a0c3b57859fc13c7267198e` | bytes `164838`
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
