# Production Operations

## Purpose

This document describes the operational controls required to run PrivateDAO as serious production infrastructure rather than as a devnet-only submission surface.

It is not a claim that every item is already completed on mainnet. It is the concrete operations baseline expected before a real cutover.

## Operational Domains

Production discipline for PrivateDAO breaks into six domains:

1. release control
2. key custody
3. RPC and network resilience
4. monitoring and alerting
5. treasury protection
6. incident response

## Release Control

Before any production deployment:

- freeze the exact commit and artifact hash
- run `anchor build`
- run Rust unit tests
- run the review-surface verification script
- run the independent verification guide
- produce deployment metadata and retained logs

Required artifacts:

- program id
- deployment transaction
- release commit hash
- build timestamp
- operator identity

## Upgrade Authority Strategy

The upgrade authority is one of the highest-risk control points.

Production expectations:

- do not leave upgrade authority unmanaged on a personal hot wallet
- define the upgrade policy in writing
- require explicit human approval before upgrades
- record the authority holder and custody model
- define the path to revoke or transfer upgrade authority after stabilization

## Wallet and Signer Discipline

For live operation:

- separate deploy authority from day-to-day operator wallets
- separate treasury-operational wallets from proposal reviewers where possible
- record signer roles explicitly
- avoid reusing review or demo wallets for production custody

## RPC and Network Resilience

Production operation should not depend on a single public RPC endpoint.

Baseline:

- primary RPC provider
- secondary fallback RPC provider
- health checks for blockhash, account reads, and slot freshness
- alerting when RPC responses degrade or diverge

Relevant repository surfaces:

- [check-mainnet-readiness.sh](/home/x-pact/PrivateDAO/scripts/check-mainnet-readiness.sh)
- [independent-verification.md](/home/x-pact/PrivateDAO/docs/independent-verification.md)
- [test-wallet-live-proof-v3.generated.md](/home/x-pact/PrivateDAO/docs/test-wallet-live-proof-v3.generated.md)

## Monitoring and Alerting

At minimum, operators should monitor:

- proposal creation events
- finalize events
- treasury execution events
- unexpected failure spikes
- treasury balance movements
- upgrade authority activity
- RPC health

Alerts should be configured for:

- unexpected execute attempts
- repeated failed finalize or execute attempts
- treasury balance anomalies
- unauthorized-looking operational behavior

## Treasury Protection

Treasury operations should be treated as production-critical.

Minimum expectations:

- verify treasury PDA and recipient relationships before release
- verify token mint relationships for SPL transfers
- document treasury recovery and incident contacts
- retain transaction logs for executed treasury actions

Relevant repository evidence:

- [security-review.md](/home/x-pact/PrivateDAO/docs/security-review.md)
- [failure-modes.md](/home/x-pact/PrivateDAO/docs/failure-modes.md)
- [live-proof.md](/home/x-pact/PrivateDAO/docs/live-proof.md)
- [governance-hardening-v3.md](/home/x-pact/PrivateDAO/docs/governance-hardening-v3.md)
- [settlement-hardening-v3.md](/home/x-pact/PrivateDAO/docs/settlement-hardening-v3.md)

## Incident Response

Every production deployment should have a written response path for:

- bad proposal creation
- unexpected voting behavior
- treasury execution anomalies
- compromised operator wallet
- RPC provider outage

The repository should not pretend incidents are impossible. It should prove they are manageable.

## Production Readiness Gate

Before claiming production readiness, operators should complete:

1. [mainnet-readiness.md](/home/x-pact/PrivateDAO/docs/mainnet-readiness.md)
2. [security-review.md](/home/x-pact/PrivateDAO/docs/security-review.md)
3. [independent-verification.md](/home/x-pact/PrivateDAO/docs/independent-verification.md)
4. [protocol-spec.md](/home/x-pact/PrivateDAO/docs/protocol-spec.md)
5. external review or audit

## Honest Boundary

What exists today in-repo:

- protocol hardening
- formal threat reasoning
- replay and failure-mode documentation
- live devnet proof
- dedicated additive V3 Devnet proof
- release and readiness gates

What still belongs to production rollout work:

- external audit
- production custody implementation
- production monitoring deployment
- formal incident response ownership
- mainnet deployment execution
