# Performance Evidence

## Purpose

This document states exactly what performance evidence exists today, what does not, and what should exist for a fully strategy-complete submission.

It is intentionally conservative.

## What Exists Today

Current evidence in this repository supports:

- live governance lifecycle proof on devnet
- explorer-verifiable treasury execution proof
- strategy eligibility framing
- risk model framing
- reviewable strategy blueprint

## What Does Not Exist Yet

The repository does not currently claim:

- live strategy PnL
- realized APY from a deployed strategy engine
- venue-level trade history inside the repo
- Drift execution history inside the repo
- audited performance accounting

## Current Evidence Status

Based on the tracked strategy config:

- live performance provided: `false`
- backtest evidence provided: `true`
- strategy documentation provided: `true`
- pitch video provided: `true`
- code repository provided: `true`

See:

- [ranger-strategy-config.devnet.json](/home/x-pact/PrivateDAO/docs/ranger-strategy-config.devnet.json)
- [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md)

## What A Complete Strategy Evidence Pack Should Add

For a full Ranger/Drift strategy claim, add:

- wallet or vault address used during the build window
- strategy-side transaction history
- backtest methodology
- return series
- drawdown series
- venue exposure snapshots
- Drift-specific execution proof if submitted to the Drift Side Track

## Why This Document Helps

This document prevents overclaiming.

It makes the review distinction explicit:

- the governance and security layer is strongly evidenced today
- the strategy-performance layer is the next real expansion surface

## Reviewer Use

Reviewers should read this note together with:

- [strategy-blueprint.md](/home/x-pact/PrivateDAO/docs/strategy-blueprint.md)
- [strategy-adaptor-interface.md](/home/x-pact/PrivateDAO/docs/strategy-adaptor-interface.md)
- [ranger-strategy-documentation.md](/home/x-pact/PrivateDAO/docs/ranger-strategy-documentation.md)

## Honest Boundary

This file is not a substitute for live strategy metrics.

Its purpose is to make the current evidence boundary explicit and credible.
