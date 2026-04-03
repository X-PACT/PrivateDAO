# Operator Checklist

## Purpose

This checklist is the shortest operational path for a human operator preparing to run, review, or hand off PrivateDAO in a serious environment.

## Before Running Anything

- verify the intended branch and commit
- verify the intended cluster
- verify the intended wallet
- verify the intended RPC

## Evidence Surfaces To Check First

- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [devnet-release-manifest.md](/home/x-pact/PrivateDAO/docs/devnet-release-manifest.md)
- [proof-registry.json](/home/x-pact/PrivateDAO/docs/proof-registry.json)

## Verification Commands

Run in this order:

1. `npm run verify:live-proof`
2. `npm run verify:release-manifest`
3. `npm run verify:review-links`
4. `npm run verify:review-surface`
5. `npm run check:mainnet`

## Governance Operation Checklist

Before creating or executing a proposal:

- confirm the DAO address
- confirm the proposal address
- confirm the treasury address
- confirm the recipient
- confirm the token mint if relevant
- confirm timing windows
- confirm whether the action is still vetoable or already executable

## Before Treasury-Sensitive Actions

- confirm the proposal has actually passed
- confirm `isExecuted == false`
- confirm the unlock time has passed
- confirm the expected amount
- confirm the expected recipient binding
- confirm explorer logging is enabled or recorded

## If Something Looks Wrong

- stop non-essential actions
- consult [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md)
- capture signatures and current account state
- avoid performing treasury actions under uncertain RPC conditions

## Honest Boundary

This checklist improves operator discipline. It does not replace protocol enforcement or external review.
