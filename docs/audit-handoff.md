# Audit Handoff

## Purpose

This document defines the package an external auditor, deep reviewer, or institutional diligence process should receive when reviewing PrivateDAO.

The goal is not to replace an audit. The goal is to reduce ambiguity and shorten the time required to understand the current protocol and its evidence surface.

## Recommended Handoff Order

Provide the following in this order:

1. repository commit hash under review
2. program id and deploy transaction
3. protocol specification
4. threat model
5. security coverage map
6. failure modes and replay analysis
7. baseline live devnet proof, dedicated V3 live proof, and release manifest
8. test files and independent verification guide
9. zk-enforced runtime package and verifier-boundary decision docs

## Canonical Repository Artifacts

### Protocol and security reasoning

- [protocol-spec.md](docs/protocol-spec.md)
- [threat-model.md](docs/threat-model.md)
- [security-review.md](docs/security-review.md)
- [security-coverage-map.md](docs/security-coverage-map.md)
- [failure-modes.md](docs/failure-modes.md)
- [replay-analysis.md](docs/replay-analysis.md)

### Live proof and release references

- [live-proof.md](docs/live-proof.md)
- [test-wallet-live-proof-v3.generated.md](docs/test-wallet-live-proof-v3.generated.md)
- [devnet-release-manifest.md](docs/devnet-release-manifest.md)
- [proof-registry.json](docs/proof-registry.json)

### Additive hardening V3 references

- [governance-hardening-v3.md](docs/governance-hardening-v3.md)
- [settlement-hardening-v3.md](docs/settlement-hardening-v3.md)
- [test-wallet-live-proof-v3.generated.json](docs/test-wallet-live-proof-v3.generated.json)

### Verification and test surfaces

- [independent-verification.md](docs/independent-verification.md)
- [private-dao.ts](tests/private-dao.ts)
- [full-flow-test.ts](tests/full-flow-test.ts)
- [demo.ts](tests/demo.ts)

### ZK-enforced escalation package

- [phase-c-hardening.md](docs/phase-c-hardening.md)
- [zk-verifier-strategy.md](docs/zk-verifier-strategy.md)
- [zk-enforced-threat-review.md](docs/zk-enforced-threat-review.md)
- [zk/enforced-runtime-evidence.md](docs/zk/enforced-runtime-evidence.md)
- [zk/enforced-runtime.generated.md](docs/zk/enforced-runtime.generated.md)
- [zk/enforced-operator-flow.md](docs/zk/enforced-operator-flow.md)
- [zk-external-audit-scope.md](docs/zk-external-audit-scope.md)
- [canonical-verifier-boundary-decision.md](docs/canonical-verifier-boundary-decision.md)

### Operations and production surfaces

- [mainnet-readiness.md](docs/mainnet-readiness.md)
- [production-operations.md](docs/production-operations.md)
- [monitoring-alerts.md](docs/monitoring-alerts.md)
- [incident-response.md](docs/incident-response.md)
- [mainnet-cutover-runbook.md](docs/mainnet-cutover-runbook.md)
- [operator-checklist.md](docs/operator-checklist.md)
- [risk-register.md](docs/risk-register.md)

## Questions The Handoff Should Answer

An effective handoff should let the reviewer answer:

- what the protocol does
- what state transitions are allowed
- what realistic exploit classes are covered
- what remains residual risk
- how the live devnet deployment maps to the repository
- how production rollout would be controlled

## Honest Boundary

This handoff package is intentionally strong on internal rigor.

It does not claim:

- external audit completion
- mainnet release completion
- live strategy PnL proof inside the protocol package itself
