# AUDD Grant Application Draft

## Project

PrivateDAO

## Short proposal outlining the AUDD use case

PrivateDAO is turning governed treasury motion into a live Solana product for organizations that need settlement to remain wallet-first, reviewable, and policy-bound. For the AUDD grant, the strongest fit is the **AUDD merchant settlement and treasury management corridor**.

This corridor gives DAOs, operators, and finance teams a practical way to:

- collect merchant or service payments in AUDD
- stage AUD-denominated treasury requests from the browser
- route those requests through governed review instead of ad hoc wallet actions
- execute wallet-signed SPL transfers with memo-coded business context
- keep signatures, logs, proof routes, and treasury packets attached to the same action

The user-facing product already exposes this as:

- `https://privatedao.org/services/testnet-billing-rehearsal/`
- `https://privatedao.org/services#treasury-payment-request`
- `https://privatedao.org/documents/audd-stablecoin-treasury-layer/`

The practical user benefit is direct: AUDD becomes the settlement asset inside a real governance and treasury workflow, not just a logo added to a landing page.

## How we plan to build it on Solana

PrivateDAO already ships the wallet-first treasury and stablecoin infrastructure. The AUDD work uses that existing product shell and points it at the AUDD rail:

1. Configure the official AUDD SPL mint, treasury receive address, decimals, and token program through environment-bound activation inputs.
2. Use the live Testnet billing rehearsal to run wallet-signed `TransferChecked` AUDD flows with memo-coded settlement labels.
3. Use the treasury request surface to stage merchant settlement, invoice collection, and treasury management motions with AUDD as the destination settlement asset.
4. Keep route rationale, settlement proof, and reviewer packets connected to the same request object so merchant and treasury actions remain auditable.
5. Extend the governed micropayment and treasury corridors so recurring or batched AUDD operations can move under policy rather than manual wallet coordination.

This approach is technically lightweight because the SPL transfer builder, ATA handling, memo path, treasury profiles, and proof surfaces already exist in the product.

## Relevant past work / portfolio

- Live product: `https://privatedao.org/`
- Wallet-first onboarding: `https://privatedao.org/start/`
- Governance corridor: `https://privatedao.org/govern/`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/?judge=1`
- Repository: `https://github.com/X-PACT/PrivateDAO`
- Stablecoin operating brief: `https://privatedao.org/documents/pusd-stablecoin-treasury-layer/`
- AUDD operating brief: `https://privatedao.org/documents/audd-stablecoin-treasury-layer/`

## Why we are the right builder

We are not starting from a blank hackathon prototype. PrivateDAO already ships:

- live Solana governance and treasury product surfaces
- wallet-first execution from the browser
- treasury receive rails and stablecoin-aware request planning
- memo-coded payment rehearsal with explorer-visible signatures
- reviewer packets, proof surfaces, and route-level operating documentation

That matters for AUDD because the grant explicitly prefers practical, production-ready applications. We already have the product shell, treasury UX, and on-chain payment construction. The AUDD grant would accelerate activation, route hardening, and user-facing finance flows around an asset that fits real settlement needs.

## Quote in AUDD

Recommended quote: **AUDD 8,000**

Rationale:

- enough scope to justify real product activation, QA, and reviewer-ready delivery
- still disciplined versus the upper grant ceiling
- supports merchant settlement, treasury management, and programmable-finance closure instead of a single demo flow

## Proposed delivery scope

- AUDD asset activation in the treasury receive rail
- AUDD merchant settlement and treasury management profiles
- browser-signed Testnet billing rehearsal for AUDD
- reviewer-safe AUDD operating brief and proof path
- QA pass across wallet-first settlement flows
- final submission-ready packet with links, routes, and operating notes
