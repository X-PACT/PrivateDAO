# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-24T18:16:18+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `8b0cccdf505c8bd51be5b4f14685cd51c1a67185ecc3c912d777183a5c712f77`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `19`
- Dev dependencies: `15`
- Scripts: `361`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `590` packages
- npm lock: `package-lock.json` with lockfile version `3` and `941` packages
- Yarn lock: `yarn.lock` with `695` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `fb69dc1f2b9785bc0d0a6127e3efa98e5ae1c1aec54d7657b9752041a8c76260` | bytes `532`
- `Cargo.lock` | sha256 `7476f3b9b9d7d9f4e66610076d6ef9f4101f37efac5e603449ccfd561bc679b0` | bytes `164868`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `30a66a42279c7957f8781630b9202d1ae3cc0de08099a9cebb06619b439fb0f2` | bytes `35398`
- `yarn.lock` | sha256 `079c1280a57256624ed6565d32b574f6472d05b3e505d86e12f2d756a8e6bbaa` | bytes `233913`
- `package-lock.json` | sha256 `f1d3b86c0c6de4a8ac590e1c547b9dbb00dfc910930ffa6a223c9b4ae99cd77b` | bytes `523225`

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
