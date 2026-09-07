# Incident Readiness Runbook

This document defines the minimum monitoring and incident posture for PrivateDAO before and after a Mainnet launch.

It is intentionally practical:

- detect failures early
- preserve operator clarity
- shorten response time
- keep the launch boundary honest

## Core monitoring targets

PrivateDAO should continuously watch:

### RPC failures

- request timeouts
- repeated degraded latency
- transport failures across primary and fallback providers

### Wallet errors

- wallet connection failures
- repeated signature rejections
- signing-boundary confusion in commit, reveal, or execute flows

### Instruction failures

- failed `create_dao`
- failed `create_proposal`
- failed `commit_vote`
- failed `reveal_vote`
- failed `finalize_proposal`
- failed `execute_proposal`

### Replay and retry anomalies

- repeated transaction attempts
- duplicate execute attempts
- unexpected duplicate commit or reveal patterns

### State inconsistencies

- proposal state moving unexpectedly
- reveal or execute attempted outside valid timing windows
- treasury and proposal state drifting from expected UI state

## Minimum alerts

The production operating stack should raise alerts for:

1. repeated RPC failure or sustained latency regression
2. repeated wallet-sign errors on critical routes
3. repeated instruction failures for the same action
4. unexpected account or proposal state transitions
5. treasury-action mismatches or blocked execution anomalies

## Minimum logs

The operator should always be able to reconstruct:

- what action was attempted
- by which wallet or operator role
- on which proposal or DAO
- against which network and program id
- whether the action failed at wallet, RPC, or program level

## Simple incident flow

1. detect
2. classify
3. freeze or contain if needed
4. verify proposal and treasury state
5. switch to fallback RPC or safe path if required
6. collect evidence
7. publish operator update
8. document the permanent fix

## Runbook principle

The incident path should stay smaller than the product path.

Normal users use the UI.

Operators and reviewers should still have a short, deterministic runbook when something goes wrong.

## Truth boundary

This document defines the operating target.

It does not claim 24/7 monitoring, SIRN membership, or external incident-response coverage unless those are explicitly evidenced elsewhere.
