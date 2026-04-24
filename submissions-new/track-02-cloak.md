# Track 02 — Cloak Privacy Settlement (Ready)

## Project title

PrivateDAO Cloak Lane: Confidential Treasury Settlement with Proof Continuity

## Link to Submission

`https://privatedao.org/services/cloak-private-settlement/`

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

PrivateDAO ships Cloak-aligned confidential settlement as a real product route. Operators prepare private payroll or treasury intents, forward them through a dedicated settlement proxy, and keep execution references attached to the judge/proof surfaces.

## How we used the track

- Added a real private settlement server proxy endpoint:
  - `/apps/web/src/app/api/private-settlement/intent/route.ts`
- Upgraded the in-product settlement workbench to forward by default via the proxy.
- Added a dedicated Cloak service route:
  - `/services/cloak-private-settlement`
- Added Cloak lane exposure in both reviewer surfaces:
  - `/judge`
  - `/proof`
- Preserved receipt continuity through operation receipt persistence and proof navigation.

## Evidence routes

- Cloak feature route: `https://privatedao.org/services/cloak-private-settlement/`
- Execute route anchor: `https://privatedao.org/execute/#vendor-payment`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`
- API source:
  - `/apps/web/src/app/api/private-settlement/intent/route.ts`

