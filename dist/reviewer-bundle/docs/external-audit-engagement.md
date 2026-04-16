# External Audit Engagement

This note turns PrivateDAO's audit readiness into an actual handoff package for an external auditor or independent security reviewer.

It complements `docs/audit-handoff.md` by making the engagement deliverables and closure standard explicit.

## Audit Objective

Review the exact mainnet candidate and answer three questions:

1. Are the governance and treasury invariants correctly enforced?
2. Are the Strict V2 additions backward-compatible and security-positive?
3. Are the remaining trust assumptions documented honestly enough for launch decisions?

## Audit Scope

Priority paths:

- DAO creation and authority model
- proposal lifecycle: create, commit, reveal, finalize, execute
- veto and cancellation boundaries
- treasury execution for SOL and token flows
- confidential payout plans
- settlement evidence and consumption
- `zk_enforced` strict paths
- Realms voter-weight compatibility paths

Supporting scope:

- reviewer artifact generation
- runtime evidence generation
- launch blockers and custody handoff docs
- residual trust assumptions around MagicBlock and REFHE

## Minimum Auditor Packet

- `docs/audit-packet.generated.md`
- `docs/security-hardening-v2.md`
- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/protocol-spec.md`
- `docs/mainnet-readiness.generated.md`
- `docs/mainnet-blockers.md`
- `docs/frontier-integrations.generated.md`
- `docs/launch-trust-packet.generated.md`

## Required Auditor Outputs

- final report or signed memo
- severity-ranked findings
- explicit statement of reviewed commit or release candidate
- explicit residual-risk statement
- confirmation of whether real-funds mainnet is acceptable, conditional, or not acceptable

## Closure Standard

The audit blocker is not closed when the review starts. It is closed only when:

- the auditor names the exact reviewed commit or deployed candidate,
- every finding is marked fixed, accepted, or deferred with ownership,
- and the resulting disposition is stored in the release packet.

## Repository Updates After Audit

Once the review exists, update:

- `docs/mainnet-blockers.json`
- `docs/trust-package.md`
- `docs/launch-trust-packet.generated.json`
- `docs/launch-trust-packet.generated.md`
- `docs/mainnet-readiness.generated.md`

## Honest Boundary

The repository is ready to be audited.

It does not claim the external audit has already happened.
