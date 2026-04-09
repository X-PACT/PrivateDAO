<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# PrivateDAO

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/" target="_blank">
    <img src="docs/assets/frontend-hero.png" alt="PrivateDAO live Solana governance frontend" width="920" />
  </a>
</p>

<p align="center">
  <strong>Private governance, confidential treasury operations, and audit-grade runtime evidence for Solana organizations.</strong>
</p>

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/"><img src="https://img.shields.io/badge/Live%20Product-Open-14F195?logo=solana" alt="Live product" /></a>
  <a href="https://github.com/X-PACT/PrivateDAO/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/X-PACT/PrivateDAO/ci.yml?branch=main&label=CI" alt="CI status" /></a>
  <a href="docs/awards.md"><img src="https://img.shields.io/badge/Superteam%20Poland-1st%20Place-gold" alt="Superteam Poland 1st Place" /></a>
  <a href="https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet"><img src="https://img.shields.io/badge/Solana-Devnet%20Program-14F195" alt="Devnet program" /></a>
  <a href="docs/pdao-token.md"><img src="https://img.shields.io/badge/PDAO-Token--2022%20Governance%20Mint-0f766e" alt="PDAO token" /></a>
  <a href="docs/security-hardening-v2.md"><img src="https://img.shields.io/badge/Security-Strict%20V2%20Hardening-1d4ed8" alt="Strict V2 security hardening" /></a>
  <a href="docs/operational-evidence.generated.md"><img src="https://img.shields.io/badge/Devnet-50%20Wallet%20Rehearsal-7c3aed" alt="Devnet rehearsal" /></a>
  <a href="docs/magicblock/private-payments.md"><img src="https://img.shields.io/badge/MagicBlock-Private%20Payments-06b6d4" alt="MagicBlock private payments" /></a>
  <a href="docs/rpc-architecture.md"><img src="https://img.shields.io/badge/RPC%20Fast-Read%20Node%20Ready-f97316" alt="RPC Fast ready" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-AGPLv3%2B%20%7C%20Apache--2.0%20%7C%20MIT-green" alt="License" /></a>
</p>

## Winner Signal

**1st Place - Superteam Poland, March 2026.**

PrivateDAO engineering won **1st Place** in the Superteam Poland challenge **"Rebuild production backend systems as on-chain Rust programs"**. That matters here because this repo is built the same way: live protocol code, live Devnet execution, explicit trust boundaries, and machine-checked reviewer evidence. See [`docs/awards.md`](docs/awards.md).

## What PrivateDAO Is

PrivateDAO is a Solana governance and treasury product for organizations that need privacy without losing operational discipline.

It combines:

- **Private voting:** commit-reveal governance with proposal-bound commitments.
- **Confidential treasury operations:** payroll, bonus, and payout flows with aggregate on-chain settlement state.
- **Execution safety:** timelocks, veto and cancel boundaries, duplicate-execution resistance, and strict treasury account validation.
- **Evidence and reviewability:** Devnet rehearsals, ZK proof anchors, runtime packets, manifests, and generated audit surfaces.
- **Operational packaging:** Realms migration, hosted read/API packaging, trust exports, pilot material, and operator docs.

## What Is Live Now

PrivateDAO is already a live Devnet product, not a concept deck:

- Anchor program on Solana Devnet
- Wallet-connected frontend
- PDAO governance token surface
- Create DAO → submit proposal → private vote → execute treasury flow
- Confidential payout paths with `REFHE` and `MagicBlock` integration surfaces
- `Strict V2` hardening for proof, settlement, cancellation, and policy snapshots
- `Governance Hardening V3` for token-supply quorum snapshots and dedicated reveal rebate vaults
- `Settlement Hardening V3` for payout caps, evidence-aging windows, and explicit REFHE/MagicBlock execution requirements
- Backend read node and RPC Fast-oriented evidence path
- Reviewer-facing runtime, security, and launch packets

## Frontier Fit

PrivateDAO fits Frontier because it sits at the intersection of:

- **Governance / DAO infrastructure**
- **Privacy-preserving treasury operations**
- **MagicBlock-integrated confidential payout paths**
- **RPC Fast-oriented read reliability**
- **Full-stack Solana product execution**

## Launch Boundary

