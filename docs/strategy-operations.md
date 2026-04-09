# Strategy Operations

## Purpose

This document explains the concrete operating model PrivateDAO is meant to control in a real USDC-denominated Solana strategy stack.

PrivateDAO is not presented here as the alpha engine itself. It is the governance and risk-control plane for high-impact strategy actions that should not leak decision intent before execution.

## Target Strategy Shape

The strongest operational fit for the current repository is a USDC-based strategy with:

- base asset: `USDC`
- target profile: basis, delta-neutral, or funding-rate capture
- rolling tenor: `3 months`
- non-disallowed yield sources
- governance-gated overrides for high-risk actions

The current repository is therefore best understood as:

`strategy engine or adaptor` -> `PrivateDAO approval + risk control` -> `timelocked treasury execution`

## What PrivateDAO Governs

PrivateDAO is intended to govern actions such as:

- enabling or disabling a strategy sleeve
- tightening or loosening leverage constraints
- adjusting maximum position size
- adjusting venue exposure caps
- approving emergency de-risking
- approving treasury movements related to strategy operation
- changing delegated operational authority

These are the kinds of decisions that can become gameable if they are visible before execution.

## What Should Remain Automated

Routine low-risk actions should remain policy-driven or adaptor-driven when possible, for example:

- routine hedging inside pre-approved risk bounds
- ordinary daily rebalance inside pre-approved ranges
- low-impact inventory normalization

PrivateDAO is best used for decisions that change risk posture, treasury posture, or governance posture.

## Control Plane Lifecycle

The intended operations flow is:

1. operator identifies a non-routine strategy action
2. proposal is created on-chain with explicit execution intent
3. committee members commit votes privately
4. votes are revealed after the commit phase
5. proposal is finalized deterministically
6. passed proposal waits through timelock
7. treasury or control action executes on-chain

This means the action is:

- reviewable
- replay-resistant
- time-bounded
- externally auditable after the fact

## Example High-Impact Actions

### Example A — Tighten venue exposure

Use case:

- one venue becomes operationally unstable
- committee wants to reduce allowed exposure before public signaling creates further market pressure

PrivateDAO value:

- committee decision remains hidden during commit
- final action is still verifiable once revealed and executed

### Example B — Emergency treasury move

Use case:

- strategy operators want to move treasury funds to a safer execution path

PrivateDAO value:

- recipient binding
- timelocked execution
- explorer-verifiable transfer proof

### Example C — Risk override approval

Use case:

- strategy needs temporary rebalance tolerance change during market stress

PrivateDAO value:

- exact proposal lifecycle
- replay-resistant vote flow
- auditable final state

## Risk Parameters PrivateDAO Should Gate

The following parameters are natural candidates for PrivateDAO approval:

- max drawdown threshold
- max position size
- max venue exposure
- rebalance cadence changes
- emergency stop activation
- resumption after emergency stop
- strategy sleeve enablement
- treasury transfer approvals

## Evidence Review Path

Reviewers should validate strategy-control evidence in this order:

1. [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
2. [test-wallet-live-proof-v3.generated.md](/home/x-pact/PrivateDAO/docs/test-wallet-live-proof-v3.generated.md)
3. [ranger-strategy-documentation.md](/home/x-pact/PrivateDAO/docs/ranger-strategy-documentation.md)
4. [risk-policy.md](/home/x-pact/PrivateDAO/docs/risk-policy.md)
5. [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md)
6. [judge-technical-audit.md](/home/x-pact/PrivateDAO/docs/judge-technical-audit.md)

## Honest Boundary

What this repository proves today:

- private governance lifecycle is real on-chain
- treasury execution checks are real on-chain
- governance evidence is explorer-verifiable
- additive V3 governance and settlement hardening are Devnet-proven
- the operating model for a serious strategy control plane is concrete

What still depends on the paired strategy stack:

- live strategy returns
- strategy-side PnL
- venue-level execution history
- Drift-specific trade execution proof when applicable

This boundary is intentional and should be stated clearly in any submission.
