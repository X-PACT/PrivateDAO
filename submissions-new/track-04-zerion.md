# Track 04 — Zerion Agent Policy (Ready)

## Project title

PrivateDAO Zerion Lane: Policy-Bound Autonomous Execution for Treasury Operations

## Link to Submission

`https://privatedao.org/services/zerion-agent-policy/`

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

PrivateDAO integrates Zerion as a scoped execution assistant, not a god-mode bot. Agent actions are constrained by policy templates, wallet checks, and governance context. Portfolio review is live through a server route, and every check is attached to receipt continuity for judge and proof review.

## How we used the track

- Live portfolio API route:
  - `/apps/web/src/app/api/zerion/portfolio/route.ts`
- Productized policy route:
  - `/services/zerion-agent-policy`
- Added operation receipt persistence for portfolio verification actions.
- Wired judge and proof fast paths to the Zerion lane and policy packet.

## Evidence routes

- Zerion feature route: `https://privatedao.org/services/zerion-agent-policy/`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`
- Policy packet: `https://privatedao.org/documents/zerion-autonomous-agent-policy/`

