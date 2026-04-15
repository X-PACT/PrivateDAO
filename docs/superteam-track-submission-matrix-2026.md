# Superteam Track Submission Matrix 2026

## Purpose

This is the canonical operating matrix for the active Superteam, Frontier, and grant corridors currently relevant to PrivateDAO.

It is stricter than a packet index:

- it says what each track should actually be submitted with
- it says when a track should be submitted manually versus through an agent flow
- it says which current packets are strong enough now
- it says which claims must be removed or softened before submission

Use this alongside:

- [competition-track-requirements-2026.md](/home/x-pact/PrivateDAO/docs/competition-track-requirements-2026.md)
- [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md)
- [colosseum-submission-answers.md](/home/x-pact/PrivateDAO/docs/colosseum-submission-answers.md)

## Global truth rules

Every submission should preserve these boundaries:

1. claim live Devnet truth confidently
2. do not claim completed external audit
3. do not claim completed multisig / custody ceremony
4. do not claim production monitoring closure
5. do not claim source-verifiable settlement receipts unless the receipts are actually recorded
6. do not claim final mainnet real-funds readiness

## Superteam agent posture

Before using the agent API for any listing:

- verify that the listing is `AGENT_ALLOWED` or `AGENT_ONLY`
- use manual submission posture for any listing that is human-only
- collect the human Telegram URL first for any `project` listing
- do not register or submit through the API until account data is available

## Track-by-track operating matrix

| Track | Submit now? | Best primary link | Best packet or form source | Preferred posture | Exact submission angle | Immediate edit before submit |
| --- | --- | --- | --- | --- | --- | --- |
| Colosseum Frontier | Yes | `https://privatedao.org/start/` | [colosseum-submission-answers.md](/home/x-pact/PrivateDAO/docs/colosseum-submission-answers.md) | Manual | Private governance product with live Devnet proof, trust, and execution discipline | Keep mainnet phrasing conditional, not date-certain |
| Privacy Track | Yes | `https://privatedao.org/security/` | [confidential-payout-evidence-packet.md](/home/x-pact/PrivateDAO/docs/confidential-payout-evidence-packet.md) | Manual unless agent-eligible | Private governance plus confidential payout corridor | Lead with user-visible privacy behavior, not raw cryptography branding |
| Eitherway Live dApp | Yes | `https://privatedao.org/govern/` | [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md) | Manual unless agent-eligible | Wallet-first live dApp with real DAO, proposal, commit, reveal/finalize path | Use Brave + Solflare runtime evidence only if the cycle is fully closed |
| RPC Infrastructure Credits | Yes | `https://privatedao.org/analytics/` | [telemetry-export-packet.md](/home/x-pact/PrivateDAO/docs/telemetry-export-packet.md) | Manual unless agent-eligible | Hosted reads, telemetry, diagnostics, and buyer-grade infrastructure lane | Keep same-domain backend cutover clearly future-facing unless actually cut over |
| Dune Analytics | Yes | `https://privatedao.org/analytics/` | [reviewer-telemetry-packet.generated.md](/home/x-pact/PrivateDAO/docs/reviewer-telemetry-packet.generated.md) | Manual unless agent-eligible | Analyst-readable governance and telemetry export corridor | Do not imply published Dune dashboards unless they exist |
| Umbra Side Track | Yes | `https://privatedao.org/services/` | [confidential-payout-evidence-packet.md](/home/x-pact/PrivateDAO/docs/confidential-payout-evidence-packet.md) | Manual unless agent-eligible | Governed confidential payout and sender-discipline corridor | Tie payout evidence to governed treasury motion, not generic privacy copy |
| Encrypt / IKA | Yes | `https://privatedao.org/security/` | [confidential-payout-evidence-packet.md](/home/x-pact/PrivateDAO/docs/confidential-payout-evidence-packet.md) | Manual unless agent-eligible | Encrypted operations flow backed by current evidence | Remove any wording that sounds like finished encrypted capital-markets infrastructure |
| Ranger Main | Yes | `https://privatedao.org/tracks/ranger-main` | [ranger-submission-bundle.generated.md](/home/x-pact/PrivateDAO/docs/ranger-submission-bundle.generated.md) | Manual unless agent-eligible | Startup-quality governed product, not isolated tech modules | Keep treasury and commercialization tied to one coherent product story |
| Ranger Drift Side Track | Conditional | `https://privatedao.org/services/` | [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md) | Manual | Treasury-risk and allocation discipline, not speculative trading | Submit only if the bounded treasury strategy story is strong enough for the exact listing |
| 100xDevs Frontier | Yes | `https://privatedao.org/start/` | [competition-track-requirements-2026.md](/home/x-pact/PrivateDAO/docs/competition-track-requirements-2026.md) | Manual unless agent-eligible | Route quality, frontend/backend discipline, product polish | Keep public UX and deploy reliability clean before submission |
| TokenTon26 Consumer Apps | Yes | `https://privatedao.org/start/` | [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md) | Manual unless agent-eligible | Normal-user wallet onboarding and simple governance path | Strip reviewer-heavy language from the first-run path |
| Adevar Audit Credits | Yes | `https://privatedao.org/trust/` | [audit-packet.generated.md](/home/x-pact/PrivateDAO/docs/audit-packet.generated.md) | Manual unless agent-eligible | Hardening honesty and audit readiness | Never imply the audit is already complete |
| Superteam Poland | Conditional | `https://privatedao.org/tracks/superteam-poland` | [poland-foundation-grant-application-packet.md](/home/x-pact/PrivateDAO/docs/poland-foundation-grant-application-packet.md) | Manual | Regional proof-of-work and product maturity | Only submit if regional eligibility is satisfied and the packet is localized enough |
| Poland Grants | Yes | `https://privatedao.org/tracks/poland-grants` | [poland-foundation-grant-application-packet.md](/home/x-pact/PrivateDAO/docs/poland-foundation-grant-application-packet.md) | Manual unless agent-eligible grant flow exists | DAO tooling + payments + decentralization + developer tooling with fast proof of work | Replace any hard mainnet date promises with blocker-aware milestones |
| Startup Accelerator Grant | Yes | `https://privatedao.org/tracks/startup-accelerator` | [startup-accelerator-application-packet.md](/home/x-pact/PrivateDAO/docs/startup-accelerator-application-packet.md) | Manual unless agent-eligible grant flow exists | Execution funding for a live Devnet product with a shrinking blocker set | Keep it company-grade and capital-use specific, not feature-dump heavy |
| SolRouter Encrypted AI | Not yet | `https://privatedao.org/security/` | [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md) | Hold | Only pursue if a real assistant surface is shipped | Do not submit with current state unless the assistant lane becomes real |

