# Incident Response

## Purpose

This document defines the expected response flow for operational incidents affecting PrivateDAO.

It does not assume incidents are impossible. It assumes a serious protocol must remain understandable and controllable when something goes wrong.

## Incident Classes

The highest-priority incident classes are:

- unexpected proposal creation
- suspicious voting behavior
- repeated failed finalize or execute attempts
- treasury execution anomaly
- compromised signer or operator wallet
- RPC provider degradation or divergence
- deployment or upgrade anomaly

## Severity Model

### Severity 1 — Treasury or upgrade threat

Examples:

- unexpected treasury movement
- suspected signer compromise
- suspicious upgrade-authority activity

Response priority:

- immediate
- stop all non-essential operations
- preserve logs and transaction references

### Severity 2 — Governance control threat

Examples:

- suspicious proposal creation
- repeated unauthorized-looking interaction patterns
- proposal lifecycle anomalies

Response priority:

- urgent
- contain before new treasury execution

### Severity 3 — Infrastructure degradation

Examples:

- RPC flapping
- blockhash freshness problems
- inconsistent account reads

Response priority:

- high, but operational rather than treasury-emergency first

## Immediate Response Checklist

1. identify the affected proposal, DAO, treasury, or operator wallet
2. capture all relevant transaction signatures and explorer links
3. capture current account state
4. stop new non-essential operator actions
5. switch to fallback RPC if infrastructure instability is suspected
6. verify whether a proposal is still before execute and therefore still vetoable if applicable
7. document timeline, actors, and observed state

## Treasury Incident Flow

If the concern touches treasury execution:

1. confirm whether the proposal is already executed
2. inspect the transaction in:
   - [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)-style format
   - Solscan
3. compare recipient, mint, and amount against the proposal intent
4. confirm whether the action matches expected on-chain validation
5. if a passed proposal is still timelocked and suspicious, consider the veto path before unlock

## Signer Compromise Flow

If an operator or privileged signer is suspected compromised:

1. halt non-essential usage of that signer
2. enumerate proposals or actions that signer can still influence
3. evaluate whether upgrade authority or treasury-related roles are affected
4. transfer, revoke, or quarantine authority according to the production custody plan
5. preserve all relevant logs, signatures, and timestamps

## RPC / Infra Incident Flow

If RPC degradation is suspected:

1. compare reads across providers
2. check:
   - slot freshness
   - latest blockhash availability
   - getProgramAccounts consistency
3. switch operational reads and writes to the fallback provider if needed
4. do not finalize or execute treasury-sensitive actions during inconsistent read conditions

## Evidence to Preserve

For every serious incident, preserve:

- transaction signatures
- explorer links
- account addresses
- operator wallet addresses
- local timestamps
- observed balances
- proposal status before and after the incident

## Post-Incident Review

After containment:

1. write the timeline
2. identify root cause
3. classify whether it was:
   - protocol issue
   - operator issue
   - infrastructure issue
4. record whether current hardening would detect the issue earlier next time
5. update operational docs if the response path was unclear

## Honest Boundary

This runbook improves readiness and reviewer confidence, but it is not a substitute for:

- external incident response staffing
- formal mainnet custody procedures
- continuous production monitoring infrastructure
