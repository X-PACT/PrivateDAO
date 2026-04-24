# Track 08 — Umbra Confidential Payout (Ready)

## Project title

PrivateDAO Umbra Lane: Claim-Link Confidential Payout with Proof-Linked Settlement

## Link to Submission

`https://privatedao.org/services/umbra-confidential-payout/`

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

PrivateDAO integrates Umbra as a dedicated confidential payout lane. Users can build claim-style payout links, execute private payout intents through the settlement proxy, and verify continuity from judge/proof surfaces.

## How we used the track

- Added dedicated Umbra route:
  - `/services/umbra-confidential-payout`
- Added claim-link workbench:
  - build recipient-private payout link
  - execute claim settlement intent via `/api/private-settlement/intent`
  - record receipt continuity
- Locked rail-specific private settlement workbench for Umbra execution.
- Wired judge and proof fast paths directly to Umbra lane and packet.

## Evidence routes

- Umbra feature route: `https://privatedao.org/services/umbra-confidential-payout/`
- Execute lane: `https://privatedao.org/execute/#vendor-payment`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`
- Umbra packet: `https://privatedao.org/documents/privacy-and-encryption-proof-guide/`

