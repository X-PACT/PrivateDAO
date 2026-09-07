# Strategy Adaptor Interface

## Purpose

This document specifies the minimal interface expected between a real strategy engine and PrivateDAO as its governance-control plane.

It is an integration contract in the architectural sense, not a new on-chain interface claim.

## Why This Matters

Reviewers often ask where governance stops and strategy execution begins.

This document answers that boundary explicitly.

## Adaptor Responsibilities

A paired strategy adaptor should expose:

- current strategy state
- current exposure state
- current venue allocation
- current risk parameter set
- pending high-impact actions that require approval
- executed action logs

## Governance-Controlled Inputs

PrivateDAO should be able to approve or reject:

- risk limit changes
- venue exposure changes
- strategy sleeve enable/disable
- emergency de-risking
- treasury movements related to strategy operations

These are the control-plane inputs.

## Strategy-Controlled Outputs

The strategy adaptor should output:

- execution actions actually taken
- observed exposure after execution
- venue allocation after execution
- strategy-side transaction references

These are the evidence-plane outputs.

## Minimum Evidence Model

A strategy adaptor paired with PrivateDAO should be able to produce:

- wallet or vault address
- strategy action log
- venue-level exposure summary
- rebalance records
- emergency action records

## Review Expectations

A serious paired strategy should let a reviewer answer:

- what actions require PrivateDAO approval
- what actions remain automated
- what execution happened after approval
- where on-chain verification lives

## Recommended Boundaries

PrivateDAO should govern:

- policy changes
- high-risk changes
- emergency decisions
- treasury-sensitive actions

The strategy adaptor should own:

- routine execution
- risk telemetry
- venue execution details
- performance metrics

## Honest Boundary

This repository documents the adaptor boundary because it strengthens strategy readiness.

It does not claim that a finalized adaptor implementation already exists in this codebase.