PrivateDAO is strong enough for Devnet evaluation, judge review, and pilot packaging, but this repository does **not** claim real-funds mainnet readiness yet. The current boundary is deliberate:

| Stage | Current status | Evidence |
| --- | --- | --- |
| Product and protocol | Implemented on Devnet | Live frontend, Anchor program, PDAO governance mint, commit-reveal lifecycle, confidential payout flows, Strict V2 hardening. |
| Reviewer evidence | Implemented and generated | 50-wallet Devnet rehearsal, ZK anchors, operational evidence, audit packet, cryptographic manifest, and `npm run verify:all`. |
| Launch operations | Repo-defined, externally pending | Multisig intake, authority transfer runbook, launch ops checklist, monitoring rules, wallet E2E plan. |
| Production custody | Pending external execution | 2-of-3 multisig, 48+ hour timelock, authority transfer signatures, signer backups, and post-transfer authority readouts. |
| Mainnet real funds | Blocked until closure | External audit, live monitoring, real-device captures, source-verifiable MagicBlock/REFHE receipts, and final cutover ceremony. |

Operational launch docs:

- [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md)
- [`docs/multisig-setup-intake.md`](docs/multisig-setup-intake.md)
- [`docs/authority-transfer-runbook.md`](docs/authority-transfer-runbook.md)
- [`docs/launch-ops-checklist.md`](docs/launch-ops-checklist.md)
- [`docs/monitoring-alert-rules.md`](docs/monitoring-alert-rules.md)
- [`docs/wallet-e2e-test-plan.md`](docs/wallet-e2e-test-plan.md)
- [`docs/launch-trust-packet.generated.md`](docs/launch-trust-packet.generated.md)
- [`docs/production-custody-ceremony.md`](docs/production-custody-ceremony.md)
- [`docs/external-audit-engagement.md`](docs/external-audit-engagement.md)
- [`docs/pilot-onboarding-playbook.md`](docs/pilot-onboarding-playbook.md)
- [`docs/browser-automation-audit.md`](docs/browser-automation-audit.md)
- [`docs/security-audit-remediation-2026-04-08.md`](docs/security-audit-remediation-2026-04-08.md)

The README should stay aligned with this rule: implemented surfaces are described as implemented; external launch steps are described as pending until real evidence is recorded.

## Start Here

| If you need | Link |
| --- | --- |
| Live product | https://x-pact.github.io/PrivateDAO/ |
| Judge / proof view | https://x-pact.github.io/PrivateDAO/?page=proof&judge=1 |
| Wallet diagnostics | https://x-pact.github.io/PrivateDAO/?page=diagnostics |
| Demo video | https://youtu.be/cwsPpNLiwbo |
| Devnet program | https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet |
| Guided product flow | [`docs/frontier-guided-flow.md`](docs/frontier-guided-flow.md) |
| Audit packet | [`docs/audit-packet.generated.md`](docs/audit-packet.generated.md) |
| Operational evidence | [`docs/operational-evidence.generated.md`](docs/operational-evidence.generated.md) |
| Frontier integration evidence | [`docs/frontier-integrations.generated.md`](docs/frontier-integrations.generated.md) |
| Mainnet blockers | [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md) |
| Trust package | [`docs/trust-package.md`](docs/trust-package.md) |
| Service catalog | [`docs/service-catalog.md`](docs/service-catalog.md) |
| Investor / competition pitch deck | [`docs/investor-pitch-deck.md`](docs/investor-pitch-deck.md) |

## System Diagram

```mermaid
flowchart LR
  User["Wallet user / DAO operator"] --> Frontend["Live web app - docs/index.html"]
  User --> Android["Android native path - Solana MWA"]
  Frontend --> Wallet["Wallet signing - Phantom / Solflare"]
  Android --> Wallet
  Wallet --> Program["PrivateDAO Anchor program - Solana Devnet"]
  Program --> DAO["DAO PDA"]
  Program --> Proposal["Proposal PDA"]
  Program --> Treasury["Treasury PDA"]
  Program --> VoteRecord["VoteRecord PDA"]
  Program --> StrictV2["Strict V2 companion accounts - policy, proof, settlement, consumption"]
  Frontend --> ReadNode["Read-only backend node - pooled RPC and metrics"]
  ReadNode --> RPC["Solana RPC / RPC Fast path"]
  Program --> Evidence["Runtime evidence - ZK anchors, manifests, reports"]
  Evidence --> Reviewers["Judges / auditors / operators"]
```

