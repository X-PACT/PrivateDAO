# Submission Dossier

## Purpose

This document is the shortest serious handoff for a judge, grant reviewer, investor, or diligence process.

For public competition routing and packet choice during the current cycle, pair this file with [superteam-track-submission-matrix-2026.md](docs/superteam-track-submission-matrix-2026.md).

PrivateDAO now combines protocol hardening, zero-knowledge proof surfaces, and a published cryptographic artifact integrity layer so reviewers can validate not only the protocol logic, but also the integrity of the evidence package itself.

It ties together:

- what the protocol is
- what the strategy framing is
- what the security evidence is
- what the live proof is
- what the stablecoin treasury layer is
- what additive V3 hardening proves
- what remains outside the repo

## Core Identity

PrivateDAO is a governance security system for private, replay-resistant, treasury-safe decision flow on Solana.

Its strongest commercial role is:

the confidential governance, stablecoin treasury, and reviewer-readable execution layer for organizations that need payments, grants, payroll, gaming rewards, and treasury decisions to stay governed from the browser.

## What Is Proven Today

- on-chain governance lifecycle
- commit-reveal voting
- timelocked execution
- treasury validation
- replay and failure-mode reasoning
- live Solana Testnet proof
- PUSD stablecoin treasury and billing lanes
- dedicated Devnet proof for Governance Hardening V3 and Settlement Hardening V3
- canonical release manifest
- reviewer and operations verification gates
- web and Android-native review surfaces

## Strategy Package

- [investor-pitch-deck.md](docs/investor-pitch-deck.md)
- [ranger-strategy-documentation.md](docs/ranger-strategy-documentation.md)
- [strategy-blueprint.md](docs/strategy-blueprint.md)
- [strategy-adaptor-interface.md](docs/strategy-adaptor-interface.md)
- [strategy-operations.md](docs/strategy-operations.md)
- [risk-policy.md](docs/risk-policy.md)
- [performance-evidence.md](docs/performance-evidence.md)

## Security Package

- [security-review.md](docs/security-review.md)
- [threat-model.md](docs/threat-model.md)
- [security-coverage-map.md](docs/security-coverage-map.md)
- [failure-modes.md](docs/failure-modes.md)
- [replay-analysis.md](docs/replay-analysis.md)
- [governance-hardening-v3.md](docs/governance-hardening-v3.md)
- [settlement-hardening-v3.md](docs/settlement-hardening-v3.md)

## Live Proof Package

- [live-proof.md](docs/live-proof.md)
- [test-wallet-live-proof-v3.generated.md](docs/test-wallet-live-proof-v3.generated.md)
- [test-wallet-live-proof-v3.generated.json](docs/test-wallet-live-proof-v3.generated.json)
- [devnet-release-manifest.md](docs/devnet-release-manifest.md)
- [proof-registry.json](docs/proof-registry.json)
- [independent-verification.md](docs/independent-verification.md)

## Stablecoin Treasury Package

- [pusd-stablecoin-treasury-layer.md](docs/pusd-stablecoin-treasury-layer.md)
- [pricing-model.md](docs/pricing-model.md)
- [agentic-treasury-micropayment-rail.md](docs/agentic-treasury-micropayment-rail.md)
- [treasury-reviewer-packet.generated.md](docs/treasury-reviewer-packet.generated.md)

## Operations Package

- [mainnet-readiness.md](docs/mainnet-readiness.md)
- [production-operations.md](docs/production-operations.md)
- [monitoring-alerts.md](docs/monitoring-alerts.md)
- [incident-response.md](docs/incident-response.md)
- [mainnet-cutover-runbook.md](docs/mainnet-cutover-runbook.md)
- [operator-checklist.md](docs/operator-checklist.md)
- [risk-register.md](docs/risk-register.md)
- [audit-handoff.md](docs/audit-handoff.md)

## Unified Verification

The current repository can be closed and checked with:

```bash
npm run verify:all
```

## Honest Boundary

What still remains outside the current repository:

- live strategy engine and performance history
- external audit
- production mainnet rollout
- any protocol-v2 interface change intended to tighten currently documented operational guards

## Honest V3 Boundary

The additive `V3` path is now part of the repository's serious proof surface:

- `Governance Hardening V3` is Devnet-proven
- `Settlement Hardening V3` is Devnet-proven
- both remain additive and do not reinterpret legacy objects
- neither is presented as a production-custody or unrestricted-mainnet claim
