# Track 03 — Jupiter Treasury Route (Ready)

## Project title

PrivateDAO Jupiter Lane: Governed Treasury Route Preview and Execution Context

## Link to Submission

`https://privatedao.org/services/jupiter-treasury-route/`

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

PrivateDAO integrates Jupiter as an execution-quality treasury lane, not a generic swap widget. Operators preview route quality, quote posture, and slippage before signing governed treasury actions, then verify continuity through judge/proof paths.

## How we used the track

- Added dedicated product route:
  - `/services/jupiter-treasury-route`
- Kept a live server-backed route preview:
  - `/api/jupiter/order`
- Updated route surface to use local API fallback by default.
- Added direct reviewer linkage from judge and proof lanes.
- Kept treasury context tied to execute route instead of detached trading UX.

## Evidence routes

- Jupiter feature route: `https://privatedao.org/services/jupiter-treasury-route/`
- Execute route anchor: `https://privatedao.org/execute/#treasury-rebalance`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`
- API source:
  - `/apps/web/src/app/api/jupiter/order/route.ts`