## Governance Lifecycle

```mermaid
flowchart LR
  Start["Start"] --> DaoCreated["DAO created"]
  DaoCreated --> ProposalCreated["Proposal created"]
  ProposalCreated --> Commit["Commit vote hash"]
  Commit --> Reveal["Reveal vote and salt"]
  Reveal --> Finalize["Finalize after reveal window"]
  Finalize --> Timelock["Timelock for passed proposal"]
  Timelock --> Execute["Execute after delay"]
  Timelock --> Vetoed["Veto during timelock"]
  ProposalCreated --> Cancelled["Early cancel / V2 safe cancel"]
  Execute --> Done["Done"]
  Vetoed --> Done
  Cancelled --> Done
```

## Feature Map

| Layer | What exists now | Key references |
| --- | --- | --- |
| Governance core | DAO creation, proposal creation, commit, reveal, finalize, execute, veto, cancel, delegation, keeper reveal. | [`programs/private-dao/src/lib.rs`](programs/private-dao/src/lib.rs), [`tests/private-dao.ts`](tests/private-dao.ts) |
| Treasury execution | SOL and Token-2022/SPL treasury paths with recipient, mint, owner, and duplicate-execution checks. | [`docs/security-review.md`](docs/security-review.md), [`docs/failure-modes.md`](docs/failure-modes.md) |
| Confidential payouts | Proposal-bound payroll and bonus plans with encrypted manifests and aggregate settlement. | [`docs/confidential-payments.md`](docs/confidential-payments.md), [`docs/confidential-payroll-flow.md`](docs/confidential-payroll-flow.md) |
| Confidential Treasury Command Center | Live guided UI path that turns `Create -> Commit -> Reveal -> Execute` into one product flow, then explains proposal-by-proposal whether ZK, REFHE, MagicBlock, and backend-indexed RPC are active, optional, or not required. The builder now includes smart presets for standard treasury grants, confidential payroll, confidential bonus, and private token distribution. | [`docs/index.html`](docs/index.html), [`docs/frontier-guided-flow.md`](docs/frontier-guided-flow.md) |
| Checkout-like onboarding rail | The proposals page now starts with a storefront-style onboarding rail that walks normal users through product pack selection, DAO bootstrap, treasury funding, proposal launch, and private vote/execute flow before they reach the lower-level consoles. The storefront now personalizes hero CTAs and compare cards based on the selected operating pack. | [`docs/index.html`](docs/index.html) |
| Storefront and service entry | The homepage now exposes product packs, Realms migration as a first-class entry, and a service catalog for hosted API, review exports, onboarding, and pilot support without pretending a self-serve SaaS checkout already exists. | [`docs/index.html`](docs/index.html), [`docs/service-catalog.md`](docs/service-catalog.md), [`docs/migration-story.md`](docs/migration-story.md) |
| Commercial buyer surface | The homepage now also frames the commercial buying path directly in-product: pilot package, hosted read API + ops, confidential operations premium, and enterprise governance retainer, each linked to the exact pricing, SLA, trust, and onboarding documents behind it. | [`docs/index.html`](docs/index.html), [`docs/pricing-model.md`](docs/pricing-model.md), [`docs/pilot-program.md`](docs/pilot-program.md), [`docs/service-level-agreement.md`](docs/service-level-agreement.md) |
| Buyer journey narrative | The homepage now explains who should buy PrivateDAO, why it exists beyond Realms or Squads alone, what happens in the first 30 days of a pilot, and what is live now versus still pending-external for real-funds launch. | [`docs/index.html`](docs/index.html), [`docs/trust-package.md`](docs/trust-package.md), [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md), [`docs/pilot-program.md`](docs/pilot-program.md) |
| Conversion-ready pilot rail | The homepage now includes a commercial checkout rail for weeks 1-4 of a pilot plus a `Request Pilot Packet` action that copies the exact buyer-facing packet from the current repo truth surface. | [`docs/index.html`](docs/index.html), [`docs/pilot-program.md`](docs/pilot-program.md), [`docs/pricing-model.md`](docs/pricing-model.md), [`docs/trust-package.md`](docs/trust-package.md) |
| Demo-closing hero proof strip | The hero now includes quick-switches for judge, buyer, and operator views plus a prominent live-success proof strip that surfaces the latest real Devnet execution, the new V3 hardening proof packet, the reviewer packet, and the explicit mainnet boundary from the first screen. | [`docs/index.html`](docs/index.html), [`docs/test-wallet-live-proof.generated.md`](docs/test-wallet-live-proof.generated.md), [`docs/test-wallet-live-proof-v3.generated.md`](docs/test-wallet-live-proof-v3.generated.md), [`docs/operational-evidence.generated.md`](docs/operational-evidence.generated.md), [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md) |
| Persona-adaptive landing surface | The hero now shifts between buyer, judge, and operator narratives without changing the underlying proof links, and the proposals page now carries a sticky pack summary that turns the active preset into a clear operator and buyer brief. | [`docs/index.html`](docs/index.html), [`docs/grant-committee-pack.md`](docs/grant-committee-pack.md), [`docs/fund-governance-pack.md`](docs/fund-governance-pack.md), [`docs/enterprise-dao-pack.md`](docs/enterprise-dao-pack.md) |
| Commercial decision surface | The proposals page now includes a dedicated conversion layer: compare plans, open the API and operations surface, inspect the live-versus-pending boundary, and copy a buyer-ready service packet directly from the active pack. | [`docs/index.html`](docs/index.html), [`docs/service-catalog.md`](docs/service-catalog.md), [`docs/trust-package.md`](docs/trust-package.md), [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md) |
| Proposal-aware commercial guidance | The selected proposal panel now adapts its buyer, operator, judge, and launch-boundary guidance to the live proposal itself, including pack inference, proposal packet copy, and proof-bound next steps tied to the actual on-chain phase. | [`docs/index.html`](docs/index.html), [`docs/trust-package.md`](docs/trust-package.md), [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md), [`docs/test-wallet-live-proof.generated.md`](docs/test-wallet-live-proof.generated.md) |
| Realms migration storefront | The Realms migration page now includes organization-specific migration packs, live command generation, and next-step guidance so operators can move from migration intent to a concrete PrivateDAO bootstrap path faster. | [`docs/index.html`](docs/index.html), [`docs/migration-story.md`](docs/migration-story.md), [`docs/grant-committee-pack.md`](docs/grant-committee-pack.md), [`docs/fund-governance-pack.md`](docs/fund-governance-pack.md), [`docs/enterprise-dao-pack.md`](docs/enterprise-dao-pack.md) |
| REFHE | Proposal-bound encrypted evaluation envelope with settlement gate and explicit trust model. | [`docs/refhe-protocol.md`](docs/refhe-protocol.md), [`docs/refhe-security-model.md`](docs/refhe-security-model.md) |
| MagicBlock | Private-payment corridor support for confidential token payout flows, with runtime capture/evidence docs. | [`docs/magicblock/private-payments.md`](docs/magicblock/private-payments.md), [`docs/magicblock/runtime-evidence.md`](docs/magicblock/runtime-evidence.md) |
| Frontier integration gate | One machine-checked package that binds ZK anchors, MagicBlock settlement, REFHE settlement, and backend-indexed RPC state into a single Devnet-verified review surface. | [`docs/frontier-integrations.generated.md`](docs/frontier-integrations.generated.md), [`docs/read-node/ops.generated.md`](docs/read-node/ops.generated.md) |
| ZK layer | Groth16 companion proofs, on-chain proof anchors, ZK registry, and `zk_enforced` readiness documentation. | [`docs/zk-proof-registry.json`](docs/zk-proof-registry.json), [`docs/zk-layer.md`](docs/zk-layer.md) |
| Strict V2 hardening | Additive companion accounts for DAO security policy, proof verification, settlement evidence, consumption, cancellation safety, and voter-weight scope. | [`docs/security-hardening-v2.md`](docs/security-hardening-v2.md), [`docs/protocol-spec.md`](docs/protocol-spec.md) |
| Governance Hardening V3 | Additive governance-policy snapshots, token-supply participation quorum, dedicated reveal rebate vaults, and V3 finalize/reveal paths that do not reinterpret legacy proposals. | [`docs/governance-hardening-v3.md`](docs/governance-hardening-v3.md), [`docs/test-wallet-live-proof-v3.generated.md`](docs/test-wallet-live-proof-v3.generated.md), [`programs/private-dao/src/lib.rs`](programs/private-dao/src/lib.rs) |
| Settlement Hardening V3 | Additive settlement-policy snapshots, payout caps, minimum evidence age, and optional REFHE/MagicBlock execution requirements for confidential payout execution. | [`docs/settlement-hardening-v3.md`](docs/settlement-hardening-v3.md), [`docs/test-wallet-live-proof-v3.generated.md`](docs/test-wallet-live-proof-v3.generated.md), [`programs/private-dao/src/lib.rs`](programs/private-dao/src/lib.rs) |
| Read node | Read-only backend node for proposal/DAO inspection, ops snapshots, pooled RPC reads, and same-domain deployment path. | [`docs/read-node/indexer.md`](docs/read-node/indexer.md), [`docs/read-node/ops.generated.md`](docs/read-node/ops.generated.md) |
| Mobile surface | Android-native path with Kotlin, Jetpack Compose, and Solana Mobile Wallet Adapter. | [`apps/android-native/`](apps/android-native/), [`docs/android-native.md`](docs/android-native.md) |
| Review automation | Generated audit packet, runtime evidence, operational evidence, cryptographic manifest, and release drill artifacts. | [`docs/audit-packet.generated.md`](docs/audit-packet.generated.md), [`docs/cryptographic-manifest.generated.json`](docs/cryptographic-manifest.generated.json) |

