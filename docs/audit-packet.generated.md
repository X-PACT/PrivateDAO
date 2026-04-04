# Audit Packet

## Identity

- Project: PrivateDAO
- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deploy transaction: `2FTRdNt2e1AXqPBwYReDiaNHjRZF2N7VtQeF17Ue56S7UoJPqZQxZ5gi32fRvAgE7ToE636EaDkanEoZvvcin9pD`
- Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`

## Reviewer Entry Points

- Live frontend: https://x-pact.github.io/PrivateDAO/
- Proof Center: https://x-pact.github.io/PrivateDAO/?page=proof
- Judge Mode: https://x-pact.github.io/PrivateDAO/?page=proof&judge=1
- Security page: https://x-pact.github.io/PrivateDAO/?page=security
- YouTube pitch: https://youtu.be/KVNFZXHNZTQ

## Live Devnet Anchors

- DAO PDA: `FZV9KmpeY1B31XvszQypp5T6nQN5C44JDLM4QWBEDvhx`
- Governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- Treasury PDA: `AZUroiNeGAjNdD84eEHnAKHHFwqAFmkjr2g1eoF7Ek5c`
- Proposal PDA: `AegjmwkX1FknBJMDyH5yM6BMhyHsiUreNtz3d8iz3QrP`

## PDAO Token Surface

- PDAO mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- PDAO program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- PDAO token account: `F4q77ZMJdC7eoEUw3CCR7DbKGTggyExjuMGKBEiM2ct4`
- PDAO metadata URI: `https://x-pact.github.io/PrivateDAO/assets/pdao-token.json`
- PDAO decimals: `9`
- PDAO initial supply: `1000000`
- PDAO attestation: `docs/pdao-attestation.generated.json`

### Program Boundary

- PrivateDAO governance program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- PDAO token program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
- Boundary note: the Token-2022 program id belongs to the PDAO mint surface and does not indicate a second PrivateDAO governance program.

### PDAO Token Transactions

- `create-token`: `5zGeSePpx2q3dFTNBi8Vmn8ucd9B3jEW6MKqrCUWtQQa3FipwDPFVKRrAoWQhJagBVqKMfUcWxVfpA6Q2vymanA6`
- `create-account`: `45gM6Jo3SSbwxzqyGRSMhTmz47r8wsaAMikdkbSQ2AyoXMEA3JAJM9X6eufjwnKY5QYU6QCFTjAfR9cVExKu2rhn`
- `initialize-metadata`: `4kgVoRGATdVAWVoYAYGqWnJBpDHiiRmFyQ3rgRz2uWEGdsx3Hosg5Ro7JGY7xSygD1vUUsGCduseCMWYx4MbXgur`
- `mint-initial-supply`: `7LF3U3kooWfnRwaziceyRzKrHKhFQ6q6hfYeR6vU5gudjTPKYbw6kmXCxvvfurnQBnCBTCWH54rabcDqx1TBbLA`
- `disable-mint-authority`: `dnv2vXPkFRM5fd42vgA4Cjkx85UCDTvFssYcS97ArZFQNGRVDd3DRzAUuvUVX1QFUAYcTpayJhbnomLCgjp2jj2`

## Lifecycle Transactions

- `create-dao`: `5mcyVi3SbZo4hvpVMjH2eZH8FYeywdbbPz4ArmE5wHXH5X9EnP6gSq76ogBWYWVkVUwzrCchPnSdhGV1mFb48s5Q`
- `mint-voting`: `reused-existing-governance-balance`
- `deposit`: `KHWqfteEQhsH7hk7onQymbmnYdtF8rLoPWwchoQz5XFy8eY3DufeaX8DPiiVS1or7XkMVjMrbH2rsEhPtrPfzi9`
- `create-proposal`: `E93ikMXVJbtvz8ewAHA2BasZPVKYyUXe3Jy88h3b3AQubm7PSYFMNtDveBkRts7uYodwzb8cGZSVDoneKF16X2L`
- `commit`: `3RMbrcYGx297hgcTrov9PqtUqM97ZFg6A21qxmepTboLQAoXov6toY2QTa8yU1i8zmQPvjR3ArNGpvR3jat79uTP`
- `reveal`: `5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5`
- `finalize`: `4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG`
- `execute`: `x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9`

## Artifact Integrity

- Integrity note: `docs/cryptographic-integrity.md`
- Cryptographic posture: `docs/cryptographic-posture.md`
- Supply-chain security note: `docs/supply-chain-security.md`
- Supply-chain attestation: `docs/supply-chain-attestation.generated.json`
- Cryptographic manifest: `docs/cryptographic-manifest.generated.json`
- Mainnet readiness report: `docs/mainnet-readiness.generated.md`
- Mainnet acceptance matrix: `docs/mainnet-acceptance-matrix.generated.md`
- Mainnet proof package: `docs/mainnet-proof-package.generated.md`
- Deployment attestation: `docs/deployment-attestation.generated.json`
- Go-live attestation: `docs/go-live-attestation.generated.json`
- Release ceremony note: `docs/release-ceremony.md`
- Release ceremony attestation: `docs/release-ceremony-attestation.generated.json`
- Release drill: `docs/release-drill.generated.json`
- PDAO attestation: `docs/pdao-attestation.generated.json`
- Algorithm: `sha256`
- Manifest entries: `73`
- Aggregate sha256: `c4e1240487d467d7bf4425aa8287342f3ad19f59daa23a7d9912f4312e313547`

