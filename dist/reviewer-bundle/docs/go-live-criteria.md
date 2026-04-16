# Go-Live Criteria

This note defines the minimum release conditions PrivateDAO should satisfy before any mainnet cutover is treated as acceptable.

It is intentionally strict.

## Required Before Mainnet

- External audit findings must be reviewed and closed to an acceptable residual-risk level.
- Upgrade authority must be controlled by an explicit multisig or governance-owned authority path.
- Production monitoring, alert routing, and incident ownership must be assigned and tested.
- Release artifacts, proof surfaces, and generated attestations must all pass `npm run verify:all`.
- Wallet runtime checks must be exercised against real client environments, not only repository-side verification.
- The canonical place to track that work is `docs/runtime/real-device.generated.md`, backed by `docs/runtime/real-device-captures.json`.
- Treasury handling, operator responsibilities, and rollback or pause procedures must be documented and rehearsed.

## Blocking Conditions

Do not call the system mainnet-ready if any of the following remain true:

- `externalAudit` is still `pending`
- `mainnetRollout` is still `pending`
- strategy execution and live-performance surfaces remain outside repository scope
- runtime wallet behavior has not been validated in real signer environments
- generated review artifacts or cryptographic manifests are stale

## Internal Pass Conditions

The repository-side readiness surface is considered internally strong when all of the following hold:

- governance lifecycle is verified
- additive governance and settlement hardening V3 paths are Devnet-proven
- security reasoning is verified
- zk companion stack is verified
- reviewer surface is verified
- operations surface is verified
- proof registry, release manifest, readiness report, and deployment attestation remain consistent

## Canonical Commands

```bash
npm run build:mainnet-readiness-report
npm run build:deployment-attestation
npm run build:go-live-attestation
npm run verify:mainnet-readiness-report
npm run verify:deployment-attestation
npm run verify:go-live-attestation
npm run verify:all
```

## Decision Rule

PrivateDAO should only be described as ready for mainnet cutover when:

- all internal repository checks pass
- no blocking condition remains
- the external operational dependencies are completed in reality, not only documented

Until then, the correct state is:

- internally hardened
- reviewable
- devnet-proven
- not yet cleared for mainnet cutover
