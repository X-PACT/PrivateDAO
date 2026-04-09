# PrivateDAO Autonomous Executor

This document defines the **Zerion track adaptation** for PrivateDAO.

It is intentionally truth-aligned:

- `PrivateDAO` already implements the governance, privacy, settlement, and evidence layers described here.
- `Zerion CLI fork + Zerion API execution layer` is the required next implementation step for the bounty-specific submission.
- This page describes how the existing product maps into that execution model without pretending the Zerion fork is already complete inside this repository today.

## One-line product

**PrivateDAO Autonomous Executor** is a governance-controlled onchain agent:

- a DAO proposes an action
- members vote privately
- policy constraints are checked
- an execution agent runs one real onchain transaction through a Zerion CLI fork
- runtime evidence and receipts are attached back to the operating surface

## Why this fits the Zerion bounty

The Zerion track requires:

- a fork of `zeriontech/zerion-ai`
- an autonomous agent built on top of that fork
- at least one scoped policy
- at least one real onchain transaction
- all swaps routed through the Zerion API

PrivateDAO already contributes the missing decision and safety layer:

- private governance
- scoped approval flow
- proposal-bound execution readiness
- runtime evidence
- trust packaging

The Zerion fork then becomes the **wallet and execution engine**.

## Target architecture

```text
PrivateDAO governance layer
  -> Create DAO
  -> Submit proposal
  -> Private vote
  -> Finalize approval

Policy snapshot
  -> chain lock
  -> spend cap
  -> expiry window
  -> allowed actions

PrivateDAO Autonomous Executor
  -> watches finalized proposal
  -> validates policy snapshot
  -> builds execution intent
  -> calls Zerion CLI fork
  -> routes swap/bridge/rebalance through Zerion API
  -> stores receipt / proof / runtime evidence
```

## What PrivateDAO already contributes

### Governance control

- DAO bootstrap
- proposal lifecycle
- commit / reveal privacy
- timelocked execution
- cancellation and veto boundaries

### Privacy and review layers

- ZK companion proof path
- REFHE-bound confidential evaluation surface
- MagicBlock settlement-oriented runtime path
- reviewer-visible runtime evidence and manifests

### Policy shape

The agent can inherit proposal-bound policies such as:

- `chain lock`
- `spend cap`
- `expiry window`
- `allowlisted action type`
- `single proposal / single execution scope`

## What must be added for the Zerion submission

### 1. Fork Zerion CLI

Fork `zeriontech/zerion-ai` and treat it as the execution layer.

Required outcome:

- wallet and execution commands come from the Zerion fork
- the actual onchain swap or bridge is routed through Zerion API

### 2. Build the executor bridge

The bridge should:

- read the finalized PrivateDAO proposal
- normalize the execution intent
- enforce proposal-scoped policy
- trigger the Zerion execution command
- write execution evidence back to the operator surface

### 3. Define at least one scoped policy

Recommended first policy bundle:

- `chain = Base only`
- `action = swap only`
- `spend limit = 25 USDC`
- `expiry = 30 minutes`
- `single execution per approved proposal`

### 4. Execute one real transaction

Recommended bounty demo:

- proposal: "Swap 25 USDC into ETH"
- private vote
- finalize
- execute via Zerion fork
- show transaction hash, policy, and evidence

## How the existing technologies map into this agent

### ZK

Use ZK as a **privacy and review layer**:

- prove vote / delegation / tally integrity
- strengthen the approval path
- keep the agent from becoming a blind god-mode bot

### REFHE

Use REFHE as an **encrypted strategy input surface**:

- hidden parameters
- protected allocation logic
- confidential strategy review before execution

### MagicBlock

Use MagicBlock as a **Solana-side runtime and settlement evidence layer**:

- runtime responsiveness
- proposal-bound settlement signaling
- stronger operator evidence around execution readiness

### RPC Fast / read node

Use the read node and pooled RPC path for:

- proposal monitoring
- policy inspection
- execution readiness
- operator diagnostics
- reviewer exports

## Honest boundary

This repository does **not** currently claim:

- a completed Zerion fork
- a live Zerion-routed swap already executed from this repo
- a finished bounty submission

What it does claim:

- the governance, privacy, evidence, and policy layers already exist
- the product can be adapted cleanly into a governance-controlled autonomous executor
- the Zerion track is a strong fit because it gives the project a real execution engine on top of the existing governance brain

## Best demo narrative

1. Create DAO
2. Submit proposal
3. Private vote
4. Finalize
5. Show policy
6. Execute one real Zerion-routed transaction
7. Show tx hash and evidence packet

## Recommended repo split

Use this repository as:

- governance layer
- privacy layer
- evidence layer
- product interface

Use the Zerion fork as:

- wallet layer
- execution layer
- policy-enforced trading / bridge interface

## Submission-ready tagline

**PrivateDAO Autonomous Executor** turns private collective approval into scoped real onchain execution.
