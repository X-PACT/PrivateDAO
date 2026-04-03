# Audit Packet

## Identity

- Project: PrivateDAO
- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deploy transaction: `5wGTXjAhp4jBvU4Uu6FbMVziZkrxN7B9boh98XGfueSLTtZVsAvFtiNzPLfZsKpggJUkCgu1yAXjR4bd4T2w9aU1`
- Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`

## Reviewer Entry Points

- Live frontend: https://x-pact.github.io/PrivateDAO/
- Proof Center: https://x-pact.github.io/PrivateDAO/?page=proof
- Judge Mode: https://x-pact.github.io/PrivateDAO/?page=proof&judge=1
- Security page: https://x-pact.github.io/PrivateDAO/?page=security
- YouTube pitch: https://youtu.be/KVNFZXHNZTQ

## Live Devnet Anchors

- DAO PDA: `Gj7NgKm1MtB2CDs11pPJDcLExrkHf1styKdge1Lgx7V4`
- Governance mint: `JDu2NmGsNrNTHEm7zepCwYRpD6KZ7CtiSkdCg1KFHyn1`
- Treasury PDA: `S2J1gNCbE8E21pL3VEX4fhz2duxidSwRd7yaV9nriFW`
- Proposal PDA: `8JLRaAnwZc3BXfHKEKdiaK82MyjR1VhgGRKMydqmHxd1`

## Lifecycle Transactions

- `create-dao`: `5RnLdHsdFTNSeqB2yFgKrRDDJmsAHXUoWm8h1LgazDqHQr2ebHzRd1mmCHWnFFBcR7QdYQZKfdrE7JWYFz8oRHj1`
- `mint-voting`: `b5ymoL6RHg7786yv2TxjD9VV51fdsfHWaaRGLAFWEJ9HigpS5osZQKY2bSgVqtVC3y1qqnX8vpr9vfiEuHVuWCR`
- `deposit`: `4yw9mzpzWbg33TMtiht4eLBQw9KBa3jV6Yey61RMDzjQ51yXJ3Lp31ScvEXNwr2Q6HGuLQKz8r7PhQnbY5Vcm4RT`
- `create-proposal`: `KaZBBExcKxbnHg6Qm8VsbFZhJqcmDiw3q8GkktCyVEc8sPDMLf1bW6bP3yqSJXaz45kom5eCPMh6rdEWgBSYgam`
- `commit`: `dVhZLy67oWtXPmi9UjirQ7Ndmrg9j3QMBWhsrsKFBa7CnbotV2zXfnCLtDYHbjkepTT5GECi12Umj5NCSXbiS36`
- `reveal`: `3ALcXd4UZam1RVhuTV7ZtpmUVytWmAZKuK8KMK5XtpxgqMZYwMXbo5pKgjoJY5nt269jFT9uAMWCAuM2GM7dKCUB`
- `finalize`: `6394A1ith6ZEXD3N2nFUWDigytPPm9Pucw45y1SweLZZKXYHwxi6GpsaejpdkZyX5mgLRECUgqRSFSm9P6Uo64j`
- `execute`: `Xkoeqbe8g8jcosTQNsrMGCBevfzBtZwwyS2QjVfW9jrupczuj25LyAW3B7noQfPbsveT6eAggUBL3nLJBEASeri`

## Artifact Integrity

- Integrity note: `docs/cryptographic-integrity.md`
- Cryptographic manifest: `docs/cryptographic-manifest.generated.json`
- Algorithm: `sha256`
- Manifest entries: `25`
- Aggregate sha256: `9fe335e79b34ba18004e48c06dfb829a5b3cdf84f0e51ed290b0a2a91b383fa0`

## ZK Package

- ZK layer note: `docs/zk-layer.md`
- ZK stack note: `docs/zk-stack.md`
- ZK threat extension: `docs/zk-threat-extension.md`
- ZK assumption matrix: `docs/zk-assumption-matrix.md`
- ZK verification flow: `docs/zk-verification-flow.md`
- ZK registry: `docs/zk-registry.generated.json`
- ZK stack version: `1`
- ZK registry entries: `3`

- `vote` -> `private_dao_vote_overlay` | public signals: `6` | build: `npm run zk:build:vote` | verify: `npm run zk:verify:vote`
- `delegation` -> `private_dao_delegation_overlay` | public signals: `7` | build: `npm run zk:build:delegation` | verify: `npm run zk:verify:delegation`
- `tally` -> `private_dao_tally_overlay` | public signals: `7` | build: `npm run zk:build:tally` | verify: `npm run zk:verify:tally`

### ZK Review Commands

- `npm run build:zk-registry`
- `npm run verify:zk-registry`
- `npm run verify:zk-docs`
- `npm run verify:zk-consistency`
- `npm run verify:zk-negative`
- `npm run zk:all`

## Strategy Package

- `docs/ranger-strategy-documentation.md`
- `docs/strategy-blueprint.md`
- `docs/strategy-adaptor-interface.md`
- `docs/strategy-operations.md`
- `docs/risk-policy.md`
- `docs/performance-evidence.md`

## Security Package

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`
- `docs/failure-modes.md`
- `docs/replay-analysis.md`
- `docs/cryptographic-integrity.md`

## ZK Review Package

- `docs/zk-layer.md`
- `docs/zk-stack.md`
- `docs/zk-upgrade.md`
- `docs/zk-architecture.md`
- `docs/zk-evidence.md`
- `docs/zk-threat-extension.md`
- `docs/zk-assumption-matrix.md`
- `docs/zk-verification-flow.md`
- `docs/zk-registry.generated.json`

## Proof Package

- `docs/live-proof.md`
- `docs/devnet-release-manifest.md`
- `docs/proof-registry.json`
- `docs/independent-verification.md`
- `docs/cryptographic-manifest.generated.json`

## Operations Package

- `docs/mainnet-readiness.md`
- `docs/production-operations.md`
- `docs/monitoring-alerts.md`
- `docs/incident-response.md`
- `docs/verification-gates.md`
- `docs/mainnet-cutover-runbook.md`
- `docs/operator-checklist.md`
- `docs/risk-register.md`
- `docs/audit-handoff.md`

## Verification Gates

- `npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json`
- `npm run verify:strategy-surface`
- `npm run verify:live-proof`
- `npm run verify:release-manifest`
- `npm run verify:review-links`
- `npm run verify:ops-surface`
- `npm run verify:submission-registry`
- `npm run verify:registry-consistency`
- `npm run verify:generated-artifacts`
- `npm run verify:cryptographic-manifest`
- `npm run verify:zk-surface`
- `npm run verify:zk-registry`
- `npm run verify:zk-docs`
- `npm run verify:zk-consistency`
- `npm run verify:zk-negative`
- `npm run verify:review-surface`
- `npm run verify:all`

## Current Status

- governanceLifecycle: `verified`
- securityReasoning: `verified`
- zkCompanionStack: `verified`
- reviewerSurface: `verified`
- operationsSurface: `verified`
- strategyEngine: `not-in-repo`
- livePerformance: `not-in-repo`
- externalAudit: `pending`
- mainnetRollout: `pending`
