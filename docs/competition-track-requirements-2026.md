# Competition Track Requirements 2026

This document is the canonical requirements matrix for the active 2026 competition and grant corridors currently relevant to PrivateDAO.

It is intentionally strict:

- It separates verified live facts from inference.
- It treats sponsor listing pages as the primary public source unless a stronger official source exists.
- It does not overclaim partner integrations, external audits, encrypted AI, or mainnet readiness.

## Current product truth

PrivateDAO already provides, truthfully:

- Private DAO governance on Solana Devnet
- wallet-first governance flow in the public web app
- reviewer-safe proof, runtime evidence, and trust packets
- gaming-oriented governance and settlement corridor framing
- confidential payout and treasury motion rehearsal backed by `FHE / REFHE`, `ZK`, `MagicBlock`, and `Fast RPC`

PrivateDAO does **not** yet have honest mainnet-ready status. The live blocker set remains:

1. external audit completion
2. authority multisig / custody hardening closure
3. production monitoring and alerting closure
4. full real-device wallet runtime matrix
5. source-verifiable settlement receipts for the MagicBlock / REFHE corridor
6. final mainnet cutover ceremony

Primary blocker sources:

- `docs/mainnet-blockers.json`
- `docs/mainnet-go-live-checklist.md`

## Evaluation method

For each track below:

- **Verified requirements** come from the live listing page or the official grant page.
- **Winning interpretation** is an inference derived from the sponsor type, listed skills, category, and current Solana Frontier judging environment.
- **PrivateDAO fit** is mapped only to currently shipped surfaces or explicit gaps already present in the repo.

## Verified source matrix

| Track | Verified source | Public facts from source | Winning interpretation | PrivateDAO fit now | Highest-value gap |
| --- | --- | --- | --- | --- | --- |
| Colosseum Frontier | https://blog.colosseum.com/announcing-the-solana-frontier-hackathon/ | Frontier is product-impact oriented and startup-facing. | Judges reward coherent products, not bounty stacking. | Very strong | tighten first-run UX and capital-readiness packet |
| Privacy Track | https://superteam.fun/earn/listing/privacy-track-colosseum-hackathon-powered-by-magicblock-st-my-and-sns | Privacy sponsor track inside Frontier. | Must show privacy as usable product behavior, not cryptography branding. | Strong | sharpen end-user privacy framing |
| Build a Live dApp with Solflare, Kamino, DFlow, or QuickNode with Eitherway App | https://superteam.fun/earn/listing/build-a-live-dapp-with-solflare-kamino-dflow-or-quicknode-with-eitherway-app | Live dApp wallet/product track. | The path from connect wallet to real action must feel polished and partner-ready. | Strong | complete end-to-end browser-wallet proof corridor |
| RPC Infrastructure Credits | https://superteam.fun/earn/listing/dollar10000-in-rpc-infrastructure-credits-for-colosseum-frontier-hackathon | Infrastructure-credit track. | Need hosted-read value, telemetry, diagnostics, and buyer-grade API story. | Very strong | stronger analyst/export surface |
| TokenTon26 Consumer Apps | https://superteam.fun/earn/listing/tokenton26-consumer-apps-track-dollar8500-prize-pool | $8.5k, skills: frontend/backend/blockchain/design. | First-run clarity and low-friction wallet UX matter most. | Strong | remove remaining route friction and dense reviewer chrome |
| Ranger Main | https://superteam.fun/earn/listing/ranger-build-a-bear-hackathon-main-track | Main-track startup/product corridor. | Integrated product quality matters more than isolated technical modules. | Strong | unify all public proof and commercial rails into a tighter submission packet |
| Ranger Drift Side Track | https://superteam.fun/earn/listing/ranger-build-a-bear-hackathon-drift-side-track | Drift-adjacent side track. | Best fit is bounded treasury strategy and risk posture, not fake trading claims. | Moderate | treasury strategy narrative and capital-allocation packet |
| 100xDevs Frontier Track | https://superteam.fun/earn/listing/100xdevs-frontier-hackathon-track | Frontend/backend/blockchain execution track. | Code quality, route architecture, and product polish are judged visibly. | Strong | keep route quality and deploy polish obvious |
| Encrypt / IKA | https://superteam.fun/earn/listing/encrypt-ika-frontier-april-2026 | $15k, blockchain-focused encrypted capital markets framing. | Must connect encrypted infrastructure to a real workflow. | Strong | cleaner encrypted-ops story packet |
| SolRouter Encrypted AI | https://superteam.fun/earn/listing/solrouter-ship-with-encrypted-ai | $500, AI-adjacent “encrypted AI” framing. | Without a real assistant surface, deterministic reasoning must be framed carefully. | Partial | assistant-like surface if pursued at all |
| Dune Analytics Frontier Data Sidetrack | https://superteam.fun/earn/listing/dune-analytics-x-superteam-earn-or-frontier-data-sidetrack | $6k, backend skill, one winning slot. | Need an analyst-readable telemetry and export story. | Strong | analytics/export packaging |
| Umbra Side Track | https://superteam.fun/earn/listing/umbra-side-track | $10k, skills: blockchain/backend/frontend. | Private payout must appear as a concrete governed workflow. | Strong | payout-centric evidence and sender-discipline packet |
| Adevar Labs Audit Credits | https://superteam.fun/earn/listing/50k-adevarlabs-bounty | $50k audit credits, blockchain-focused. | Hardening honesty and audit preparation matter more than hype. | Strong | explicit pre-audit readiness bundle |
| Superteam Poland | https://superteam.fun/earn/listing/superteam-poland | $10k, regional listing for Poland, skills include mobile and growth. | Regional execution breadth matters: product, mobile, growth, delivery. | Strong | regional packet tying prior Poland win to current product maturity |
| Poland Grants | https://superteam.fun/earn/grants/Poland-grants | Solana Foundation–backed regional instagrant corridor with explicit DAO tooling, payments, developer tooling, education, decentralization, and censorship-resistance focus. | Needs fast proof of work, concise application quality, and milestones that can ship in weeks rather than vague roadmap promises. | Very strong | application-ready Poland grant packet tied to live product, proof of work, and explicit blocker truth |
| Startup Accelerator Grant | https://superteam.fun/earn/grants/startup-accelerator-grant | Startup grant corridor. | Must read like an investable company-in-formation. | Very strong | capital-readiness packet aligned with blocker truth |

