# Mainnet Acceptance Matrix

## Overview

- project: `PrivateDAO`
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- generated at: `2026-04-06T03:03:28.511Z`
- acceptance decision: `repository-strong-but-external-blockers-remain`
- accepted in repo: `8`
- pending external: `2`
- not in repo: `1`
- runtime wallet count in evidence package: `5`

## Acceptance Rows

### governance-lifecycle

- status: `accepted-in-repo`
- rationale: The lifecycle is live on Devnet and is covered by deterministic tests and published proof surfaces.
- evidence:
  - `docs/live-proof.md`
  - `docs/load-test-report.md`
  - `tests/full-flow-test.ts`

### security-reasoning

- status: `accepted-in-repo`
- rationale: Threats, replay, and failure behavior are documented and tied to tests and gates.
- evidence:
  - `docs/security-review.md`
  - `docs/threat-model.md`
  - `docs/replay-analysis.md`

### cryptographic-integrity

- status: `accepted-in-repo`
- rationale: Reviewer artifacts and top-level dependency manifests are sha256-bound and drift-checked.
- evidence:
  - `docs/cryptographic-manifest.generated.json`
  - `docs/supply-chain-attestation.generated.json`

### zk-companion-stack

- status: `accepted-in-repo`
- rationale: Groth16 companion proofs are generated, verified, transcript-backed, and explicitly bounded as off-chain.
- evidence:
  - `docs/zk-attestation.generated.json`
  - `docs/zk-transcript.generated.md`
  - `docs/zk-registry.generated.json`

### token-surface

- status: `accepted-in-repo`
- rationale: The PDAO token surface is attested, metadata-backed, and aligned with the canonical Devnet proof package.
- evidence:
  - `docs/pdao-token.md`
  - `docs/pdao-attestation.generated.json`
  - `docs/assets/pdao-token.json`

### runtime-and-resilience

- status: `accepted-in-repo`
- rationale: The repository proves runtime diagnostics, full lifecycle execution, RPC fallback, stale-blockhash recovery, and collision handling on Devnet.
- evidence:
  - `docs/operational-evidence.generated.md`
  - `docs/runtime-evidence.generated.md`
  - `docs/devnet-canary.generated.md`
  - `docs/devnet-resilience-report.md`

### release-discipline

- status: `accepted-in-repo`
- rationale: Release gating, artifact freshness, and simulated cutover traces are all reviewer-visible and automated.
- evidence:
  - `docs/release-ceremony-attestation.generated.md`
  - `docs/release-drill.generated.md`
  - `docs/review-automation.md`

### real-device-wallet-qa

- status: `pending-external`
- rationale: Support surfaces are documented and the real-device capture intake is enforced, but live device/browser evidence still has to be collected externally.
- evidence:
  - `docs/real-device-runtime.md`
  - `docs/real-device-runtime.generated.md`
  - `docs/wallet-compatibility-matrix.generated.md`
  - `docs/external-readiness-intake.md`

### external-audit

- status: `pending-external`
- rationale: The repository cannot fabricate an external audit outcome.
- evidence:
  - `docs/mainnet-readiness.generated.md`
  - `docs/external-readiness-intake.md`

### mainnet-rollout

- status: `accepted-in-repo`
- rationale: Mainnet execution remains intentionally blocked until external prerequisites are resolved.
- evidence:
  - `docs/go-live-attestation.generated.json`
  - `docs/mainnet-cutover-runbook.md`
  - `docs/operator-checklist.md`

### strategy-engine-and-live-performance

- status: `not-in-repo`
- rationale: The repository does not claim a production strategy engine or live performance layer.
- evidence:
  - `docs/mainnet-readiness.generated.md`

## Interpretation

This matrix separates what PrivateDAO can already prove inside the repository from what still requires external completion. It is meant to make mainnet-readiness discussions precise rather than implied.