## ZK Package

- ZK layer note: `docs/zk-layer.md`
- ZK stack note: `docs/zk-stack.md`
- ZK threat extension: `docs/zk-threat-extension.md`
- ZK assumption matrix: `docs/zk-assumption-matrix.md`
- ZK capability matrix: `docs/zk-capability-matrix.md`
- ZK provenance: `docs/zk-provenance.md`
- ZK verification flow: `docs/zk-verification-flow.md`
- ZK registry: `docs/zk-registry.generated.json`
- ZK transcript: `docs/zk-transcript.generated.md`
- ZK attestation: `docs/zk-attestation.generated.json`
- ZK stack version: `1`
- ZK registry entries: `3`

- `vote` -> `private_dao_vote_overlay` | public signals: `6` | build: `npm run zk:build:vote` | verify: `npm run zk:verify:vote`
- `delegation` -> `private_dao_delegation_overlay` | public signals: `7` | build: `npm run zk:build:delegation` | verify: `npm run zk:verify:delegation`
- `tally` -> `private_dao_tally_overlay` | public signals: `7` | build: `npm run zk:build:tally` | verify: `npm run zk:verify:tally`

### ZK Review Commands

- `npm run build:zk-registry`
- `npm run build:zk-transcript`
- `npm run build:zk-attestation`
- `npm run verify:zk-registry`
- `npm run verify:zk-transcript`
- `npm run verify:zk-attestation`
- `npm run verify:zk-docs`
- `npm run verify:zk-consistency`
- `npm run verify:zk-negative`
- `npm run zk:all`

## Strategy Package

- `docs/ranger-strategy-documentation.md`
- `docs/strategy-blueprint.md`
- `docs/strategy-adaptor-interface.md`
- `docs/strategy-operations.md`
- `docs/consumer-readiness.md`
- `docs/consumer-user-flows.md`
- `docs/launch-growth-plan.md`
- `docs/risk-policy.md`
- `docs/performance-evidence.md`

