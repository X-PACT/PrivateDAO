# Reviewer Surface Map

## Purpose

This document maps the fastest reviewer entry points to the repository surfaces they are expected to verify.

The goal is to reduce review drift between:

- the README
- the frontend Proof Center
- Judge Mode
- the security documents
- the live Devnet evidence

## Fastest Path For A Judge

If a reviewer has only a few minutes, the strongest order is:

1. open the live frontend
2. open Judge Mode
3. open the Security page
4. open the Proof Center
5. inspect the dedicated V3 proof packet when the stricter additive path matters
6. inspect the canonical Devnet manifest
7. inspect the security review set
8. inspect the end-to-end test files

## Frontend Entry Points

- Live app: `https://privatedao.org/`
- Proof Center: `https://privatedao.org/proof/`
- Judge Mode: `https://privatedao.org/proof/?judge=1`
- Security page: `https://privatedao.org/security/`

## Canonical Documents Behind Those Surfaces

### Product and proof

- [live-proof.md](docs/live-proof.md)
- [test-wallet-live-proof-v3.generated.md](docs/test-wallet-live-proof-v3.generated.md)
- [devnet-release-manifest.md](docs/devnet-release-manifest.md)
- [independent-verification.md](docs/independent-verification.md)
- [governance-hardening-v3.md](docs/governance-hardening-v3.md)
- [settlement-hardening-v3.md](docs/settlement-hardening-v3.md)

### Security and audit

- [security-review.md](docs/security-review.md)
- [threat-model.md](docs/threat-model.md)
- [security-coverage-map.md](docs/security-coverage-map.md)
- [failure-modes.md](docs/failure-modes.md)
- [replay-analysis.md](docs/replay-analysis.md)
- [judge-technical-audit.md](docs/judge-technical-audit.md)

### Operations and production discipline

- [mainnet-readiness.md](docs/mainnet-readiness.md)
- [production-operations.md](docs/production-operations.md)
- [monitoring-alerts.md](docs/monitoring-alerts.md)
- [incident-response.md](docs/incident-response.md)

### Strategy and submission fit

- [ranger-strategy-documentation.md](docs/ranger-strategy-documentation.md)
- [strategy-operations.md](docs/strategy-operations.md)
- [risk-policy.md](docs/risk-policy.md)
- [ranger-submission-bundle.generated.md](docs/ranger-submission-bundle.generated.md)

## Source Code Surfaces

- [lib.rs](programs/private-dao/src/lib.rs)
- [private-dao.ts](tests/private-dao.ts)
- [full-flow-test.ts](tests/full-flow-test.ts)
- [demo.ts](tests/demo.ts)

## Verification Gates

- `npm run verify:live-proof`
- `npm run verify:release-manifest`
- `npm run verify:review-surface`
- `npm run check:mainnet`

## Honest Boundary

This map improves reviewer speed and consistency.

It does not replace:

- external audit judgment
- live strategy-performance verification
- production mainnet rollout execution

The `V3` packet improves reviewer coverage for the additive hardening path, but it does not upgrade the repository's launch boundary beyond Devnet proof and explicitly documented pending-external steps.
