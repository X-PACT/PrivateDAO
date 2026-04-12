<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# PrivateDAO

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/" target="_blank">
    <img src="docs/assets/frontend-hero.png" alt="PrivateDAO interactive frontend preview" width="900" />
  </a>
</p>

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Open-00e5ff?logo=solana)](https://x-pact.github.io/PrivateDAO/)
[![Web Surface](https://img.shields.io/badge/Web-Live%20Governance%20Surface-0ea5e9)](https://x-pact.github.io/PrivateDAO/)
[![Android Native](https://img.shields.io/badge/Android-Kotlin%20Native-7c3aed)](docs/android-native.md)
[![Mobile Wallet](https://img.shields.io/badge/Mobile-MWA%20Ready-22c55e)](docs/android-native.md)
[![Android Runtime](https://img.shields.io/badge/Android-Runtime%20Scripts-16a34a)](docs/android-native.md)
[![Android Reviewer Runbook](https://img.shields.io/badge/Android-Reviewer%20Runbook-0ea5e9)](docs/android-native-reviewer-runbook.md)
[![Award](https://img.shields.io/badge/Award-1st%20Place%20Superteam%20Earn-gold)](docs/awards.md)
[![Built on](https://img.shields.io/badge/Built%20on-Solana-purple)](https://solana.com)
[![Category](https://img.shields.io/badge/Category-Backend%20Systems-blue)](docs/awards.md)
[![Frontend](https://img.shields.io/badge/Web%20Frontend-docs%2Findex.html-0b7285)](docs/index.html)
[![CI](https://img.shields.io/github/actions/workflow/status/X-PACT/PrivateDAO/ci.yml?branch=main&label=CI)](https://github.com/X-PACT/PrivateDAO/actions/workflows/ci.yml)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-blue)](https://www.anchor-lang.com)
[![License](https://img.shields.io/badge/License-AGPLv3%2B%20%7C%20Apache--2.0%20%7C%20MIT-green)](LICENSE)
[![Submission](https://img.shields.io/badge/Colosseum-Submission%20Ready-ff9f1c)](SUBMISSION.md)
[![Pitch Assets](https://img.shields.io/badge/Pitch-Ready-ff6b6b)](SUBMISSION_FINAL.md)
[![Demo Reel](https://img.shields.io/badge/Demo-Reel-14b8a6)](docs/assets/demo-reel.gif)
[![Program](https://img.shields.io/badge/Program-Devnet%20Live-14F195)](https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet)
[![Security Surface](https://img.shields.io/badge/Security%20Surface-Lifecycle%20%2B%20Replay%20%2B%20Treasury%20%2B%20Delegation%20Hardened-0f766e)](docs/security-review.md)
[![Threat Model](https://img.shields.io/badge/Threat%20Model-Complete-1d4ed8)](docs/threat-model.md)
[![Replay Analysis](https://img.shields.io/badge/Replay%20Analysis-Verified-7c3aed)](docs/replay-analysis.md)
[![Atomicity](https://img.shields.io/badge/Atomicity-Verified-15803d)](docs/failure-modes.md)

PrivateDAO is a Solana governance protocol for DAOs that want private voting without giving up execution safety. Votes are committed privately, revealed later, finalized deterministically, and treasury execution stays behind an explicit timelock with recipient and mint checks.

The problem statement is simple and easy for judges to verify: public live tallies create whale pressure, vote buying, and treasury signaling. PrivateDAO removes live vote visibility while keeping the rest of the governance lifecycle inspectable, testable, and compatible with how Solana teams actually operate.

## Why PrivateDAO Exists

Public governance leaks intent too early.

That creates predictable failure modes:

- whale pressure
- vote buying
- treasury signaling
- execution manipulation around visible intent

PrivateDAO exists to resist those failure modes with:

- commit-reveal voting
- state-machine governance
- timelocked execution
- strict treasury validation
- replay-resistant lifecycle checks

## What Is Implemented

What is real in the current implementation:

- voting is executed on-chain through the Solana program
- proposal accounts are read live from on-chain program state
- any wallet holding the DAO governance token can create a proposal
- commit, reveal, finalize, cancel, veto, and execute are implemented in the program
- the operator scripts print real transaction signatures and Solscan links for verification

The current stack is already structured for immediate **mainnet transition**. The lifecycle, permissions, execution checks, and operator flows are live on-chain today; moving from devnet to mainnet is an operational deployment step, not a product redesign.

## Security At A Glance

PrivateDAO is designed around one core requirement: preventing governance manipulation without sacrificing execution safety.

Current security hardening covers:

- lifecycle bypass resistance
- commit-reveal integrity
- signer and authority validation
- proposal and account binding correctness
- treasury miswiring rejection
- duplicate execution prevention
- failed-path state preservation
- replay-oriented reasoning and coverage mapping

See:

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`
- `docs/failure-modes.md`
- `docs/replay-analysis.md`

## Why Security Is Core

PrivateDAO is not trying to make governance merely private. It is trying to make private governance defensible.

A private voting system that can be replayed, misbound, bypassed, or mis-executed would fail the exact problem it claims to solve.

That is why PrivateDAO treats lifecycle enforcement, signer correctness, account binding, replay resistance, and treasury safety as core protocol guarantees.

Quick links:

- Live frontend: `https://x-pact.github.io/PrivateDAO/`
- Proof Center: `https://x-pact.github.io/PrivateDAO/?page=proof`
- Judge Mode: `https://x-pact.github.io/PrivateDAO/?page=proof&judge=1`
- Android native guide: `docs/android-native.md`
- Awards page: `docs/awards.md`
- Strategy documentation: `https://us04docs.zoom.us/doc/Zd34HEaHSKyZGRxBcqxXQg`
- Repo strategy note: `docs/strategy.md`
- Ranger strategy documentation: `docs/ranger-strategy-documentation.md`
- Strategy blueprint: `docs/strategy-blueprint.md`
- Strategy adaptor interface: `docs/strategy-adaptor-interface.md`
- Strategy operations: `docs/strategy-operations.md`
- Ranger eligibility checklist: `docs/ranger-submission-checklist.md`
- Ranger strategy config: `docs/ranger-strategy-config.devnet.json`
- Ranger strategy template: `docs/ranger-strategy-config.sample.json`
- Ranger risk policy: `docs/risk-policy.md`
- Performance evidence: `docs/performance-evidence.md`
- Submission dossier: `docs/submission-dossier.md`
- Submission registry: `docs/submission-registry.json`
- Competition readiness: `docs/competition-readiness.md`
- Audit packet: `docs/audit-packet.generated.md`
- Review attestation: `docs/review-attestation.generated.json`
- Verification gates: `docs/verification-gates.md`
- Reviewer fast path: `docs/reviewer-fast-path.md`
- Judge technical audit note: `docs/judge-technical-audit.md`
- Security review surface: `docs/security-review.md`
- Mainnet readiness note: `docs/mainnet-readiness.md`
- Production operations: `docs/production-operations.md`
- Monitoring and alerts: `docs/monitoring-alerts.md`
- Incident response: `docs/incident-response.md`
- Mainnet cutover runbook: `docs/mainnet-cutover-runbook.md`
- Operator checklist: `docs/operator-checklist.md`
- Risk register: `docs/risk-register.md`
- Audit handoff: `docs/audit-handoff.md`
- Reviewer surface map: `docs/reviewer-surface-map.md`
- Competition roadmap: `docs/competition-roadmap.md`
- Ranger Main Track memo: `docs/ranger-main-track.md`
- Ranger Drift Track memo: `docs/ranger-drift-track.md`
- Live devnet proof: `docs/live-proof.md`
- Devnet release manifest: `docs/devnet-release-manifest.md`
- Proof registry: `docs/proof-registry.json`
- Investor video package: `docs/investor-video.md`
- YouTube pitch video: `https://youtu.be/KVNFZXHNZTQ`
- Repo-native video asset: `https://x-pact.github.io/PrivateDAO/assets/private-dao-investor-pitch.mp4`
- On-chain program: `programs/private-dao/src/lib.rs`
- End-to-end lifecycle test: `tests/full-flow-test.ts`

## Reviewer Fast Path

If a judge only has 2-3 minutes, the strongest review order is:

1. Open `https://x-pact.github.io/PrivateDAO/?page=security`
2. Open `docs/threat-model.md`
3. Open `docs/security-review.md`
4. Open `tests/private-dao.ts`
5. Open `tests/full-flow-test.ts`
6. Open `docs/security-coverage-map.md`
7. Open the live proof note and devnet explorer references

Condensed reviewer handoff:

- `docs/reviewer-fast-path.md`

## Ranger / Drift Fit

PrivateDAO is strongest for Ranger and Drift when it is framed honestly:

- not as a complete seeded vault strategy by itself
- but as the private governance and risk-control layer for a real USDC strategy stack

That is the differentiated value in these competitions:

- hidden committee approvals
- timelocked execution discipline
- treasury and execution checks
- real on-chain proof for governance-sensitive actions

Submission references for this angle:

- `docs/ranger-strategy-documentation.md`
- `docs/strategy-operations.md`
- `docs/ranger-submission-checklist.md`
- `docs/ranger-main-track.md`
- `docs/ranger-drift-track.md`
- `docs/judge-technical-audit.md`
- `docs/security-review.md`

Core review commands:

```bash
npm run verify:all
```

Packaged review handoff:

```bash
npm run build:review-bundle
```

Full gate breakdown:

- `docs/verification-gates.md`

This verification layer is also enforced in CI, so the reviewer-facing evidence path, live-proof references, and ops package are checked on every push and pull request.

## Threat Coverage

Reviewer-visible coverage currently includes:

- lifecycle bypass
- replay and duplicate execution
- signer misuse
- PDA and account substitution
- treasury miswiring
- invalid reveal and commitment mismatch
- timing boundary misuse
- delegation misuse
- execution invariants
- failed-path atomicity

The formal mapping lives in `docs/security-coverage-map.md`.

## Known Limitations

PrivateDAO is explicit about what remains limited:

- the project is devnet-first
- direct-commit versus delegation overlap is still guarded operationally in product surfaces rather than fully enforced on-chain
- commit-reveal hides vote content, not transaction timing metadata
- `CustomCPI` remains intentionally event-only
- local validator startup is environment-sensitive in this shell
- mainnet audit completeness is not claimed

## Documentation Index

Security and review documents:

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`
- `docs/failure-modes.md`
- `docs/replay-analysis.md`
- `docs/protocol-spec.md`
- `docs/security-architecture.md`
- `docs/security-guarantees.md`
- `docs/protocol-maturity.md`
- `docs/judge-technical-audit.md`
- `docs/mainnet-readiness.md`
- `docs/production-operations.md`
- `docs/monitoring-alerts.md`
- `docs/incident-response.md`
- `docs/mainnet-cutover-runbook.md`
- `docs/operator-checklist.md`
- `docs/risk-register.md`
- `docs/audit-handoff.md`
- `docs/reviewer-surface-map.md`
- `docs/independent-verification.md`
- `docs/attack-simulation-log.md`
- `docs/devnet-release-manifest.md`
- `docs/proof-registry.json`

Protocol and product documents:

- `docs/live-proof.md`
- `docs/strategy.md`
- `docs/android-native.md`
- `docs/awards.md`
- `docs/ranger-strategy-documentation.md`
- `docs/strategy-blueprint.md`
- `docs/strategy-adaptor-interface.md`
- `docs/strategy-operations.md`
- `docs/risk-policy.md`
- `docs/performance-evidence.md`
- `docs/submission-dossier.md`
- `docs/submission-registry.json`
- `docs/competition-readiness.md`
- `docs/audit-packet.generated.md`
- `docs/review-attestation.generated.json`
- `docs/verification-gates.md`
- `docs/reviewer-fast-path.md`
- `docs/use-cases.md`
- `docs/economic-model.md`

## Independent Verification

If you want to verify the system without trusting any summary, start here:

- `docs/independent-verification.md`

This guide is designed to let an external reviewer:

- set up the environment
- reproduce the lifecycle
- inspect transaction hashes
- verify treasury balance changes
- reproduce rejection paths

## Attack Simulation Log

Compact reviewer-facing misuse attempts are indexed in:

- `docs/attack-simulation-log.md`

## ⚡ One-Line Install

Bootstrap the repository with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/X-PACT/PrivateDAO/main/scripts/install.sh | bash
```

The installer:

- checks required tools
- creates `.env` from `.env.example` when missing
- installs Node dependencies
- prints the next real steps for demo and build

## Android Native App

PrivateDAO now includes a real Android-native app under `apps/android-native/`.

This mobile app is built as an Android-first counterpart of the current project because Solana Mobile Wallet Adapter is the official mobile dApp path for Android today. The product direction is to make mobile a first-class operating surface for the same governance services already exposed through the web app. The stack is:

- Kotlin native
- Jetpack Compose
- Solana Mobile Wallet Adapter
- Devnet by default

What the Android app mirrors from the current product:

- same devnet program ID
- same proposal phases and lifecycle
- same PDA derivations
- same commit-reveal semantics
- same governance terminology
- same proof-first positioning for judges and reviewers
- same authority-driven cancel / veto semantics

Current Android-native mobile support:

- create DAO
- deposit treasury
- connect wallet through MWA
- load DAOs and proposals from devnet
- inspect proposal details and phase
- create proposal
- commit vote
- reveal vote
- finalize proposal
- cancel proposal from the authority wallet
- veto proposal during timelock from the authority wallet
- execute proposal for SOL and token treasury paths
- view tx signatures and explorer links
- open proof, monitoring, incident, and reviewer continuity links from inside the app
- view awards / credibility surface

Current delivery posture:

- the Android app is already usable for the core governance and treasury lifecycle on devnet
- the Android app is being developed to reach broader service parity with the web app
- web-dense reviewer centers and some proof-heavy surfaces remain linked from mobile while they continue moving toward deeper native coverage

Android-native system diagram:

```text
Android wallet user
  -> Compose UI
  -> PrivateDaoViewModel
  -> PrivateDaoRepository
  -> Mobile Wallet Adapter
  -> Solana devnet RPC + PrivateDAO program
  -> tx signature + explorer link back to the app
```

Reference:

- Native app root: `apps/android-native/`
- Android guide: `docs/android-native.md`

## Live Devnet Proof

The repository now includes a captured real governance run on devnet with explorer links for:

- deploy
- create DAO
- mint voting power
- deposit treasury
- create proposal
- commit
- reveal
- finalize
- execute

Reference: `docs/live-proof.md`

## 🏆 Awards & Recognition

PrivateDAO-related engineering work has been recognized in competitive Solana development challenges.

### 🥇 1st Place — Superteam Earn

- **Challenge:** Rebuild production backend systems as on-chain Rust programs
- **Position:** 1st Place
- **Platform:** Superteam Poland
- **Date:** March 2026

**Summary:**

This achievement recognizes 1st Place in the challenge **"Rebuild production backend systems as on-chain Rust programs"** on Superteam Poland.

The system demonstrates:

- State-based architecture modeling
- Permission and execution logic
- Distributed system design patterns
- Real-world backend workflow translation

#### 🔗 Reference

- Platform: https://earn.superteam.fun
- Repository: https://github.com/X-PACT/PrivateDAO
- Demo: https://x-pact.github.io/PrivateDAO/
- Award note: `docs/awards.md`

## 🎯 Current Hackathon Submissions

PrivateDAO is currently being presented in the following live competitive tracks:

- `Ranger Build-A-Bear Hackathon` Main Track
- `Ranger Build-A-Bear Hackathon` Drift Side Track

These are active submissions, not award claims. They are listed separately from the verified 1st Place Superteam Earn result above.

Track-specific submission notes:

- `docs/ranger-main-track.md`
- `docs/ranger-drift-track.md`

## On-Chain Execute Surface

The win documentation is separate from governance execution.

- The award section documents only the verified 1st Place result.
- The `Execute` button belongs to proposal lifecycle handling and appears only when a proposal is executable on-chain after finalize plus timelock expiry.
- The frontend maps the button to the repo execution flow instead of pretending execution is a decorative UI action.
- The Proof Center now also exposes wallet-connected `Finalize in Wallet` and `Execute in Wallet` actions for compatible live proposals.
- The live UI now also supports browser-native `Create Proposal`, `Commit`, and `Reveal` flows for the standard governance path, while keeping the equivalent repo commands visible for reviewers and operators.
- The live UI now also exposes proposal-scoped delegation actions and live per-proposal transaction history from devnet RPC for the selected proposal.
- The authority surface now also includes wallet-connected `Cancel` and `Veto` actions for the selected proposal, and proposal activity is labeled from parsed on-chain transaction logs rather than shown as raw signatures only.
- The reveal surface now supports keeper-style reveal by targeting a voter record explicitly when the keeper was authorized at commit time.
- The operator surface now also supports browser-native `Create DAO` and `Deposit Treasury` actions instead of leaving those steps as command-only flows.
- The operator command is:

```bash
yarn execute -- --proposal <PROPOSAL_PUBKEY>
```

GitHub Pages source: `docs/` via `.github/workflows/pages.yml`.

## One-Line Pitch

PrivateDAO brings commit-reveal voting, proposal-scoped private delegation, keeper-assisted reveal, and timelocked treasury execution to Solana DAOs in one working stack.

## 🎬 Investor Video Package

<p align="center">
  <a href="https://youtu.be/KVNFZXHNZTQ" target="_blank">
    <img src="docs/assets/private-dao-investor-pitch-poster.png" alt="PrivateDAO investor pitch video poster" width="900" />
  </a>
</p>

- Strategy documentation for judges, partners, and investors: `https://us04docs.zoom.us/doc/Zd34HEaHSKyZGRxBcqxXQg`
- Watch the YouTube pitch video: `https://youtu.be/KVNFZXHNZTQ`
- Repo-native video asset: `https://x-pact.github.io/PrivateDAO/assets/private-dao-investor-pitch.mp4`
- Video brief and production package: `docs/investor-video.md`
- Voiceover script: `docs/video-voiceover.md`
- Shotlist and visual direction: `docs/video-shotlist.md`
- Poster asset: `docs/assets/private-dao-investor-pitch-poster.png`

## 🧪 Local Demo

Run the repository demonstration end-to-end with:

```bash
npm run demo
```

This exercises the real lifecycle through Anchor tests, including proposal creation, commit, reveal, finalize, execute, delegation, and cancellation.

## 🧭 System Diagram

```text
Users
  DAO authority
  Governance token holder
  Operator / evaluator

Client surface
  docs/index.html live frontend
  scripts/*.ts operator flows
  sdk/src/index.ts commitment helpers

On-chain core
  programs/private-dao/src/lib.rs

Accounts
  DAO PDA
  Proposal PDA
  VoteRecord PDA
  Treasury PDA
  VoterWeightRecord

Verification
  tests/full-flow-test.ts
  tests/demo.ts
  Solscan tx and account links
```

## 🏛️ Account And Execution Diagram

```text
Initialize DAO
  -> DAO PDA stores authority, governance mint, quorum, reveal window, and execution delay
  -> token holder creates proposal
  -> Proposal PDA stores title, status, voting_end, reveal_end, and treasury_action
  -> commit_vote
  -> VoteRecord PDA stores commitment, weight snapshot, keeper, and delegation context
  -> reveal_vote
  -> proposal tallies update on-chain
  -> finalize_proposal
  -> if passed, execution_unlocks_at is set
  -> execute_proposal
  -> treasury action executes with recipient and mint checks
```

## 🚀 Mainnet Transition Readiness

PrivateDAO is already built around a real on-chain lifecycle, which means the mainnet move is straightforward in architecture terms:

- the program logic is not mocked and already enforces commit, reveal, finalize, veto, and execute
- proposal creation is already permissioned by real governance token ownership
- execution is already timelocked and checked on-chain
- the frontend and scripts already read and operate against real program state
- the repository already contains the proof surface expected before a mainnet cutover: tests, docs, scripts, and explorer-oriented outputs

In practical terms, the project is ready for mainnet transition as soon as the operator chooses the production deployment path and standard release controls.

## 🧩 Project Surface Map

- 🦀 `programs/private-dao/src/lib.rs`: the on-chain source of truth for DAO initialization, proposal lifecycle, commit-reveal voting, timelock, veto, treasury execution, delegation, keeper reveal, and Realms-oriented migration.
- 📦 `sdk/src/index.ts`: shared commitment utilities for generating salts, encoding vote envelopes, and matching the on-chain `sha256(vote || salt || pubkey)` flow.
- 🛠️ `scripts/`: operator workflows for DAO creation, proposal creation, deposit, delegation, commit, reveal, finalize, execute, and migration.
- 🧪 `tests/private-dao.ts`, `tests/full-flow-test.ts`, `tests/demo.ts`: behavioral coverage for the governance lifecycle, treasury execution, and walkthrough-grade demonstrations.
- 🌐 `docs/index.html`: the live GitHub Pages frontend that explains the protocol, surfaces proposal state, and now exposes awards and recognition content.
- 🔄 `migrations/migrate-realms-dao.ts`: migration entry point for DAOs preserving Realms provenance while moving into PrivateDAO.

## 🔁 Lifecycle Diagram

```text
Initialize DAO
  -> Create Proposal
  -> Commit vote hashes
  -> Reveal vote and salt
  -> Finalize outcome
  -> if passed: timelock window -> veto or execute
  -> if not passed: failed / cancelled / vetoed terminal states
```

## Why This Stands Out

- The protocol is live on Solana devnet, not simulated.
- The governance lifecycle is complete: create, commit, reveal, finalize, veto, cancel, and execute.
- The repository contains the product surface, protocol surface, and proof surface in one place.
- The project now has both a live web surface and an Android-native mobile surface.
- The problem is easy for judges to understand: public tallies leak intent too early.

## Current Product Surface

- Live devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- GitHub Pages frontend: `docs/index.html`
- Android-native app: `apps/android-native/`
- End-to-end lifecycle tests: `tests/full-flow-test.ts`, `tests/demo.ts`
- Operator scripts: `scripts/`
- Live proof note: `docs/live-proof.md`

## Quick Review Pack

- Live frontend: `https://x-pact.github.io/PrivateDAO/`
- Judge Mode: `https://x-pact.github.io/PrivateDAO/?page=proof&judge=1`
- Proof Center: `https://x-pact.github.io/PrivateDAO/?page=proof`
- Android-native guide: `docs/android-native.md`
- Main submission: `SUBMISSION.md`
- Final-form submission: `SUBMISSION_FINAL.md`
- Demo script: `DEMO_SCRIPT_90S.md`

## Ownership And Contact

PrivateDAO is independently built and maintained by **Fahd Kotb**.

- Primary email: [fahd.kotb@tuta.io](mailto:fahd.kotb@tuta.io)
- Secondary email: [i.kotb@proton.me](mailto:i.kotb@proton.me)
- Operations email: [eslamkotb.fmt@gmail.com](mailto:eslamkotb.fmt@gmail.com)
- Additional contact: [eslamkotb.369@gmail.com](mailto:eslamkotb.369@gmail.com)
- WhatsApp: [+20 112 403 0209](https://wa.me/201124030209)
- WhatsApp backup: [+20 107 000 4967](https://wa.me/201070004967)
- X: [@FahdX369](https://x.com/FahdX369)
- Telegram: [@Fahdkotb](https://t.me/Fahdkotb)

## What Exists Today

- Commit-reveal voting with hidden tally during the voting window
- Voting modes:
  - `TokenWeighted`
  - `Quadratic`
  - `DualChamber`
- Treasury actions:
  - `SendSol`
  - `SendToken`
  - `CustomCPI` event-only relay path
- Proposal-scoped private delegation
- Keeper-authorized reveal
- Timelock and veto model
- Realms-oriented migration and voter-weight compatibility path
- Android-native mobile app using Kotlin + Solana Mobile Wallet Adapter

## Safety Model

Current on-chain safety properties:

- Commitment binding uses `sha256(vote_byte || salt_32 || voter_pubkey_32)`
- Vote weight is snapshotted at commit time
- Reveal is limited to the voter or the voter-approved keeper
- Cancelled proposals can no longer progress through reveal/finalize/execute
- Finalization is permissionless but only after `reveal_end`
- Execution is permissionless but only after `execution_unlocks_at`
- Veto is only possible while the proposal is passed, unexecuted, and still inside the timelock window
- Treasury SOL execution enforces the configured recipient
- Treasury token execution enforces:
  - treasury token account owned by the treasury PDA
  - action mint matches both token accounts
  - recipient token owner matches the configured recipient
  - source and destination token accounts are not the same account
- Delegation is one-shot per proposal and self-delegation is rejected

This is still not a claim of audit completeness. It is a real protocol with real checks, not a claim that governance risk is solved forever.

## Repository Layout

```text
programs/private-dao/src/lib.rs      Anchor program
tests/private-dao.ts                 Core behavior tests
tests/full-flow-test.ts              End-to-end lifecycle + treasury tests
tests/demo.ts                        Demo walkthrough test
scripts/                             CLI helpers for local/devnet operation
migrations/migrate-realms-dao.ts     Realms migration helper
sdk/src/index.ts                     SDK entrypoint
docs/                                GitHub Pages frontend and docs assets
```

## Local Development

Prerequisites:

- Rust stable
- Solana CLI
- Anchor CLI `0.31.1`
- Node.js
- Yarn or npm

Official Solana references used by this repo:

- RPC reference: https://solana.com/docs/rpc
- The project relies directly on standard JSON-RPC methods such as `getVersion`, `getAccountInfo`, `getProgramAccounts`, `getSlot`, and `getBlockTime`
- Commitment guidance from the Solana docs matters here:
  - use `confirmed` when tracking progress for dependent actions
  - use `finalized` when you need the safest read semantics

Current tool expectations for this repository:

- `solana` CLI is still expected for full local validator, deploy, and some shell workflows
- `@solana/web3.js` is what the current scripts, SDK, and docs frontend use today
- RPC-only fallbacks now exist for some checks, so not every operational script requires the Solana CLI just to inspect devnet state

Install dependencies:

```bash
yarn install
yarn typecheck
```

Start a validator in another terminal:

```bash
solana-test-validator --reset
```

Build:

```bash
anchor build
```

Run all tests:

```bash
anchor test
```

Run targeted suites:

```bash
anchor test -- --grep "PrivateDAO"
anchor test -- --grep "Full flow"
anchor test -- --grep "demo"
```

Run verification helpers:

```bash
bash scripts/verify.sh tools
bash scripts/verify.sh fmt
bash scripts/verify.sh lint
bash scripts/verify.sh build
bash scripts/verify.sh test
bash scripts/verify.sh scan
bash scripts/verify.sh rpc
bash scripts/verify.sh rpc-health-unit
bash scripts/verify.sh rpc-health
```

## Devnet Workflow

Set wallet and RPC:

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export ALCHEMY_API_KEY="<alchemy-key>"
solana config set \
  --keypair "$ANCHOR_WALLET" \
  --url "https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
```

Fallbacks already supported by the scripts:

- `ALCHEMY_DEVNET_RPC_URL`
- `HELIUS_API_KEY`
- `QUICKNODE_DEVNET_RPC`
- `EXTRA_DEVNET_RPCS`
- `RPC_AUTH_HEADER`
- `CUSTOM_FAUCET_URL`
- `CUSTOM_FAUCET_METHOD`

RPC behavior note:

- `scripts/check-rpc-health.sh` validates RPC availability with `getVersion`
- the docs frontend and `yarn list-proposals` rely on account reads such as `getProgramAccounts`, `getSlot`, and `getBlockTime`
- `scripts/check-contracts.sh` now supports JSON-RPC fallback account inspection when `solana` CLI is not installed

Fund and sanity-check devnet access:

```bash
bash scripts/fund-devnet.sh 2
bash scripts/check-rpc-health.sh
```

Deploy:

```bash
anchor build
anchor deploy --provider.cluster devnet
```

Or use the repo deploy script:

```bash
./deploy.sh
```

Validate deployed addresses:

```bash
bash scripts/check-contracts.sh 5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx
```

## Scripts

The CLI scripts are meant for actual local/devnet usage, not throwaway demo wrappers.

- `scripts/create-dao.ts`
- `scripts/create-proposal.ts`
- `scripts/deposit-treasury.ts`
- `scripts/list-proposals.ts`
- `scripts/delegate-vote.ts`
- `scripts/commit-vote.ts`
- `scripts/reveal-vote.ts`
- `scripts/finalize.ts`
- `scripts/execute.ts`

Example flow:

```bash
yarn create-dao -- --name "MyDAO" --quorum 51 --mode dual
yarn deposit -- --dao <DAO_PDA> --amount 1.0
yarn create-proposal -- --dao <DAO_PDA> --title "Fund research: 0.1 SOL" --treasury-recipient <RECIPIENT> --treasury-amount 0.1
yarn list-proposals -- --dao <DAO_PDA>
yarn commit -- --proposal <PROPOSAL_PDA> --vote yes
yarn reveal -- --proposal <PROPOSAL_PDA>
yarn finalize -- --proposal <PROPOSAL_PDA>
yarn execute -- --proposal <PROPOSAL_PDA>
```

Token treasury flow:

```bash
yarn create-proposal -- \
  --dao <DAO_PDA> \
  --title "Send treasury tokens" \
  --treasury-type token \
  --treasury-recipient <RECIPIENT_WALLET> \
  --treasury-amount 1000000 \
  --treasury-mint <TOKEN_MINT>
```

`--treasury-amount` for token actions is passed as raw token units.

Keeper reveal note:

- Salt files are stored as `~/.privatedao/salts/<proposal>-<voter>.json`
- The old `~/.privatedao/salts/<proposal>.json` path is still written as a legacy fallback

## Realms Compatibility

Two separate things exist here and should not be conflated:

1. `update_voter_weight_record` writes a Realms-style voter weight record account.
2. `migrate_from_realms` and `migrations/migrate-realms-dao.ts` let a DAO preserve provenance from an existing Realms governance address.

What is true today:

- The repo has a Realms-oriented migration path
- The DAO stores `migrated_from_realms`
- The voter-weight account shape is compatible with the plugin pattern

What is not claimed here:

- full proposal-by-proposal Realms replacement
- automatic Realms proposal mirroring
- a finished end-to-end Realms plugin integration across the whole governance lifecycle

The migration helper is useful. It is not pretending to be a complete Realms drop-in.

## Grants And Ecosystem Funding Fit

PrivateDAO is naturally aligned with the kinds of ecosystem support programs that care about real infra, migration tooling, governance safety, and developer usability.

- Solana Foundation:
  overall hackathon placement and broader ecosystem grant relevance
- Colosseum-managed Solana hackathon pipeline:
  strong fit for continued builder review if verification and product polish keep improving
- Realms ecosystem:
  direct relevance because the repo includes a voter-weight record path and migration-oriented DAO tooling
- Sunrise ecosystem:
  direct relevance because the repo includes a migration helper instead of treating migration as a slide-only promise

This section is intentionally careful: it describes strategic fit, not confirmed sponsorship, grant receipt, or accelerator admission.

## Devnet vs Production Intent

Implemented and exercised now:

- devnet deployment
- local validator testing
- treasury SOL execution
- treasury SPL token execution
- keeper reveal
- delegation
- timelock and veto flow

Still intentionally scoped or deferred:

- `CustomCPI` remains event-only rather than arbitrary CPI from the program
- no claim of mainnet audit readiness
- no claim of censorship-resistant off-chain relayer infrastructure
- no claim that commit-reveal hides metadata such as transaction timing
- no claim that the current Realms path is a full native replacement

## Limitations

- Unrevealed commitments count as abstentions for outcome purposes
- Commit-reveal hides vote choice, not participation timing
- Treasury actions are visible when proposals are created; the hidden part is the tally, not the existence of the proposal itself
- `CustomCPI` is intentionally conservative and does not execute arbitrary CPI on-chain
- Proposal and DAO account layouts are treated as compatibility-sensitive; this repo avoids silent breaking changes to those structures

## Supporting Docs

- `BUILD.md` for toolchain and deploy troubleshooting
- `GUIDE.md` for a longer operator walkthrough
- `SECURITY.md` for vulnerability reporting
- `RELEASE_CHECKLIST.md` for release hygiene
- `SUBMISSION.md` for the hackathon-facing writeup

## License

See `LICENSE`, `LICENSE-APACHE`, `LICENSE-MIT`, and `LICENSE-COMMERCIAL.md`.
