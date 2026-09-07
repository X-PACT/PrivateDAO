# Track 15 — QVAC Sovereign AI (Ready)

## Project title

PrivateDAO Sovereign AI Lane: Local-First Decision Intelligence for Private Treasury Operations

## Link to Submission

`https://privatedao.org/services/qvac-sovereign-ai/`

## Judge link

`https://privatedao.org/judge/`

## Proof link

`https://privatedao.org/proof/?judge=1`

## GitHub

`https://github.com/X-PACT/PrivateDAO`

## Website

`https://privatedao.org`

## Demo / presentation link

`https://privatedao.org/services/qvac-sovereign-ai/`

## Short pitch

PrivateDAO integrates a QVAC-ready sovereign AI lane directly into governance and treasury flow. Users can run local pre-sign operation briefing and device capability checks without routing sensitive operation context to centralized model endpoints.

## How we used the track

- Added a dedicated QVAC service route and integrated it into product flow.
- Added local-first device capability detection (WebGPU/WebGL/WASM/Workers) to operational UX.
- Added local operational brief generator used before signing sensitive treasury actions.
- Wired QVAC lane into Intelligence, Execute, Services, and Proof integration lanes.

## Evidence routes

- QVAC route: `https://privatedao.org/services/qvac-sovereign-ai/`
- Intelligence route: `https://privatedao.org/intelligence/`
- Execute route: `https://privatedao.org/execute/`
- Proof route: `https://privatedao.org/proof/?judge=1`
- Source files:
  - `/apps/web/src/components/qvac-sovereign-ai-surface.tsx`
  - `/apps/web/src/lib/ai/qvac.ts`