## Highest-priority packet mapping

### Use these as the default anchors

- Frontier / 100x / consumer / live dApp:
  - [submission-dossier.md](/home/x-pact/PrivateDAO/docs/submission-dossier.md)
  - [colosseum-submission-answers.md](/home/x-pact/PrivateDAO/docs/colosseum-submission-answers.md)
- Privacy / Umbra / Encrypt:
  - [confidential-payout-evidence-packet.md](/home/x-pact/PrivateDAO/docs/confidential-payout-evidence-packet.md)
  - [settlement-receipt-closure-packet.md](/home/x-pact/PrivateDAO/docs/settlement-receipt-closure-packet.md)
- RPC / Dune:
  - [telemetry-export-packet.md](/home/x-pact/PrivateDAO/docs/telemetry-export-packet.md)
  - [reviewer-telemetry-packet.generated.md](/home/x-pact/PrivateDAO/docs/reviewer-telemetry-packet.generated.md)
- Grants / accelerator:
  - [poland-foundation-grant-application-packet.md](/home/x-pact/PrivateDAO/docs/poland-foundation-grant-application-packet.md)
  - [startup-accelerator-application-packet.md](/home/x-pact/PrivateDAO/docs/startup-accelerator-application-packet.md)
  - [funding-readiness-scorecard.md](/home/x-pact/PrivateDAO/docs/funding-readiness-scorecard.md)

## Current submission adjustments that should be made

### Poland Grants

The current form posture should avoid:

- fixed-date mainnet certainty
- any implication that the external audit is already closed
- any implication that real-funds production monitoring is already complete

It should emphasize:

- live Devnet product
- open-source proof of work
- DAO tooling
- payments relevance
- fast execution
- clear weekly milestones

### Startup Accelerator

The accelerator corridor should read like:

- a live product company
- with a capital use plan
- and an explicit blocker set

It should not read like:

- a broad research proposal
- a protocol wishlist
- or a grant application disguised as an accelerator memo

### Umbra / Encrypt / Privacy

These should stop at the current evidence boundary:

- confidential payout rehearsal
- governed settlement corridor
- reviewer-safe trust and telemetry

They should not claim:

- completed verifier-grade receipts
- final encrypted production payment stack

## What still needs human account data

No account data is needed to keep refining packets and routes.

Account data is needed only when we are about to:

1. register a Superteam Earn agent
2. fetch protected agent listing feeds
3. create or update an agent submission
4. post agent comments
5. claim payout through a human account
