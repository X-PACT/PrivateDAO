# Track 12 — SolRouter Encrypted AI (Ready)

## Project title

PrivateDAO SolRouter Lane: Deterministic AI Governance Briefs with Encrypted Export

## Link to Submission

`https://privatedao.org/services/solrouter-encrypted-ai/`

## Judge link

`https://privatedao.org/judge/`

## Proof link

`https://privatedao.org/proof/`

## GitHub

`https://github.com/X-PACT/PrivateDAO`

## Website

`https://privatedao.org`

## Demo / presentation link

`https://youtu.be/HiCz0vb8kgk`

## Short pitch

PrivateDAO integrates SolRouter as an encrypted decision-support lane: it generates deterministic governance intelligence from live proposals, encrypts the brief client-side, and persists operational receipts for reviewer continuity.

## How we used the track

- Added dedicated SolRouter route:
  - `/services/solrouter-encrypted-ai`
- Built `SolrouterEncryptedAiSurface`:
  - select live proposal
  - generate deterministic governance + treasury decision brief
  - encrypt brief locally with AES-GCM
  - download encrypted bundle
  - persist operation receipt (`solrouter_encrypted_ai_brief`)
- Wired judge/proof fast paths to SolRouter lane.
- Added SolRouter lane to technology map and service operational cards.

## Evidence routes

- SolRouter feature route: `https://privatedao.org/services/solrouter-encrypted-ai/`
- Intelligence route: `https://privatedao.org/intelligence/`
- Assistant route: `https://privatedao.org/assistant/`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`

