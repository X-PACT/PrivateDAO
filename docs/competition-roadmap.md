# Competition Roadmap

## Objective

PrivateDAO already has one verified 1st Place result:

- **🥇 1st Place — Superteam Earn**
- **Challenge:** Rebuild production backend systems as on-chain Rust programs

The next competitive objective is not vague visibility. It is to keep targeting **1st Place outcomes** in serious Solana engineering competitions by reducing reviewer doubt and increasing proof density.

## Must Win

These are the highest-leverage improvements for future 1st Place submissions.

### 0. Strategy-track fit before polish

For Ranger-style competitions, the biggest risk is not weak UI. It is weak track fit.

The project must be presented as:

- a governance and risk-control layer for a real strategy

not as:

- a generic private DAO product hoping to be interpreted as a vault strategy

That distinction directly affects score on:

- strategy quality
- production viability
- novelty
- risk management

### 1. Wallet-connected proposal lifecycle in the live frontend

The docs surface should not stop at reading proposals. It should let a reviewer:

- connect wallet
- create a DAO
- create a proposal
- commit a vote
- reveal a vote
- finalize a proposal
- execute a passed proposal

This is the single strongest product-layer upgrade because it collapses the gap between protocol quality and evaluator experience.

### 2. Proposal detail page with direct proof links

Each proposal should have a dedicated page that shows:

- proposal PDA
- DAO PDA
- treasury PDA
- current phase
- explorer links for proposal and treasury
- transaction history for create, commit, reveal, finalize, execute

The goal is to let a judge verify the full lifecycle without reading the code first.

### 3. Security proof surface

Add a reviewer-facing security note that maps protocol claims to tests:

- invalid transition rejection
- treasury wiring rejection
- delegation misuse rejection
- double execute rejection
- timing window enforcement

This should feel like an audit-minded checklist, not marketing.

The stronger additive path is now already part of that direction:

- `Governance Hardening V3`
- `Settlement Hardening V3`
- dedicated Devnet proof in `docs/test-wallet-live-proof-v3.generated.md`

### 4. Mainnet readiness checklist

The repo already argues that the protocol is structurally ready for mainnet transition. The next step is to make that claim concrete with a checklist covering:

- release gating
- deploy authority handling
- RPC policy
- monitoring
- treasury operational controls
- incident rollback and pause assumptions

## Should Win

These upgrades are not as critical as the list above, but they materially improve ranking.

### 1. Richer live demo mode

Extend the current live proof surface so the repo can produce:

- single-wallet proof
- multi-voter proof
- delegated-vote proof
- keeper-reveal proof
- `SendSol` and `SendToken` execution proof

The additive V3 path should be surfaced alongside the baseline proof whenever the stricter hardening path matters to judges.

### 2. Track-specific submission packaging

Do not use the same narrative for every competition.

- Main Track should position PrivateDAO as governance infrastructure
- Drift Side Track should position PrivateDAO as private decision infrastructure for trading collectives, treasury committees, and strategy execution approvals

### 3. Benchmark and UX proof

Judges respond well to explicit operational clarity:

- number of transactions in full lifecycle
- expected latency by phase
- operator steps required
- failure modes and recovery path

## Nice To Have

- reviewer dashboard for latest proof run
- auto-generated explorer tables after `npm run live-proof`
- short security animations in the frontend
- dedicated ecosystem integration note for Realms and treasury tooling

## Track Positioning

## Ranger Build-A-Bear Hackathon Main Track

Winning angle:

- PrivateDAO is not just DAO UI work
- it is protocol-grade governance infrastructure
- it proves a full on-chain lifecycle with private voting and disciplined treasury execution

What to emphasize:

- live devnet proof
- transaction-linked reviewer flow
- production-minded architecture
- immediate mainnet transition path

## Ranger Build-A-Bear Hackathon Drift Side Track

Winning angle:

- Drift-native groups, trading DAOs, vault operators, and treasury committees need private internal decision making before execution
- PrivateDAO gives them hidden voting with deterministic on-chain settlement

What to emphasize:

- treasury signaling problem
- risk committee and trading strategy approval use cases
- timelock and execution checks
- privacy without sacrificing accountability

## Submission Standard

For future top-tier submissions, every package should include:

1. one-line thesis
2. live frontend link
3. devnet program link
4. live proof note with tx hashes
5. 60 to 90 second video
6. short security note
7. track-specific narrative
8. explicit statement of what is implemented now versus what belongs to the strategy layer

That is the minimum surface for consistently competing for 1st Place instead of simply being shortlisted.
