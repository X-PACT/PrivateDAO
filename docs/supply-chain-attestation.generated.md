# Supply-Chain Attestation

## Overview

- Generated at: `2026-04-05T02:02:02+02:00`
- Hash algorithm: `sha256`
- Package manager surface: `npm+yarn`
- Aggregate sha256: `85b9def26392be5edada1c3a2b2c5504f7406c3d9bd9d08e898d04ca1532190b`

## Top-Level Package Surface

- Package name: `private-dao`
- Package version: `0.3.0`
- Dependencies: `4`
- Dev dependencies: `11`
- Scripts: `113`

## Lockfile Coverage

- Cargo lock: `Cargo.lock` with `261` packages
- npm lock: `package-lock.json` with lockfile version `3` and `282` packages
- Yarn lock: `yarn.lock` with `279` entries

## Tracked Integrity Files

- `Cargo.toml` | sha256 `640c9cc62126b4941cfaac25948b97fe0b647d222fa536c0fa7552dd63020397` | bytes `293`
- `Cargo.lock` | sha256 `73278757b13fe13b970c0bd43762c2f4892bbbdc7b6dcb83cd804a3cc060a30f` | bytes `72270`
- `Anchor.toml` | sha256 `d84e132434198b94422709ae488fde7eb7ed6f1b52fca77d09723cc9faa8e8d0` | bytes `472`
- `package.json` | sha256 `a71335af88b69be66bf43b4c6fea39282b1ade55ac3b5852158a8d34176d737a` | bytes `9801`
- `package-lock.json` | sha256 `ff5a59452c1ac405f4814e3ba1302fbf57f5c84a3b0d99055292ae220e232fbf` | bytes `135402`
- `yarn.lock` | sha256 `52e1e1eebdc84fa4c4a44cd520638f3fd6daaf3eb1d7fd310ea70b310dc20b6b` | bytes `82517`

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