## Security Package

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`
- `docs/failure-modes.md`
- `docs/replay-analysis.md`
- `docs/cryptographic-integrity.md`
- `docs/cryptographic-posture.md`
- `docs/artifact-freshness.md`
- `docs/supply-chain-security.md`
- `docs/supply-chain-attestation.generated.md`
- `docs/supply-chain-attestation.generated.json`

## ZK Review Package

- `docs/zk-layer.md`
- `docs/zk-stack.md`
- `docs/zk-upgrade.md`
- `docs/zk-architecture.md`
- `docs/zk-evidence.md`
- `docs/zk-threat-extension.md`
- `docs/zk-assumption-matrix.md`
- `docs/zk-capability-matrix.md`
- `docs/zk-provenance.md`
- `docs/zk-verification-flow.md`
- `docs/zk-registry.generated.json`
- `docs/zk-transcript.generated.md`
- `docs/zk-attestation.generated.json`

## Proof Package

- `docs/live-proof.md`
- `docs/devnet-release-manifest.md`
- `docs/proof-registry.json`
- `docs/devnet-wallet-registry.json`
- `docs/devnet-bootstrap.json`
- `docs/devnet-tx-registry.json`
- `docs/adversarial-report.json`
- `docs/zk-proof-registry.json`
- `docs/performance-metrics.json`
- `docs/load-test-report.md`
- `docs/devnet-scale-profiles.md`
- `docs/devnet-multi-proposal-report.json`
- `docs/devnet-multi-proposal-report.md`
- `docs/devnet-race-report.json`
- `docs/devnet-race-report.md`
- `docs/devnet-resilience-report.json`
- `docs/devnet-resilience-report.md`
- `docs/independent-verification.md`
- `docs/cryptographic-manifest.generated.json`
- `docs/token.md`
- `docs/pdao-token.md`
- `docs/pdao-attestation.generated.json`
- `docs/assets/pdao-token.json`
- `docs/fair-voting.md`
- `docs/wallet-runtime.md`
- `docs/runtime-evidence.generated.md`
- `docs/runtime-evidence.generated.json`
- `docs/mainnet-acceptance-matrix.generated.md`
- `docs/mainnet-acceptance-matrix.generated.json`
- `docs/mainnet-proof-package.generated.md`
- `docs/mainnet-proof-package.generated.json`
- `docs/external-readiness-intake.md`
- `docs/wallet-compatibility-matrix.generated.md`
- `docs/wallet-compatibility-matrix.generated.json`
- `docs/devnet-canary.generated.md`
- `docs/devnet-canary.generated.json`
- `docs/deployment-attestation.generated.json`
- `docs/runtime-attestation.generated.json`
- `docs/go-live-attestation.generated.json`

## Runtime Package

- `docs/fair-voting.md`
- `docs/wallet-runtime.md`
- `docs/runtime-evidence.generated.md`
- `docs/runtime-evidence.generated.json`
- `docs/wallet-compatibility-matrix.generated.md`
- `docs/wallet-compatibility-matrix.generated.json`
- `docs/devnet-canary.generated.md`
- `docs/devnet-canary.generated.json`
- `docs/mainnet-acceptance-matrix.generated.md`
- `docs/mainnet-acceptance-matrix.generated.json`
- `docs/mainnet-proof-package.generated.md`
- `docs/mainnet-proof-package.generated.json`
- `docs/external-readiness-intake.md`
- `docs/mainnet-readiness.generated.md`
- `docs/release-ceremony.md`
- `docs/release-ceremony-attestation.generated.md`
- `docs/release-ceremony-attestation.generated.json`
- `docs/release-drill.generated.md`
- `docs/release-drill.generated.json`
- `docs/deployment-attestation.generated.json`
- `docs/go-live-criteria.md`
- `docs/operational-drillbook.md`
- `docs/runtime-attestation.generated.json`
- `docs/go-live-attestation.generated.json`

## Devnet Stress Package

- `docs/devnet-wallet-registry.json`
- `docs/devnet-bootstrap.json`
- `docs/devnet-tx-registry.json`
- `docs/adversarial-report.json`
- `docs/zk-proof-registry.json`
- `docs/performance-metrics.json`
- `docs/load-test-report.md`
- `docs/devnet-multi-proposal-report.json`
- `docs/devnet-multi-proposal-report.md`
- `docs/devnet-race-report.json`
- `docs/devnet-race-report.md`
- `docs/devnet-resilience-report.json`
- `docs/devnet-resilience-report.md`

## Operations Package

- `docs/mainnet-readiness.md`
- `docs/mainnet-readiness.generated.md`
- `docs/release-ceremony.md`
- `docs/release-ceremony-attestation.generated.md`
- `docs/release-ceremony-attestation.generated.json`
- `docs/release-drill.generated.md`
- `docs/release-drill.generated.json`
- `docs/review-automation.md`
- `docs/go-live-criteria.md`
- `docs/operational-drillbook.md`
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
- `npm run verify:program-id-consistency`
- `npm run verify:pdao-surface`
- `npm run verify:pdao-attestation`
- `npm run verify:pdao-live`
- `npm run test:devnet:wallets`
- `npm run test:devnet:fund`
- `npm run test:devnet:bootstrap`
- `npm run test:devnet:commit`
- `npm run test:devnet:reveal`
- `npm run test:devnet:execute`
- `npm run test:devnet:zk`
- `npm run test:devnet:adversarial`
- `npm run test:devnet:report`
- `npm run test:devnet:100`
- `npm run test:devnet:500`
- `npm run test:devnet:multi`
- `npm run test:devnet:race`
- `npm run test:devnet:extended`
- `npm run test:devnet:resilience`
- `npm run test:devnet:all`
- `npm run verify:review-links`
- `npm run verify:ops-surface`
- `npm run verify:submission-registry`
- `npm run verify:registry-consistency`
- `npm run verify:generated-artifacts`
- `npm run verify:supply-chain-attestation`
- `npm run verify:release-ceremony-attestation`
- `npm run verify:runtime-evidence`
- `npm run verify:release-drill`
- `npm run verify:artifact-freshness`
- `npm run verify:wallet-matrix`
- `npm run verify:devnet-canary`
- `npm run verify:devnet:resilience-report`
- `npm run ops:canary`
- `npm run verify:cryptographic-manifest`
- `npm run verify:mainnet-readiness-report`
- `npm run verify:mainnet-acceptance-matrix`
- `npm run verify:mainnet-proof-package`
- `npm run verify:deployment-attestation`
- `npm run verify:runtime-attestation`
- `npm run verify:runtime-surface`
- `npm run verify:go-live-attestation`
- `npm run verify:zk-surface`
- `npm run verify:zk-registry`
- `npm run verify:zk-transcript`
- `npm run verify:zk-attestation`
- `npm run verify:zk-docs`
- `npm run verify:zk-consistency`
- `npm run verify:zk-negative`
- `npm run verify:review-surface`
- `npm run verify:all`

## Current Status

- governanceLifecycle: `verified`
- securityReasoning: `verified`
- supplyChainSurface: `verified`
- releaseCeremonySurface: `verified`
- runtimeEvidenceSurface: `verified`
- releaseDrillSurface: `verified`
- artifactFreshness: `verified`
- zkCompanionStack: `verified`
- reviewerSurface: `verified`
- operationsSurface: `verified`
- strategyEngine: `not-in-repo`
- livePerformance: `not-in-repo`
- externalAudit: `pending`
- mainnetRollout: `pending`
