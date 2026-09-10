# Supply-Chain Attestation

## Overview

- Generated at: `2026-09-10T05:10:39+03:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `98a0ba84df8a5440bd18b4d05e7fc31d23fe3f49f6d6f1d62b7f3c90ea0f4bf6`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `13`
- Dev dependencies: `15`
- Scripts: `354`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `379` packages
- npm lock: `package-lock.json` with lockfile version `3` and `787` packages
- Yarn lock: `yarn.lock` with `564` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `3b803b59456219a923ea3a4969ffc49afbc16249a14e5af78708798fd092d469` | bytes `490`
- `Cargo.lock` | sha256 `c9cb17d3d23f402a5cb21c9ef7f8e69de37427f0b307a9fd9bafc7fd3fb803ca` | bytes `108640`
- `Anchor.toml` | sha256 `1394f6f58180033c5e9184c0ee4fee1f080be78e9ee67ad92b69255c6a0ec964` | bytes `963`
- `package.json` | sha256 `360ec092afe8fd378edcd5b5c0e849e145c261740eed71b869f6cd04b1d34a48` | bytes `34282`
- `yarn.lock` | sha256 `260e070c8464a452faf02bc411378316fe4de3f2a99d75391fe3fa15faf0bac1` | bytes `184244`
- `package-lock.json` | sha256 `6b237d39e93cff3cf50f1345de3a2443241fc6a8927206a68f535a5970151366` | bytes `436359`

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
