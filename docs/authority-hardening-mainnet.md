# Authority Hardening for Mainnet

This document is the canonical authority-hardening surface for PrivateDAO before any real-funds launch.

It is intentionally operational and conservative:

- it does not claim authority separation is already complete on Mainnet
- it does not claim a custody ceremony already happened
- it describes the minimum authority posture required before a credible production cutover

## Why this matters

PrivateDAO is moving toward a full web app where normal governance operations happen in the UI.

That makes authority design more important, not less.

The product must show that:

- no single operator can silently upgrade the protocol
- no single operator can drain treasury assets
- no single operator can bypass governance boundaries
- every critical authority change is explainable and reviewable

## Required authority separation

PrivateDAO should maintain a hard split between:

### Upgrade authority

- controls program upgrade rights
- must be isolated from daily treasury and operator duties
- should move behind a production multisig before Mainnet

### Treasury authority

- controls treasury spend and settlement execution boundaries
- must not share the same authority surface as upgrades
- should be governed by proposal execution and treasury-specific policy

### Admin authority

- covers parameter management, emergency pause posture, and operational maintenance
- should be constrained and documented
- should not be treated as an unrestricted super-admin

## Minimum production ceremony

Before Mainnet launch, the project should complete and document:

1. multisig creation
2. signer inventory and signer roles
3. upgrade authority transfer
4. treasury authority transfer
5. admin authority review and reduction
6. written handoff record with transaction evidence

## What must be removed

Before Mainnet, any unnecessary single-signer authority should be removed or explicitly justified.

Examples:

- a single wallet retaining upgrade authority
- treasury movement paths that bypass governance execution
- hidden admin-only emergency routes without documented policy

## Reviewer-facing evidence

The reviewer should be able to inspect:

- which authority controls what
- what remains Devnet-only
- what ceremony is still pending
- what on-chain transaction or packet proves the handoff

## Truth boundary

This document is a required launch-discipline surface.

It is not proof that authority hardening is already complete.
