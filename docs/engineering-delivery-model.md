# Engineering Delivery Model

Last updated: 2026-04-16

## Purpose

PrivateDAO is not being built as a loose collection of experiments.

It is being built as a coordinated public-good Solana product with a clear engineering delivery model:

- one product thesis
- one browser-first Devnet experience
- one proof corridor
- one release path toward production

This document explains how the work is organized so contributors, reviewers, and community members can understand how the product keeps moving without drifting into disconnected features.

## Product thesis

PrivateDAO exists to turn governance, treasury execution, confidential payouts, and reviewer-visible proof into one understandable workflow.

Before this product path, many teams needed:

- a strong developer to operate governance safely
- a custom script path to move treasury actions
- public voting that leaked intent too early
- manual payout handling that weakened fairness and trust
- scattered logs that made review hard for non-experts

PrivateDAO changes that by turning complex Solana governance and treasury machinery into a browser-first product path that a normal operator can learn, run, and verify.

## Engineering roles

PrivateDAO work is described by engineering responsibilities, not by tool names.

### Product and ecosystem lead

Owns:

- product direction
- ecosystem fit
- funder and reviewer clarity
- public-good positioning

Responsibilities:

- keep the product legible to non-experts
- keep public messaging aligned with real product truth
- ensure each new capability serves the ecosystem, not just a track or a demo

### Governance systems engineer

Owns:

- DAO lifecycle design
- proposal semantics
- commit, reveal, finalize, and execute continuity
- fairness and anti-whale governance patterns

Responsibilities:

- keep governance flows simple in the UI
- keep private voting and execution logic explainable
- ensure the browser path matches the actual on-chain lifecycle

### Treasury and payments engineer

Owns:

- treasury motion logic
- payout rails
- agentic micropayment execution
- settlement design

Responsibilities:

- turn policy-approved treasury actions into safe execution flows
- keep payment behavior legible to operators and reviewers
- ensure high-frequency settlement patterns stay useful, not theatrical

### Runtime and infrastructure engineer

Owns:

- Devnet runtime continuity
- wallet execution stability
- RPC, API, telemetry, and state visibility
- hosted-read and data corridor maturity

Responsibilities:

- keep the site fast, live, and verifiable
- keep blockchain state, runtime logs, and explorer links easy to reach
- build infrastructure that can grow toward institutional-grade usage

### Proof and review engineer

Owns:

- judge surfaces
- proof packets
- reviewer paths
- transaction verification and evidence continuity

Responsibilities:

- make every major product claim inspectable
- keep captured proof honest and easy to understand
- reduce reviewer friction so the value of the product is visible in minutes

### Education and adoption engineer

Owns:

- learning guides
- glossary-to-product explanations
- onboarding clarity for normal visitors
- community-facing technical explanation

Responsibilities:

- explain privacy, RPC, API, proof, micropayments, and governance in plain language
- help a non-expert go from zero understanding to successful Devnet execution
- keep learning surfaces tightly connected to real product actions

### Release and operations engineer

Owns:

- release cadence
- deployment continuity
- production-release planning
- operating discipline

Responsibilities:

- keep the repo, proof, and site aligned
- prevent drift between what the site says and what the product actually does
- push the product steadily toward a stronger production release candidate

## How the team works together

PrivateDAO is built in linked tranches, not isolated feature bursts.

Each tranche should do all of the following:

- improve a real product path
- strengthen the public explanation
- improve the judge or reviewer route
- add or protect verifiable proof

That means a new capability is not considered complete if it exists only in code.

It must also become:

- understandable on the site
- runnable from the browser when applicable
- visible in proof, judge, or telemetry surfaces
- explainable to a non-expert reviewer

## Working rules

### Build from real ecosystem needs

PrivateDAO absorbs useful ideas from governance, payments, privacy, AI, RPC, and developer-tooling corridors, but the result must become one coherent product.

The rule is simple:

- do not bolt technologies on for decoration
- only keep a technology if it improves fairness, privacy, speed, clarity, or operating power inside the product

### Browser-first before script-first

The target user experience is:

- learn the concept
- connect a Devnet wallet
- create the DAO
- create the proposal
- commit vote
- reveal vote
- finalize and execute
- inspect proof, hashes, and logs

without terminal commands or private operator scripts.

### Proof must stay ahead of claims

Any strong claim should be backed by one or more of:

- a live browser route
- a judge route
- a generated proof artifact
- an explorer link
- a runtime or telemetry packet

### Support review and criticism

PrivateDAO is open source and built to welcome:

- testing
- code review
- protocol criticism
- product feedback
- infrastructure feedback

The aim is not to look flawless.
The aim is to be legible, serious, and improving quickly in public.

## What this means for the ecosystem

PrivateDAO is meant to help the Solana ecosystem by making complex governance and treasury operations easier to run correctly.

That includes:

- better privacy for decision-making until the correct reveal point
- stronger fairness and trust around treasury actions
- easier payout coordination
- clearer proof for reviewers, communities, and funders
- reusable governance and infrastructure patterns that other teams can learn from

## Current delivery priorities

The current product direction is:

1. browser-only Devnet completeness for the core governance cycle
2. clearer learning surfaces for non-experts
3. stronger judge and proof corridors
4. RPC and API surfaces that look and behave like real infrastructure
5. treasury and micropayment execution that can be reviewed easily
6. a visible path from Devnet evidence to production release confidence

## Practical reading order

If you are new, start here:

1. `/learn`
2. `/start`
3. `/govern`
4. `/judge`
5. `/documents/reviewer-fast-path`

If you are reviewing the product deeply, start here:

1. `/judge`
2. `/proof`
3. `/documents/agentic-treasury-micropayment-rail`
4. `/documents/reviewer-fast-path`
5. `/documents/capital-readiness-packet`

