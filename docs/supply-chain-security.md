# Supply-Chain Security

PrivateDAO treats supply-chain review as part of protocol review, not as a separate afterthought.

## Scope

The repository publishes reviewer-visible evidence for:

- `Cargo.lock`
- `package-lock.json`
- `yarn.lock`
- `package.json`
- `Cargo.toml`
- `Anchor.toml`

These files define the dependency and toolchain surface that shapes builds, tests, scripts, and reviewer artifacts.

## Why It Matters

- Lockfiles reduce ambiguity between reviewed code and reproduced code.
- Toolchain manifests make dependency drift easier to detect.
- Cryptographic integrity over dependency artifacts helps reviewers verify that the evidence surface was not silently rewritten after generation.

## Current Boundary

- This repository publishes lockfile and manifest integrity evidence.
- It does not claim a complete SBOM for every transitive binary dependency outside these manifests.
- It does not replace external dependency auditing or registry compromise monitoring.

## Verification Commands

```bash
npm run build:supply-chain-attestation
npm run verify:supply-chain-attestation
npm run build:cryptographic-manifest
npm run verify:cryptographic-manifest
npm run verify:all
```

## Reviewer Artifacts

- `docs/supply-chain-attestation.generated.md`
- `docs/supply-chain-attestation.generated.json`
- `docs/cryptographic-manifest.generated.json`
- `docs/verification-gates.md`
