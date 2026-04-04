# Cryptographic Posture

PrivateDAO uses a layered cryptographic posture rather than a single primitive.

## Core Primitives

- `Ed25519` for wallet signatures and Solana transaction authorization
- `SHA-256` for commit-reveal vote commitments and artifact integrity manifests
- `Groth16 zk-SNARKs` for the current companion ZK layer
- `Token-2022` extensions for the `PDAO` token surface

## What Is Enforced Today

- Solana transaction authenticity is enforced by wallet signatures and on-chain account ownership checks.
- Commit-reveal integrity is enforced through `SHA-256` commitments and proposal-bound vote records.
- Reviewer-visible evidence integrity is enforced through the published cryptographic manifest in `docs/cryptographic-manifest.generated.json`.
- The current ZK layer proves bounded validity and consistency off-chain through Groth16 circuits, registries, transcripts, and attestation artifacts.

## What Is Not Claimed

- PrivateDAO does not currently claim post-quantum protection.
- The current ZK layer is not yet an on-chain verifier path.
- Groth16 trusted-setup assumptions still apply to the present companion stack.

## Transition Boundaries

- If PrivateDAO later adds on-chain proof verification, the verifier path and its cost model must be audited separately.
- If post-quantum migration is required in the future, the first transition targets would be:
  - artifact integrity hashing
  - off-chain proof system choice
  - long-lived signing and governance attestation surfaces

## Reviewer Commands

```bash
npm run build:cryptographic-manifest
npm run verify:cryptographic-manifest
npm run build:supply-chain-attestation
npm run verify:supply-chain-attestation
npm run verify:all
```

## Related Evidence

- `docs/cryptographic-integrity.md`
- `docs/cryptographic-manifest.generated.json`
- `docs/supply-chain-security.md`
- `docs/supply-chain-attestation.generated.json`
- `docs/zk-layer.md`
- `docs/zk-assumption-matrix.md`