## Evidence From The Latest Devnet Rehearsal

The current reviewer evidence package includes a live Devnet rehearsal with persistent wallets, adversarial checks, ZK artifacts, and generated runtime evidence.

| Metric | Value |
| --- | --- |
| Network | Devnet |
| Wallets | 50 |
| Total attempts | 212 |
| Successful attempts | 180 |
| Expected security rejections | 32 |
| ZK proof artifacts | 7 |
| On-chain ZK proof anchors | 3 |
| Canonical reviewer gate | `npm run verify:all` |

Primary artifacts:

- [`docs/load-test-report.md`](docs/load-test-report.md)
- [`docs/operational-evidence.generated.md`](docs/operational-evidence.generated.md)
- [`docs/runtime-evidence.generated.md`](docs/runtime-evidence.generated.md)
- [`docs/devnet-resilience-report.md`](docs/devnet-resilience-report.md)
- [`docs/devnet-race-report.md`](docs/devnet-race-report.md)
- [`docs/zk-proof-registry.json`](docs/zk-proof-registry.json)
- [`docs/performance-metrics.json`](docs/performance-metrics.json)

## Review Evidence Index

This section intentionally keeps the reviewer contract visible. The README is concise, but every core review surface stays one click away.

| Area | Evidence |
| --- | --- |
| Security review | [`docs/security-review.md`](docs/security-review.md), [`docs/security-audit-remediation-2026-04-08.md`](docs/security-audit-remediation-2026-04-08.md), [`docs/threat-model.md`](docs/threat-model.md), [`docs/security-coverage-map.md`](docs/security-coverage-map.md), [`docs/failure-modes.md`](docs/failure-modes.md), [`docs/replay-analysis.md`](docs/replay-analysis.md) |
| Live proof and release evidence | [`docs/live-proof.md`](docs/live-proof.md), [`docs/test-wallet-live-proof.generated.md`](docs/test-wallet-live-proof.generated.md), [`docs/test-wallet-live-proof-v3.generated.md`](docs/test-wallet-live-proof-v3.generated.md), [`docs/devnet-release-manifest.md`](docs/devnet-release-manifest.md), [`docs/verification-gates.md`](docs/verification-gates.md), [`docs/reviewer-fast-path.md`](docs/reviewer-fast-path.md), [`docs/reviewer-surface-map.md`](docs/reviewer-surface-map.md) |
| Mainnet readiness | [`docs/mainnet-readiness.md`](docs/mainnet-readiness.md), [`docs/mainnet-readiness.generated.md`](docs/mainnet-readiness.generated.md), [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md), [`docs/deployment-attestation.generated.json`](docs/deployment-attestation.generated.json), [`docs/go-live-criteria.md`](docs/go-live-criteria.md), [`docs/go-live-attestation.generated.json`](docs/go-live-attestation.generated.json) |
| Operations | [`docs/operational-drillbook.md`](docs/operational-drillbook.md), [`docs/production-operations.md`](docs/production-operations.md), [`docs/authority-transfer-runbook.md`](docs/authority-transfer-runbook.md), [`docs/multisig-setup-intake.md`](docs/multisig-setup-intake.md), [`docs/launch-ops-checklist.md`](docs/launch-ops-checklist.md), [`docs/monitoring-alert-rules.md`](docs/monitoring-alert-rules.md), [`docs/wallet-e2e-test-plan.md`](docs/wallet-e2e-test-plan.md), [`docs/browser-automation-audit.md`](docs/browser-automation-audit.md), [`docs/runtime-attestation.generated.json`](docs/runtime-attestation.generated.json), [`docs/runtime/real-device.md`](docs/runtime/real-device.md), [`docs/runtime/real-device.generated.md`](docs/runtime/real-device.generated.md) |
| Frontier integrations | [`docs/frontier-integrations.generated.md`](docs/frontier-integrations.generated.md), [`docs/magicblock/runtime.generated.md`](docs/magicblock/runtime.generated.md), [`docs/refhe-protocol.md`](docs/refhe-protocol.md), [`docs/read-node/ops.generated.md`](docs/read-node/ops.generated.md), [`docs/zk-proof-registry.json`](docs/zk-proof-registry.json) |
| Product runtime | [`docs/fair-voting.md`](docs/fair-voting.md), [`docs/wallet-runtime.md`](docs/wallet-runtime.md), [`docs/operational-evidence.generated.md`](docs/operational-evidence.generated.md), [`docs/pdao-attestation.generated.json`](docs/pdao-attestation.generated.json), [`docs/strategy-operations.md`](docs/strategy-operations.md) |
| Product packaging | [`docs/production-simulation-dao.md`](docs/production-simulation-dao.md), [`docs/use-case-packs.md`](docs/use-case-packs.md), [`docs/operator-guide.md`](docs/operator-guide.md), [`docs/trust-package.md`](docs/trust-package.md), [`docs/migration-story.md`](docs/migration-story.md), [`docs/pricing-model.md`](docs/pricing-model.md), [`docs/pilot-program.md`](docs/pilot-program.md), [`docs/service-level-agreement.md`](docs/service-level-agreement.md) |
| Services and API packaging | [`docs/service-catalog.md`](docs/service-catalog.md), [`docs/pricing-model.md`](docs/pricing-model.md), [`docs/pilot-program.md`](docs/pilot-program.md), [`docs/service-level-agreement.md`](docs/service-level-agreement.md), [`docs/pilot-onboarding-playbook.md`](docs/pilot-onboarding-playbook.md) |
| Launch and pilot operations | [`docs/launch-trust-packet.generated.md`](docs/launch-trust-packet.generated.md), [`docs/production-custody-ceremony.md`](docs/production-custody-ceremony.md), [`docs/external-audit-engagement.md`](docs/external-audit-engagement.md), [`docs/pilot-onboarding-playbook.md`](docs/pilot-onboarding-playbook.md) |
| Artifact integrity | [`docs/cryptographic-integrity.md`](docs/cryptographic-integrity.md), [`docs/cryptographic-manifest.generated.json`](docs/cryptographic-manifest.generated.json) |

