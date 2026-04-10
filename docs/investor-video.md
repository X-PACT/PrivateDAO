# PrivateDAO Investor Video Package

## Objective

Create a premium 45 to 60 second investor-facing explainer video for PrivateDAO that is suitable for:

- grant reviewers
- technical partners
- ecosystem investors
- infrastructure operators

The video must communicate:

- PrivateDAO is serious Solana governance infrastructure
- The backend logic is implemented as on-chain Rust programs
- The system solves real governance leakage problems
- The project now combines protocol hardening, proposal-level `zk_enforced` paths, confidential payroll and bonus approvals, REFHE-gated settlement, a backend read node, Android support, and published cryptographic artifact integrity
- The project has third-party validation through a verified 1st Place achievement
- The final output is a short investor explainer with a clear infrastructure thesis

## Core Claims To Preserve

- Project: PrivateDAO
- Network: Solana
- Architecture: Anchor-based Solana Rust program, SDK, scripts, tests, live docs frontend
- Main mechanism: commit-reveal governance
- Operational properties:
  - hidden tally during voting
  - reveal after voting
  - deterministic finalization
  - timelocked execution
  - treasury safety checks
- Verified recognition:
  - 1st Place — Superteam Earn
  - Platform: Superteam Poland
  - Date: March 2026
- Challenge framing:
  - rebuild production backend systems as on-chain Rust programs

## Source Of Truth In Repo

- Program logic: `programs/private-dao/src/lib.rs`
- SDK commitment helpers: `sdk/src/index.ts`
- Lifecycle coverage: `tests/full-flow-test.ts`
- Live frontend: `repo root Next.js export`
- Awards note: `docs/awards.md`

## Current Explainer Status

- Current known status: the repo-native render is the canonical source of truth in this repo
- Repo-native render script: `scripts/render-investor-video.sh`
- Repo-native rendered asset: `docs/assets/private-dao-investor-pitch.mp4`
- Repo-native poster: `docs/assets/private-dao-investor-pitch-poster.png`

## Mainnet Positioning

The video should explicitly communicate that the product is already prepared for mainnet transition in architecture terms.

That means the video may say:

- the lifecycle is already implemented on-chain
- proposal creation is real and token-gated
- execution already passes through timelock and treasury checks
- moving from devnet to mainnet is a deployment move, not a concept rewrite

The video should not imply a completed external audit or claim production adoption that is not documented.

## New Angle

The current render should communicate that PrivateDAO is growing from private voting into confidential organizational operations and production-grade governance infrastructure.

That means the video should now show:

- private voting
- proposal-level `zk_enforced` hardening
- confidential payroll and bonus approvals
- REFHE-gated confidential settlement
- backend read node and runtime operator surfaces
- Android-native access path
- mainnet transition readiness
- a credible path toward investable governance infrastructure

## Repo Release Plan

The repository carries a usable project explainer artifact directly in the repo, with the MP4 as the canonical public watch surface.

- Primary repo video target: `docs/assets/private-dao-investor-pitch.mp4`
- Poster target: `docs/assets/private-dao-investor-pitch-poster.png`
- Render source: `scripts/render-investor-video.sh`
- README should link to the repo-native MP4 directly

## Packaging Notes

- Do not mention any prize amount
- Keep claims bounded to what the repository and award note support
- Use premium technical styling rather than generic startup hype
- Keep the ending concise, technical, and investable
