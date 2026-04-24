# Track 05 — Torque Growth Loop (Ready)

## Project title

PrivateDAO Torque Lane: Product-Native Growth Events with Live Relay Delivery

## Link to Submission

`https://privatedao.org/services/torque-growth-loop/`

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

PrivateDAO integrates Torque as a real growth and retention layer tied to actual product actions. Custom events are not isolated to a demo panel: private settlement flow now emits `private_treasury_execution` through the same relay path used by the dedicated growth route.

## How we used the track

- Live relay API:
  - `/apps/web/src/app/api/torque/custom-event/route.ts`
- Product route:
  - `/services/torque-growth-loop`
- Added default in-product fallback to local relay route (`/api/torque/custom-event`).
- Linked private settlement execution to automatic Torque event emission.
- Event schema includes amount, type, and success for treasury execution review.

## Evidence routes

- Torque feature route: `https://privatedao.org/services/torque-growth-loop/`
- Execute route: `https://privatedao.org/execute/`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/`
- Event evidence: `/docs/torque-events-2026-04-24.md`

