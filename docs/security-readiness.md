# Security Readiness

PrivateDAO is currently best described as:

- feature-complete for Frontier
- review-ready on Devnet
- hardening-aware
- not yet unrestricted real-funds mainnet production

## Ready now

- commit-reveal governance lifecycle
- treasury execution safety checks
- Strict V2 additive hardening
- Governance Hardening V3 with token-supply quorum snapshots and dedicated reveal rebate vaults
- Settlement Hardening V3 with payout caps, evidence aging, and proposal-scoped settlement policy snapshots
- replay-aware evidence model
- baseline Devnet rehearsal evidence
- dedicated Devnet proof for the additive V3 path
- runtime and review artifacts

## Still required before unrestricted real-funds mainnet

- external audit or equivalent independent security review
- signer hardening and multisig authority transfer
- real monitoring and alerting in production
- real-device capture closure
- source-verifiable external settlement evidence where applicable

## Trust boundary discipline

PrivateDAO already distinguishes between:

- on-chain enforced behavior
- threshold-attested or evidence-bound behavior
- external launch blockers

That distinction must remain explicit in every demo, pitch, and pilot.

## V3 evidence boundary

The presence of `Governance Hardening V3`, `Settlement Hardening V3`, and `test-wallet-live-proof-v3.generated.*` means the repository can prove the additive hardening path on Devnet.

It does not mean:

- unrestricted mainnet custody is complete
- external audit is complete
- pending-external launch blockers are closed