## Architecture Assets

<p align="center">
  <img src="docs/assets/confidential-payments-flow.svg" alt="Confidential payments flow" width="720" />
</p>

<p align="center">
  <img src="docs/assets/refhe-flow.svg" alt="REFHE proposal-bound settlement flow" width="720" />
</p>

<p align="center">
  <img src="docs/assets/read-node-architecture.svg" alt="Read node architecture" width="720" />
</p>

## Security Model At A Glance

PrivateDAO is explicit about the difference between implemented enforcement, attestation, and future cryptographic upgrades.

- Commitments bind `vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32`.
- Vote records and delegation markers are proposal-bound PDAs to prevent cross-proposal replay.
- Treasury execution is timelocked and checks recipient, mint, owner, source/destination, and executed-state invariants.
- Strict V2 paths are additive and do not reorder old account layouts or remove legacy instructions.
- Settlement evidence is proposal/payout-bound and single-use under the V2 model.
- ZK proof artifacts are generated and verified off-chain today, with representative proof anchors recorded on-chain for the current Devnet evidence path.
- Full mainnet production still requires external audit, production authority hardening, monitoring, and stronger source-verifiable receipt paths for external systems.

Important security docs:

- [`docs/security-review.md`](docs/security-review.md)
- [`docs/threat-model.md`](docs/threat-model.md)
- [`docs/security-hardening-v2.md`](docs/security-hardening-v2.md)
- [`docs/security-architecture.md`](docs/security-architecture.md)
- [`docs/replay-analysis.md`](docs/replay-analysis.md)
- [`docs/zk-assumption-matrix.md`](docs/zk-assumption-matrix.md)
- [`docs/mainnet-readiness.generated.md`](docs/mainnet-readiness.generated.md)

