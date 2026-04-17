# Frontend Solana Bootcamp Materials

## Purpose

This pack turns the PrivateDAO learning corridor into a complete frontend education module for Solana builders.

It is designed to help a normal Web2 frontend developer move from:

- no wallet-native product experience
- no governance UI intuition
- no RPC visibility discipline
- no privacy-aware payment surface

to:

- a functional Solana dApp operator
- a frontend builder who can ship wallet-first product flows
- a builder who understands how to verify real Devnet outcomes from the browser

## Delivery set

This pack includes:

1. four lecture modules
2. slide-ready material for each lecture
3. plug-and-play starter templates
4. practical assignments
5. quizzes for each lecture
6. direct links into live PrivateDAO routes
7. direct links into the real codebase

## Google Slides delivery

The submission-ready slide deck lives here:

- `https://docs.google.com/presentation/d/1ubzMiYvie7f_5viUWpqPJvjL666TEJCPk527suDxyi8/edit?usp=drivesdk`

Use the deck as the canonical slide-ready export for Google Slides or Canva conversion.

## Google Slides / Canva-ready structure

Use one deck with these sections:

1. cover
2. lecture 1
3. lecture 2
4. lecture 3
5. lecture 4
6. toolkit
7. assignments
8. quizzes
9. why this bootcamp is product-real

## Lecture 1

### Title

From Web2 Frontend to Solana Wallet-First UX

### What this lecture covers

- why wallet-first UX changes frontend architecture on Solana
- how PrivateDAO handles Devnet wallet connection without terminal work
- signer context, corridor selection, and safe first-run routing
- how to move from a homepage into a usable product lane in seconds

### Slide outline

1. Web2 trust assumptions versus wallet-first product flows
2. Why Solana UX breaks when the signer is hidden
3. How PrivateDAO starts from `/start/`
4. Wallet connect, signer context, and readable identity
5. Corridor selection and fast product entry
6. Live route + code references

### Live route

- `https://privatedao.org/start/`

### Code references

- `apps/web/src/app/start/page.tsx`
- `apps/web/src/components/getting-started-workspace.tsx`
- `templates/frontend-solana-bootcamp/wallet-connect-starter/WalletConnectStarter.tsx`

### Assignment

Build a wallet-first entry shell with:

- connect wallet
- signer visibility
- corridor selector
- one-click move into a live route

### Quiz

- What does RPC stand for?
- Why is wallet-first UX not optional on Solana?
- What should a user see immediately after connecting a wallet?

## Lecture 2

### Title

Building Governance UI: Create, Vote, Reveal, Execute

### What this lecture covers

- DAO UI lifecycle
- commit-reveal without vote leakage
- execution state and user trust
- voice-assisted proposal drafting without losing wallet control

### Slide outline

1. Why governance UI usually fails normal users
2. The DAO problem: whale pressure, early vote leakage, execution friction
3. Commit -> reveal -> execute in user language
4. How PrivateDAO keeps the signer boundary intact
5. Live judge path and lifecycle verification
6. Code references and implementation pattern

### Live routes

- `https://privatedao.org/govern/`
- `https://privatedao.org/judge/`

### Code references

- `apps/web/src/app/govern/page.tsx`
- `apps/web/src/components/govern/govern-workbench-client.tsx`
- `apps/web/src/components/governance-voice-command-panel.tsx`
- `templates/frontend-solana-bootcamp/proposal-ui-starter/ProposalUiStarter.tsx`

### Assignment

Build a governance card that supports:

- create proposal
- commit vote
- reveal vote
- execute state
- judge/proof CTA

### Quiz

- Why use commit-reveal?
- What should stay hidden before reveal?
- Why must the wallet remain the execution boundary?

## Lecture 3

### Title

Solana Runtime UX: Fast RPC, Diagnostics, and Activity Tracking

### What this lecture covers

- RPC bottlenecks
- backend-indexed reads
- transaction hashes, logs, and retry-aware state
- why a real Solana UI must surface runtime truth after each action

### Slide outline

