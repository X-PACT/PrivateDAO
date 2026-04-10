# PrivateDAO Cryptographic Confidence Engine

This document defines the product-facing scoring model that explains why one PrivateDAO proposal pattern is stronger, more private, or more reviewer-complete than another.

It is intentionally **truth-aligned**.

It is **not**:

- a claim of impossible-to-break security
- a formal proof that the protocol cannot fail
- a substitute for external audit closure or production custody evidence

It is a deterministic scoring layer that combines the repository's real surfaces:

- `ZK`
- `REFHE`
- `MagicBlock`
- `Fast RPC`
- `Governance Hardening V3`
- `Settlement Hardening V3`
- live proof packets
- audit and launch-boundary surfaces

## Why it exists

PrivateDAO now exposes many strong primitives, but they do not all contribute in the same way for every proposal.

Examples:

- a confidential payroll flow benefits heavily from `REFHE`
- a gaming rewards corridor benefits heavily from `MagicBlock`
- a grant committee flow benefits more from `ZK` and reviewer proof surfaces than from encrypted payout envelopes

The engine makes those differences visible instead of pretending that every proposal has the same cryptographic posture.

## The four dimensions

The engine scores four dimensions and combines them into a single `0-100` score.

| Dimension | Weight | Meaning |
| --- | ---: | --- |
| Privacy depth | `28%` | How strongly the proposal path reduces intent leakage and protects private signal collection |
| Enforcement depth | `28%` | How strongly policy snapshots, settlement rules, and proof anchors constrain the path |
| Execution integrity | `24%` | How strongly runtime evidence and bounded execution surfaces support correct execution |
| Reviewer confidence | `20%` | How easy it is for a reviewer to inspect proof, trust, and launch-boundary evidence |

## The factor model

### Privacy depth

- `Commit-reveal voting`
- `ZK review overlay`
- `REFHE confidential envelope`
- `Proposal-bound proof anchors`

### Enforcement depth

- `Governance Hardening V3`
- `Settlement Hardening V3`
- `Proposal-bound proof anchors`
- `MagicBlock settlement evidence`
- `REFHE execution boundary`

### Execution integrity

- `Fast RPC indexed runtime`
- `MagicBlock corridor evidence`
- `REFHE envelope readiness`
- `Baseline live proof`
- `Dedicated V3 proof`

### Reviewer confidence

- `Baseline live proof`
- `Dedicated V3 proof`
- `Audit packet`
- `Launch boundary remains explicit`

## Formula

For each dimension:

1. Add the weights of the active factors
2. Divide by the total factor weight for that dimension
3. Convert that ratio to a `0-100` dimension score

Then compute the total:

```text
total =
  privacyDepth * 0.28 +
  enforcementDepth * 0.28 +
  executionIntegrity * 0.24 +
  reviewerConfidence * 0.20
```

The result is rounded to the nearest integer.

## Interactive policy composer

The Next.js security surface includes an interactive composer that lets the operator or reviewer toggle:

- `Commit-reveal`
- `ZK review`
- `Proposal-bound proof anchors`
- `Governance V3`
- `Settlement V3`
- `REFHE`
- `MagicBlock`
- `Fast RPC`
- `Live proof`
- `V3 proof`
- `Audit packet`
- `Explicit launch boundary`

This does not create any new protocol capability by itself.

It exists to answer a practical product question:

> if we enable or disable one of these rails, how much confidence do we lose, and in which dimension?

## Score bands

| Band | Range | Meaning |
| --- | --- | --- |
| `Advanced` | `80-100` | Strong multi-layer posture with explicit proof and execution boundaries |
| `Strong` | `62-79` | Good posture with meaningful hardening, but some dimensions remain lighter |
| `Foundational` | `<62` | Useful surface, but not enough depth to market as a high-confidence cryptographic path |

## Scenario reading

### Confidential payroll

High score because it combines:

- private voting
- `ZK` review overlay
- `REFHE` envelope
- `Governance V3`
- `Settlement V3`
- `Fast RPC`
- baseline + V3 proof

### Private grant committee

High reviewer confidence and privacy, but lower execution-integrity contribution from:

- no `REFHE` payout envelope
- no `MagicBlock` corridor evidence

### Gaming rewards corridor

Strong execution-integrity and settlement semantics from:

- `MagicBlock`
- `Settlement V3`
- `Fast RPC`

But lower privacy depth because this path usually does **not** use:

- `REFHE`
- `ZK` review overlay

## What the engine does not claim

The engine does **not** convert the project into any of the following if they are not already true:

- full on-chain verifier CPI
- anonymous private treasury execution
- hidden tally replacement
- mainnet custody completion
- audit sign-off completion
- impossible-to-exploit protocol behavior

## Reviewer shortcut

Use this engine together with:

1. [ZK Capability Matrix](/home/x-pact/PrivateDAO/docs/zk-capability-matrix.md)
2. [Governance Hardening V3](/home/x-pact/PrivateDAO/docs/governance-hardening-v3.md)
3. [Settlement Hardening V3](/home/x-pact/PrivateDAO/docs/settlement-hardening-v3.md)
4. [Live Proof V3](/home/x-pact/PrivateDAO/docs/test-wallet-live-proof-v3.generated.md)
5. [Launch Trust Packet](/home/x-pact/PrivateDAO/docs/launch-trust-packet.generated.md)

The engine is useful because it turns those surfaces into a single, explainable reading model instead of leaving them as disconnected documents.
