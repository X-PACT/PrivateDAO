# Strategy Blueprint

## Purpose

This document turns the current Ranger/Drift positioning into a concrete operating blueprint.

It does not pretend the repository already contains a full vault engine. It defines the exact strategy stack PrivateDAO is built to control, so reviewers can evaluate the system as real strategy infrastructure rather than generic governance.

## Target Strategy Profile

The strongest fit for PrivateDAO is a USDC-denominated market-neutral strategy stack with:

- base asset: `USDC`
- target profile: basis, delta-neutral, and funding-rate capture
- tenor: `3 months rolling`
- risk posture: capped drawdown, capped venue exposure, capped position size
- governance usage: non-routine approvals, emergency controls, risk overrides

## Strategy Layers

### 1. Strategy engine

The strategy engine is responsible for:

- deciding hedge ratios
- deciding rebalance timing inside allowed bands
- calculating target exposure
- selecting approved venues

This layer is where alpha or carry comes from.

### 2. Risk policy layer

The risk policy layer defines:

- maximum drawdown
- maximum position size
- maximum venue exposure
- emergency stop conditions
- rebalance constraints

PrivateDAO should govern changes to this layer.

### 3. Governance control layer

PrivateDAO is responsible for:

- private committee approval
- replay-resistant governance transitions
- timelocked execution
- treasury/account validation
- veto and cancellation before execution

This layer exists to make the strategy harder to manipulate socially or operationally.

## Approved Action Classes

The strategy stack should expose a limited set of governance-controlled actions:

- increase or reduce risk limits
- enable or disable a strategy sleeve
- modify venue exposure caps
- approve emergency de-risking
- approve treasury transfers tied to operations
- update delegate or committee authority

The point is not to govern every minor rebalance. The point is to govern the actions that materially change risk or treasury posture.

## Routine vs Non-Routine Actions

### Routine actions

These should remain policy-driven:

- ordinary hedge maintenance
- standard within-band rebalancing
- inventory normalization within approved thresholds

### Non-routine actions

These should be PrivateDAO-controlled:

- widening or tightening exposure bounds
- changing venue concentration
- enabling or disabling capital deployment
- approving emergency moves
- strategy sleeve activation or shutdown

## Why PrivateDAO Belongs Here

In this strategy design, public governance creates avoidable information leakage:

- committee intent becomes visible too early
- visible momentum can influence counterparties
- treasury-sensitive actions can be signaled before execution

PrivateDAO solves that by keeping approval formation private while keeping the lifecycle and execution reviewable.

## Competitive Framing

For Ranger and Drift, the strongest framing is:

PrivateDAO is the confidential risk-approval and treasury-control plane for a serious USDC strategy stack.

That is stronger than presenting it as a generic DAO tool because it ties governance privacy directly to:

- drawdown control
- venue control
- capital deployment discipline
- emergency operations

## Required Paired Evidence

To make this blueprint fully submission-complete, pair it with:

- [performance-evidence.md](/home/x-pact/PrivateDAO/docs/performance-evidence.md)
- [risk-policy.md](/home/x-pact/PrivateDAO/docs/risk-policy.md)
- [strategy-operations.md](/home/x-pact/PrivateDAO/docs/strategy-operations.md)
- [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md)

## Honest Boundary

This blueprint makes the intended strategy architecture explicit.

It does not claim that:

- a full trading adaptor is already implemented in this repository
- the strategy engine itself is already deployed
- strategy-side PnL is already proven by this file alone