1. Why Solana frontend work is also runtime work
2. RPC latency, dropped reads, and stale state
3. How Fast RPC improves user trust
4. Diagnostics and activity tracking as product features
5. How PrivateDAO exposes hashes, logs, and status
6. Code references and reusable widgets

### Live routes

- `https://privatedao.org/dashboard/`
- `https://privatedao.org/diagnostics/`
- `https://privatedao.org/proof/`

### Code references

- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/diagnostics/page.tsx`
- `apps/web/src/lib/devnet-service-metrics.ts`
- `templates/frontend-solana-bootcamp/runtime-activity-starter/RuntimeActivityStarter.tsx`

### Assignment

Build a runtime activity widget showing:

- latest action
- tx hash
- current status
- diagnostics hint
- verification CTA

### Quiz

- Why does optimized RPC affect UX quality?
- What must the user see after a wallet action?
- What is the difference between a success toast and verified runtime state?

## Lecture 4

### Title

Private Payments, Gaming DAO, ZK Proof, and Agentic Treasury Rails

### What this lecture covers

- private governance and payout UX
- ZK as proof and confidentiality boundary
- REFHE and MagicBlock as execution rails
- gaming rewards, payroll, grants, and agentic treasury automation
- how a normal user sees complex backend logic as simple browser actions

### Slide outline

1. Why public treasury tooling is not enough
2. ZK, REFHE, and MagicBlock in plain product language
3. Private payroll, grants, and gaming reward flows
4. Agentic Treasury Micropayment Rail
5. Judge-friendly proof without mathematical overload
6. Code references and live verification routes

### Live routes

- `https://privatedao.org/security/`
- `https://privatedao.org/services/`
- `https://privatedao.org/intelligence/`
- `https://privatedao.org/judge/`
- `https://privatedao.org/documents/agentic-treasury-micropayment-rail/`

### Code references

- `apps/web/src/app/security/page.tsx`
- `apps/web/src/app/intelligence/page.tsx`
- `scripts/lib/micropayment-engine.ts`
- `scripts/run-agentic-treasury-micropayment-rail.ts`
- `templates/frontend-solana-bootcamp/private-payment-starter/PrivatePaymentStarter.tsx`

### Assignment

Build one of:

- encrypted payment request UI
- gaming reward execution UI

Both must end with:

- a proof CTA
- a chain verification CTA
- a clear statement of what stayed private and what became public

### Quiz

- What is the product role of ZK here?
- Why is MagicBlock useful in the payout corridor?
- Why does agentic treasury execution fit governance instead of replacing it?

## Starter templates

The starter templates live here:

- `templates/frontend-solana-bootcamp/wallet-connect-starter`
- `templates/frontend-solana-bootcamp/proposal-ui-starter`
- `templates/frontend-solana-bootcamp/runtime-activity-starter`
- `templates/frontend-solana-bootcamp/private-payment-starter`

Each template is built to be:

- readable
- UI-first
- Devnet-oriented
- easy to wire into a live route

## Presentation notes

The deck should stay tool-neutral:

- every slide title and body must be copy-paste-ready into Google Slides or Canva
- every lecture must end with one live route and one code reference
- the deck must explain product choices in plain language before naming lower-level cryptography or infrastructure
- the live product must remain the proof layer behind the slides, not a separate theoretical appendix

## Google Slides / Canva-ready build pattern

Use the same rhythm for either Google Slides or Canva:

1. problem in plain language
2. why this matters on Solana
3. how PrivateDAO solves it
4. live route to open now
5. code reference + starter template
6. assignment + quiz checkpoint

For portability between tools:

- keep every slide in `title / 3 bullets / live route / code ref` format
- use simple block diagrams that can be rebuilt in Canva quickly
- limit screenshots to live product routes and Devnet explorer evidence
- keep one `Try it now` CTA and one `Check the code` CTA in every lecture section
- avoid sponsor- or competition-specific framing in the public educational deck

6. toolkit
7. assignments
8. quizzes
9. live product routes
10. code and repository references

## Reviewer note

This educational pack is intentionally built from a live product rather than toy snippets.

That is the point:

- a normal builder learns the ideas
- then applies them immediately on Devnet
- then verifies the result on-chain

without terminal dependence, raw scripts, or protocol-specialist habits.
