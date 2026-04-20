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

- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [test-wallet-live-proof-v3.generated.md](/home/x-pact/PrivateDAO/docs/test-wallet-live-proof-v3.generated.md)
- [devnet-release-manifest.md](/home/x-pact/PrivateDAO/docs/devnet-release-manifest.md)
- [independent-verification.md](/home/x-pact/PrivateDAO/docs/independent-verification.md)
- [governance-hardening-v3.md](/home/x-pact/PrivateDAO/docs/governance-hardening-v3.md)
- [settlement-hardening-v3.md](/home/x-pact/PrivateDAO/docs/settlement-hardening-v3.md)

### Security and audit

- [security-review.md](/home/x-pact/PrivateDAO/docs/security-review.md)
- [threat-model.md](/home/x-pact/PrivateDAO/docs/threat-model.md)
- [security-coverage-map.md](/home/x-pact/PrivateDAO/docs/security-coverage-map.md)
- [failure-modes.md](/home/x-pact/PrivateDAO/docs/failure-modes.md)
- [replay-analysis.md](/home/x-pact/PrivateDAO/docs/replay-analysis.md)
- [judge-technical-audit.md](/home/x-pact/PrivateDAO/docs/judge-technical-audit.md)

### Operations and production discipline

- [mainnet-readiness.md](/home/x-pact/PrivateDAO/docs/mainnet-readiness.md)
- [production-operations.md](/home/x-pact/PrivateDAO/docs/production-operations.md)
- [monitoring-alerts.md](/home/x-pact/PrivateDAO/docs/monitoring-alerts.md)
- [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md)

### Strategy and submission fit

- [ranger-strategy-documentation.md](/home/x-pact/PrivateDAO/docs/ranger-strategy-documentation.md)
- [strategy-operations.md](/home/x-pact/PrivateDAO/docs/strategy-operations.md)
- [risk-policy.md](/home/x-pact/PrivateDAO/docs/risk-policy.md)
- [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md)

## Source Code Surfaces

- [lib.rs](/home/x-pact/PrivateDAO/programs/private-dao/src/lib.rs)
- [private-dao.ts](/home/x-pact/PrivateDAO/tests/private-dao.ts)
- [full-flow-test.ts](/home/x-pact/PrivateDAO/tests/full-flow-test.ts)
- [demo.ts](/home/x-pact/PrivateDAO/tests/demo.ts)

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