## Token Surface

PrivateDAO has a live Devnet governance token surface for the reviewer-facing DAO.

| Field | Value |
| --- | --- |
| Token | `PDAO` |
| Network | Devnet |
| Utility | Governance voting token |
| Platform | DeAura |
| Mint | `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt` |
| Program | Token-2022 |
| Initial supply | `1,000,000 PDAO` |

The canonical PrivateDAO governance program id is:

Live devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

```text
5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx
```

The Token-2022 program id belongs to the governance token mint surface; it is not a second PrivateDAO governance program.

## Repository Map

```text
programs/private-dao/src/lib.rs      Anchor program and account model
docs/index.html                      Live GitHub Pages product surface
apps/android-native/                 Android native Solana MWA app
scripts/                             Devnet, operator, verifier, and evidence automation
tests/private-dao.ts                 Core governance/security test coverage
tests/full-flow-test.ts              End-to-end lifecycle and treasury tests
sdk/src/index.ts                     Commitment and client helpers
docs/                                Reviewer docs, generated evidence, and frontend assets
zk/                                  Groth16 companion proof circuits and setup artifacts
```

For navigation inside the large docs and scripts surfaces:

- [`docs/README.md`](docs/README.md)
- [`scripts/README.md`](scripts/README.md)

## Fast Review Path