## Startup accelerator support signal

Additional source:

- `https://superteam.fun/fast-track`

Verified facts from that page:

- Superteam members can receive personalized support and perks for acceleration programs
- support includes application strategy and review help
- access does not guarantee acceptance

Interpretation for PrivateDAO:

- the accelerator corridor should be treated as a disciplined startup submission surface, not as generic “grant farming”
- the strongest packet is product-first, then services, then trust, then mainnet gates

## Poland Grants support signal

Verified facts from the grant brief supplied in-session:

- grants target work that promotes decentralization and censorship resistance on Solana
- grants explicitly support DAO tooling, developer tooling, education, and payments
- proof of work matters more than credentials
- reviewers prefer projects that ship quickly and are clearly executable by the team
- grants can fund between `$1` and `$10,000`
- recommended review cadence is roughly one week, with milestone-based follow-on payouts
- open source expectation is explicit

Interpretation for PrivateDAO:

- this is one of the strongest true-fit grant corridors because PrivateDAO already spans DAO tooling, payments, developer tooling, and ecosystem education
- the submission should be concise and product-first, not research-heavy
- the strongest application posture is a live Devnet product plus explicit blocker truth, not a speculative mainnet promise

## Highest-value track-to-service mapping

### PrivateDAO Core

Best for:

- Colosseum Frontier
- Privacy Track
- Eitherway Live dApp
- Consumer Apps
- Ranger Main

Why:

- already live
- already wallet-first
- already judge-readable

### Read API + RPC

Best for:

- RPC Infrastructure Credits
- Dune Analytics
- Startup Accelerator

Why:

- this is the clearest commercial infrastructure lane already in the product

### Confidential payout corridor

Best for:

- Umbra
- Encrypt / IKA
- Privacy Track

Why:

- connects private governance to real treasury workflows

### Treasury strategy corridor

Best for:

- Ranger Drift
- Startup Accelerator
- Poland Grants

Why:

- stronger as bounded governance infrastructure than as speculative DeFi

### Trust and hardening corridor

Best for:

- Adevar audit credits
- Startup Accelerator
- Poland Grants

Why:

- judges and grant reviewers both need honest operational maturity, not only features

## What we should **not** overclaim

- external audit completion
- mainnet production readiness
- fully shipped encrypted AI assistant
- partner-native dashboards or Dune-native publication unless actually published
- same-domain hosted backend cutover on `privatedao.org` before the real DNS/host cutover happens

## Highest-value implementation priorities

1. complete track workspaces for Dune, Umbra, Adevar, Poland, Poland Grants, and Startup Accelerator
2. tighten `/govern` and browser-wallet submission corridor until `Create Proposal → Commit → Reveal → Finalize` has a reviewer-safe capture path
3. package telemetry and exports more clearly for Dune/RPC judges
4. package confidential payout proof more clearly for Umbra/Encrypt
5. package hardening and blocker truth more clearly for Adevar/Startup reviewers

## Immediate competition thesis

If PrivateDAO wants first-place probability rather than broad participation optics, the strongest priority stack is:

1. Colosseum Frontier
2. Privacy Track
3. RPC Infrastructure Credits
4. Startup Accelerator Grant
5. Umbra
6. Dune Analytics
7. Ranger Main
8. Superteam Poland / Poland Grants

That ordering is not prize-size driven. It is fit-driven, evidence-driven, and commercial-future driven.
