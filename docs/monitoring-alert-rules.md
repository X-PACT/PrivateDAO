# Monitoring Alert Rules

This document translates PrivateDAO production monitoring into concrete alert rules. The rules are defined in-repo; live delivery still requires external monitoring setup before real-funds mainnet production.

Canonical machine-readable source:

- `docs/monitoring-alert-rules.json`

## Alert Rules

| Rule | Category | Severity | Action |
| --- | --- | --- | --- |
| `rpc-slot-staleness` | rpc | high | switch reads to fallback RPC and pause treasury-sensitive operations until providers converge |
| `blockhash-failure-spike` | rpc | high | route writes through fallback RPC and do not execute treasury operations until blockhash freshness recovers |
| `unexpected-proposal-creation` | governance | high | capture proposal PDA, proposer, transaction signature, and determine whether veto or communication is required |
| `failed-finalize-spike` | governance | medium | inspect proposal phase, policy snapshot, proof verification state, and account constraints before retrying |
| `strict-proof-failure` | zk | high | block finalize or execute attempts and inspect ProposalProofVerification, payload hash, and policy snapshot |
| `settlement-evidence-failure` | privacy-settlement | high | block confidential payout execution and inspect evidence binding, attestor policy, and consumption record |
| `treasury-balance-change` | treasury | critical | stop non-essential operations, preserve signatures, compare recipient and mint against proposal intent, and escalate as Severity 1 |
| `upgrade-authority-activity` | custody | critical | halt release actions, preserve program data, verify upgrade authority state, and escalate as Severity 1 |

## Delivery Requirements

Before closing the `production-monitoring-alerts` blocker, operators must record:

- alert destination ownership
- primary and fallback RPC probe configuration
- proposal lifecycle monitor
- treasury balance monitor
- strict proof and settlement evidence monitor
- authority activity monitor
- test alert transcript

## Honest Boundary

These rules make the expected monitoring behavior explicit. They do not prove that PagerDuty, Telegram, Slack, Sentry, RPC probes, or any external alert channel has already been configured.
