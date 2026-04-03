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
7. live devnet proof and release manifest
8. test files and independent verification guide

## Canonical Repository Artifacts

### Protocol and security reasoning

- [protocol-spec.md](/home/x-pact/PrivateDAO/docs/protocol-spec.md)
- [threat-model.md](/home/x-pact/PrivateDAO/docs/threat-model.md)
- [security-review.md](/home/x-pact/PrivateDAO/docs/security-review.md)
- [security-coverage-map.md](/home/x-pact/PrivateDAO/docs/security-coverage-map.md)
- [failure-modes.md](/home/x-pact/PrivateDAO/docs/failure-modes.md)
- [replay-analysis.md](/home/x-pact/PrivateDAO/docs/replay-analysis.md)

### Live proof and release references

- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [devnet-release-manifest.md](/home/x-pact/PrivateDAO/docs/devnet-release-manifest.md)
- [proof-registry.json](/home/x-pact/PrivateDAO/docs/proof-registry.json)

### Verification and test surfaces

- [independent-verification.md](/home/x-pact/PrivateDAO/docs/independent-verification.md)
- [private-dao.ts](/home/x-pact/PrivateDAO/tests/private-dao.ts)
- [full-flow-test.ts](/home/x-pact/PrivateDAO/tests/full-flow-test.ts)
- [demo.ts](/home/x-pact/PrivateDAO/tests/demo.ts)

### Operations and production surfaces

- [mainnet-readiness.md](/home/x-pact/PrivateDAO/docs/mainnet-readiness.md)
- [production-operations.md](/home/x-pact/PrivateDAO/docs/production-operations.md)
- [monitoring-alerts.md](/home/x-pact/PrivateDAO/docs/monitoring-alerts.md)
- [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md)
- [mainnet-cutover-runbook.md](/home/x-pact/PrivateDAO/docs/mainnet-cutover-runbook.md)
- [operator-checklist.md](/home/x-pact/PrivateDAO/docs/operator-checklist.md)
- [risk-register.md](/home/x-pact/PrivateDAO/docs/risk-register.md)

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