If you only have a few minutes:

1. Open the live product: https://x-pact.github.io/PrivateDAO/
2. Open judge mode: https://x-pact.github.io/PrivateDAO/?page=proof&judge=1
3. Read [`docs/reviewer-fast-path.md`](docs/reviewer-fast-path.md)
4. Read [`docs/security-hardening-v2.md`](docs/security-hardening-v2.md)
5. Read [`docs/operational-evidence.generated.md`](docs/operational-evidence.generated.md)
6. Inspect the program: [`programs/private-dao/src/lib.rs`](programs/private-dao/src/lib.rs)
7. Run the unified gate: `npm run verify:all`

## Local Development

Prerequisites:

- Rust stable
- Solana CLI
- Anchor CLI `0.31.1`
- Node.js 20+
- npm or Yarn

Install and check:

```bash
npm install
npm run typecheck
npm run verify:local-validator
```

Build:

```bash
anchor build
```

Run the portable core suite:

```bash
npm run test:core
```

Run the full local Anchor suites on an AVX2-capable host:

```bash
npm run test:core:anchor
npm run test:full:anchor
npm run demo
```

Start the read node:

```bash
npm run start:read-node
```

Verify reviewer evidence:

```bash
npm run build:devnet:review-artifacts
npm run verify:generated-artifacts
npm run verify:all
```

## Devnet Operations

