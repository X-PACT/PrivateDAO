# Monitoring And Alerts

## Purpose

This document defines the minimum monitoring surface required for PrivateDAO to be treated as serious production-minded infrastructure.

## Core Signals

Operators should monitor:

- proposal creation rate
- commit / reveal / finalize / execute activity
- treasury balance changes
- failed execute attempts
- failed finalize attempts
- RPC freshness and health
- upgrade authority activity

## Minimum Alert Set

### Governance alerts

- unexpected proposal creation
- repeated failed commit or reveal attempts
- repeated failed finalize attempts
- repeated failed execute attempts
- proposal reaching execute boundary unexpectedly

### Treasury alerts

- treasury balance change outside expected proposal execution
- recipient mismatch suspicion during review
- token transfer anomaly

### Infra alerts

- blockhash retrieval failure
- stale slot progression
- getProgramAccounts failure
- RPC divergence across providers

## Recommended Collection Surface

For a production-minded deployment, capture:

- RPC health probes
- proposal lifecycle transactions
- treasury execution transactions
- explorer URLs
- wallet addresses involved in operator actions

## Reviewer-Relevant Signals

The most important signals for judges, grant reviewers, or auditors are:

- every treasury-moving action has a transaction signature
- every proposal lifecycle transition is reproducible
- failed execution attempts are visible and non-mutating
- operational health is not assumed; it is checked

## Related Repository Surfaces

- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [production-operations.md](/home/x-pact/PrivateDAO/docs/production-operations.md)
- [incident-response.md](/home/x-pact/PrivateDAO/docs/incident-response.md)
- [security-review.md](/home/x-pact/PrivateDAO/docs/security-review.md)
- [check-rpc-health.sh](/home/x-pact/PrivateDAO/scripts/check-rpc-health.sh)
