# Ranger Strategy Documentation

## One-line thesis

PrivateDAO is the private governance and risk-control layer for a USDC-based Solana vault strategy, designed to let operators approve rebalances, risk parameter changes, and emergency actions without leaking live decision intent before execution.

PrivateDAO now combines protocol hardening, zero-knowledge proof surfaces, and a published cryptographic artifact integrity layer so reviewers can validate not only the protocol logic, but also the integrity of the evidence package itself.

## Why this fits Ranger

Ranger is looking for production-ready vault strategies with:

- a real edge
- explicit risk management
- realistic deployment viability
- verifiable on-chain behavior during the build window

PrivateDAO does not claim to be a complete vault strategy engine by itself. Its role is the control layer that makes a serious vault operation safer to run:

- private committee approval for strategy actions
- timelocked execution discipline
- veto and cancellation paths
- auditable on-chain proposal lifecycle
- explorer-verifiable governance proof

For Ranger and Drift, the winning framing is not "generic DAO tooling". The winning framing is:

**vault operations with private governance and risk approval on Solana**

## Recommended strategy direction

The strongest fit for this repository is a USDC-denominated strategy stack with:

- USDC as the vault base asset
- a yield source that avoids disallowed structures
- explicit drawdown controls
- explicit position sizing limits
- explicit rebalance rules
- governance-gated overrides for high-impact actions

The most credible path is:

1. a concrete strategy engine or adaptor generates the trading/yield actions
2. PrivateDAO governs parameter changes, sensitive approvals, and emergency controls
3. operators and judges can verify both governance state and transaction history on-chain

## Current contribution from this repository

What exists today and is already valuable for a Ranger submission:

- Solana program enforcing a real governance lifecycle
- commit-reveal voting to avoid live signaling
- proposal creation by real governance token holders
- timelocked execution
- treasury recipient and token-mint checks
- delegation and keeper-assisted reveal
- live devnet proof with explorer-linked transactions
- web surface and Android-native surface for evaluator review

This means the repository already solves a real institutional problem:

**who gets to approve sensitive strategy actions, and how those approvals avoid leaking intent before execution**

## Risk management model

### Drawdown discipline

PrivateDAO should gate any strategy parameter changes that materially affect:

- leverage
- hedge ratio
- rebalance cadence
- max position size
- allowable venue exposure

### Position sizing

Recommended competitive framing:

- hard caps per position
- hard caps per venue
- hard caps per strategy sleeve
- emergency governance path for reducing risk, not only increasing it

### Rebalancing

The strongest submission narrative is:

- routine rebalances can be policy-driven
- non-routine risk changes require governance approval
- emergency veto remains available before execution

### Operational safety

PrivateDAO contributes:

- hidden tally during approval formation
- deterministic reveal
- deterministic finalize
- timelocked execution
- explicit treasury/account validation

## On-chain verification plan

For Ranger judging, the required proof surface should include:

1. the wallet or vault address used during the hackathon window
2. the governance program and proposal addresses
3. transaction links for:
   - proposal creation
   - vote commit
   - vote reveal
   - finalize
   - execute
4. strategy-side transaction history for the same build window

This repository already ships the governance half of that proof surface through:

- `docs/live-proof.md`
- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/governance-hardening-v3.md`
- `docs/settlement-hardening-v3.md`
- Proof Center in the published root Next.js surface
- Explorer-linked proposal activity

## What remains before claiming full Ranger strategy completeness

These items should be stated honestly in the submission:

- a concrete USDC vault strategy implementation or adaptor layer
- strategy-specific performance evidence
- live or backtested APY evidence
- strategy-level drawdown and rebalancing metrics
- Drift-specific execution proof if competing on the Drift Side Track

That is not a weakness if stated correctly. It is better than pretending the current repository already contains a seeded vault strategy when it does not.

## Winning submission angle

The strongest competitive positioning is:

PrivateDAO is not the vault strategy alone. It is the control plane that makes a real Ranger or Drift strategy safer, less gameable, and more institutionally credible.

That gives the project a differentiated role:

- not just alpha generation
- not just governance theater
- but private approval infrastructure for real strategy operations on Solana