Set wallet and RPC:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export ANCHOR_PROVIDER_URL=https://api.devnet.solana.com
```

Deploy to Devnet:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Run the canonical Devnet evidence package:

```bash
npm run test:devnet:all
```

Run larger wave profiles when you intentionally want heavier Devnet traffic:

```bash
npm run test:devnet:100
npm run test:devnet:350
npm run test:devnet:500
```

The 50-wallet package is the canonical reviewer baseline. Larger profiles write profile-specific artifacts and should be treated as stress operations, not routine verification.

## Weekly Frontier Updates

Upload-ready weekly update videos are generated from the repository evidence surface:

- [`docs/assets/weekly-updates/private-dao-week-1-update.mp4`](docs/assets/weekly-updates/private-dao-week-1-update.mp4)
- [`docs/assets/weekly-updates/private-dao-week-2-update.mp4`](docs/assets/weekly-updates/private-dao-week-2-update.mp4)
- [`docs/assets/weekly-updates/private-dao-week-3-update.mp4`](docs/assets/weekly-updates/private-dao-week-3-update.mp4)
- [`docs/assets/weekly-updates/private-dao-week-4-update.mp4`](docs/assets/weekly-updates/private-dao-week-4-update.mp4)

References:

- [`docs/weekly-video-updates.md`](docs/weekly-video-updates.md)
- [`docs/video-shotlist.md`](docs/video-shotlist.md)
- [`docs/video-voiceover.md`](docs/video-voiceover.md)

Commands:

```bash
npm run render:weekly-updates
npm run verify:weekly-updates
```

## Mainnet Readiness Status

PrivateDAO is **Devnet / hackathon / audit-readiness candidate** today. It is not yet claiming unrestricted mainnet production readiness for real funds.

Ready now:

- live Devnet program and product surface
- PDAO Devnet governance token surface
- full governance lifecycle evidence
- Strict V2 additive hardening model
- Devnet rehearsal and adversarial reports
- generated audit packet and cryptographic manifest
- read-node and RPC reliability path

Still required before production mainnet:

- external audit or focused independent security review
- multisig/timelock upgrade authority hardening
- production monitoring and alerting
- real-device wallet capture closure
- operational sign-off for MagicBlock/REFHE source-verifiable receipts
- final mainnet release ceremony and cutover checklist

Key docs:

- [`docs/mainnet-go-live-checklist.md`](docs/mainnet-go-live-checklist.md)
- [`docs/mainnet-readiness.generated.md`](docs/mainnet-readiness.generated.md)
- [`docs/mainnet-proof-package.generated.md`](docs/mainnet-proof-package.generated.md)
- [`docs/mainnet-blockers.md`](docs/mainnet-blockers.md)
- [`docs/authority-hardening.md`](docs/authority-hardening.md)
- [`docs/multisig-setup-intake.md`](docs/multisig-setup-intake.md)
- [`docs/monitoring-alert-rules.md`](docs/monitoring-alert-rules.md)
- [`docs/wallet-e2e-test-plan.md`](docs/wallet-e2e-test-plan.md)
- [`docs/release-ceremony.md`](docs/release-ceremony.md)

## Media And Submission Assets

- Public demo video: https://youtu.be/cwsPpNLiwbo
- Canonical lifecycle demo brief: [`docs/demo-video.md`](docs/demo-video.md)
- Repo-native lifecycle demo: [`docs/assets/private-dao-demo-flow.mp4`](docs/assets/private-dao-demo-flow.mp4)
- Investor / competition pitch deck: [`docs/investor-pitch-deck.md`](docs/investor-pitch-deck.md)
- Repo-native investor reel: https://x-pact.github.io/PrivateDAO/assets/private-dao-investor-pitch.mp4
- Poster: [`docs/assets/private-dao-investor-pitch-poster.png`](docs/assets/private-dao-investor-pitch-poster.png)
- Submission dossier: [`docs/submission-dossier.md`](docs/submission-dossier.md)
- Final submission pack: [`SUBMISSION_FINAL.md`](SUBMISSION_FINAL.md)
- Manual Colosseum answers: [`docs/colosseum-submission-answers.md`](docs/colosseum-submission-answers.md)
- Technical explainer: [`docs/investor-video.md`](docs/investor-video.md)

## Ownership And Contact

PrivateDAO is independently built and maintained by **Fahd Kotb**.

- X: [@FahdX369](https://x.com/FahdX369)
- Telegram: [@Fahdkotb](https://t.me/Fahdkotb)
- Primary email: [fahd.kotb@tuta.io](mailto:fahd.kotb@tuta.io)
- Secondary email: [i.kotb@proton.me](mailto:i.kotb@proton.me)

## License

See [`LICENSE`](LICENSE), [`LICENSE-APACHE`](LICENSE-APACHE), [`LICENSE-MIT`](LICENSE-MIT), and [`LICENSE-COMMERCIAL.md`](LICENSE-COMMERCIAL.md).
