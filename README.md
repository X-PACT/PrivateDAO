<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# PrivateDAO

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/" target="_blank">
    <img src="docs/assets/frontend-hero.png" alt="PrivateDAO interactive frontend preview" width="900" />
  </a>
</p>

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Open-00e5ff?logo=solana)](https://x-pact.github.io/PrivateDAO/)
[![Frontend](https://img.shields.io/badge/Frontend-docs%2Findex.html-0b7285)](docs/index.html)
[![CI](https://img.shields.io/github/actions/workflow/status/X-PACT/PrivateDAO/ci.yml?branch=main&label=CI)](https://github.com/X-PACT/PrivateDAO/actions/workflows/ci.yml)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-blue)](https://www.anchor-lang.com)
[![License](https://img.shields.io/badge/License-AGPLv3%2B%20%7C%20Apache--2.0%20%7C%20MIT-green)](LICENSE)
[![Submission](https://img.shields.io/badge/Colosseum-Submission%20Ready-ff9f1c)](SUBMISSION.md)
[![Pitch Assets](https://img.shields.io/badge/Pitch-Ready-ff6b6b)](SUBMISSION_FINAL.md)

PrivateDAO is a Solana / Anchor governance protocol for DAOs that want private voting without pretending the rest of governance disappears. Votes are committed privately, revealed later, finalized deterministically, and treasury execution stays behind an explicit timelock with recipient and mint checks.

The point is simple: public live tallies create whale pressure, vote buying, and treasury signaling. Commit-reveal does not solve every governance problem, but it removes one of the ugliest ones without changing the whole stack.

GitHub Pages source: `docs/` via `.github/workflows/pages.yml`.

## Submission Assets

The repo now includes a ready-to-use package for judges, reviewers, and public sharing:

- `SUBMISSION.md` for the main project submission
- `SUBMISSION_FINAL.md` for a stronger final-form submission draft
- `COLOSSEUM_FORUM_POST.md` for the Colosseum public forum
- `SUPERTEAM_POST.md` for a Superteam builder post
- `SUPERTEAM_INSTAGRANT.md` for a Superteam Instagrant-style application draft
- `SOCIAL_THREAD.md` for tweet/thread copy
- `DEMO_SCRIPT_90S.md` for a 60 to 90 second judge demo

## Hackathon Context

PrivateDAO is being prepared as a serious Solana builder submission, but the README stays grounded in what the repo actually does today.

- Main event context: Solana Graveyard Hackathon 2026
- Submission angles already reflected in the codebase:
  - DAOs / Realms-oriented governance tooling
  - Sunrise-style migration path
  - Overall Solana Foundation quality bar
- Official ecosystem partners listed for the Graveyard hackathon include:
  - Solana Foundation
  - Sunrise
  - Realms
  - Exchange Art
  - Tapestry
  - MagicBlock
  - KYD Labs
  - Portals
  - DRiP
  - Torque
  - BIO
  - Audius
  - OrbitFlare

That context matters for positioning, but this repo does not claim prize results, grants, accelerator acceptance, or funding that have not actually happened. When we mention grants or follow-on support, we mean the broader Solana ecosystem paths this project is suitable for, not money already awarded.

## Current Status

- Devnet program deployed at `62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm`
- Current repo targets `Anchor 0.31.1`
- Local tests cover commit, reveal, finalize, execute, cancellation, delegation, keeper reveal, and treasury validation paths
- This repo is production-minded, but still devnet-first and not represented as a completed mainnet governance system

## What Goes On Solana

For this kind of project, you do not upload the whole repository to Solana.

- The on-chain program is what gets deployed to the Solana network
- The repository stays in GitHub as the source of truth for code, scripts, SDK, docs, and frontend assets
- The docs frontend can be hosted separately, such as GitHub Pages
- Operators and users interact with the deployed program through RPC, wallets, scripts, SDK calls, or the frontend

So if the question is "does the project need to be on Solana?", the practical answer is:

- yes, the program should be deployed on Solana if you want a real working product
- no, the rest of the project is not stored on-chain and should not be treated as something you "upload to Solana"

## What Exists Today

- Commit-reveal voting with hidden tally during the voting window
- Voting modes:
  - `TokenWeighted`
  - `Quadratic`
  - `DualChamber` with separate capital and community thresholds
- Proposal lifecycle:
  - create
  - commit
  - reveal
  - finalize
  - timelocked execute
  - authority cancel during voting
  - authority veto during timelock
- Treasury actions:
  - `SendSol` fully wired on-chain
  - `SendToken` fully wired on-chain with mint, authority, and recipient-owner checks
  - `CustomCPI` intentionally emits an execution event only; off-chain relayer handling is still the chosen pattern here
- Optional keeper-authorized reveal
- Proposal-scoped private delegation
- Treasury deposit helper
- Realms-oriented migration helper and voter-weight record account
- Docs frontend published from `docs/index.html`

## Backend And Frontend Fit

This project is not a disconnected smart contract plus a decorative landing page. The pieces are meant to describe the same governance flow from different layers:

- `programs/private-dao/src/lib.rs` is the source of truth for the lifecycle and treasury rules
- `sdk/src/index.ts` exposes the same vote commitment primitive used by the on-chain program
- `scripts/` are operator-facing flows for DAO creation, proposal creation, commit, reveal, finalize, execute, deposit, and migration
- `docs/index.html` and the published GitHub Pages frontend explain the same flow in a way reviewers, sponsors, judges, and DAO operators can follow quickly

The goal is simple: what the frontend says should match what the program enforces, and what the scripts do should match both. That alignment matters more right now than flashy UI changes, especially while the project is under hackathon review.

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
bash scripts/check-contracts.sh 62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm
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
