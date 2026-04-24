# Track 01 — GoldRush Intelligence (Ready)

## Project title

PrivateDAO Intelligence Lane: Structured Onchain Review Before Treasury Execution

## Link to Submission

`https://privatedao.org/intelligence/`

## Judge link

`https://privatedao.org/judge/`

## Proof link

`https://privatedao.org/proof/?judge=1`

## GitHub

`https://github.com/X-PACT/PrivateDAO`

## Website

`https://privatedao.org`

## Demo / presentation link

`https://youtu.be/HiCz0vb8kgk`

## Short pitch

PrivateDAO uses GoldRush as a real decision layer before signing treasury actions. Operators do not parse raw RPC. They get structured wallet context, stablecoin signals, counterparty hints, and transaction previews directly in the product flow.

## How we used the track

- Added live GoldRush server proxy and response normalization.
- Added Dune Sim transaction preview as a support source in the same lane.
- Upgraded UI from raw payload output to reviewer-readable intelligence cards.
- Connected the lane to Judge and Proof so reviewers validate quickly.

## Evidence routes

- Intelligence route: `https://privatedao.org/intelligence/`
- Judge route: `https://privatedao.org/judge/`
- Proof route: `https://privatedao.org/proof/?judge=1`
- API source:
  - `/apps/web/src/app/api/goldrush/query/route.ts`

