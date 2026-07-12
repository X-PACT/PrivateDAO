# Blind Verification Commercial Security Test Package

This package is for an independent security assessment of the commercial,
self-hosted Blind Verification Engine. It is intentionally internal and must
not be published as customer documentation.

## Scope

- Local web application and workflow state transitions.
- Circom/WASM witness generation and local Groth16 proving.
- Proof verification, receipt creation, replay prevention, expiry, and policy
  version binding.
- License activation, Ed25519 verification, installation binding, seat and
  organization limits, revocation, grace-period behavior, and read-only mode.
- SQLite/PostgreSQL persistence, backup/restore, retention, and concurrent
  access.
- OIDC/RBAC enforcement on every mutating endpoint.
- Control-plane boundary: only license metadata may leave the deployment;
  private inputs, witnesses, raw records, and subject identity must not leave.
- Commercial payment order state machine: unique order, exact PDAO Token-2022
  mint, exact atomic amount, treasury destination, memo, finality,
  confirmation threshold, expiry, and transaction replay protection.
- Docker image, Compose deployment, installer, upgrade, backup, and restore.

## Out of scope

- Security of customer-owned identity providers, Solana RPC providers, AWS
  account administration, or customer host kernels.
- Economic or legal correctness of customer policies.
- Protection against a customer with unrestricted root access to their own
  deployment. The product uses signed licenses and server-side gates, but no
  delivered software can be made impossible to reverse engineer.

## Required test evidence

1. Positive and negative proof cases for every enabled plugin.
2. Tampered public signals, proof, commitments, receipt, policy version,
   circuit version, and verification key.
3. Wrong-plugin, malformed witness, overflow, under-constrained, replayed, and
   expired proof cases.
4. License signature, key-id rotation, installation mismatch, revoked license,
   expired license, offline grace, and read-only transition.
5. Viewer/operator/compliance/auditor/admin authorization matrix with direct
   HTTP calls, not UI-only checks.
6. Payment tests for wrong mint, wrong treasury, wrong amount, missing memo,
   insufficient confirmations, failed transaction, expired order, duplicate
   signature, and Token-2022 transfer parsing.
7. Egress capture proving private inputs and witness bytes do not reach the
   control plane, logs, telemetry, crash reports, or package downloads.
8. Dependency, container, image, secret, and SBOM scans.

## Local gates

```bash
npm run private-engine:preflight
npm run private-engine:test:plugins
npm run private-engine:test:adversarial
npm run private-engine:test:rbac
npm run commercial:test:lifecycle
npm run typecheck
npm audit --omit=dev --audit-level=high
```

Production signing must use AWS KMS with `ECC_NIST_EDWARDS25519` and
`ED25519_SHA_512`. The customer image must contain only the public key ring;
the KMS private key must never be exported or packaged.

## Release blockers

- Any failed negative proof test.
- Any private-input egress or log capture.
- Any mutating endpoint reachable by an unauthorized role.
- Any payment accepted without exact mint, amount, treasury, memo, and finality.
- Any license accepted without a valid signature or after grace expiry.
- Any production build, dependency scan, or artifact integrity check that is
  incomplete.
