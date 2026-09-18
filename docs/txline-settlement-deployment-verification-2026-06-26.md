# TxLINE Settlement Deployment Verification - 2026-06-26

This note records the current TxLINE Match Settlement release state for PrivateDAO.

## Official Sources Used

- TxLINE local documentation: `/home/x-pact/Desktop/txdoc`
- Supported soccer league catalog: `/home/x-pact/Downloads/SoccerSupportedLeagues.csv`
- Public TxLINE documentation reviewed: `https://txline.txodds.com/documentation`
- Public TxLINE API reference reviewed: `https://txline.txodds.com/api-reference/scores/`
- Superteam bounty page reviewed: `https://superteam.fun/earn/listing/prediction-markets-and-settlement/`

No fixture IDs or stat keys were guessed. The product uses fixture IDs and competition context from the official local TxLINE sources.

## Product Scope

TxLINE Match Settlement is now positioned as a World Cup prediction-market settlement desk:

- official fixture data enters the settlement workflow
- hidden payout policy remains private
- the visible result becomes a reviewer-readable proof
- the receipt path is prepared for Solana verification
- the page explains the product in investor-simple language within the first screen and the live workflow route

Primary routes:

- `/txline-settlement/`
- `/developers/txline-settlement-api/`
- `/products/`

## Wallet And Mainnet Readiness

The project wallet public key is:

```text
4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD
```

The matching local Solana keypair was located under the normal local Solana keypair path and verified by deriving the public key. Secret-key material is intentionally not printed in this document.

Mainnet balance observed during verification:

```text
0.021802318 SOL
```

No mainnet transaction was sent during this verification pass.

## Historical Visual Artifact

The video and poster previously referenced by this deployment note are retired and are not part of the current public product surface. The current review path is the live TxLINE workflow route and its evidence boundary. This document does not claim a current public video asset.

## Backend And Hosting State

Local primary-host candidate:

- Docker stack: `privatedao-primary-host-*`
- read-node container: healthy
- edge container: running
- chain watcher: running
- Supabase visitor/receipt settings: configured
- QuickNode stream auth/network settings: configured
- RPC pool: configured with multiple Solana Testnet endpoints in the local primary-host environment

Public API state observed after the local candidate update:

- `https://api.privatedao.org/api/v1/readiness` responds successfully
- public readiness was still serving the older single-endpoint runtime view at the time this note was written
- local edge readiness reflects the updated multi-endpoint candidate

TxLINE live API token state:

- `https://api.privatedao.org/api/v1/txline/status` currently reports simulated TxLINE provider mode
- TxLINE guest/session and subscription-token activation remain the required next step before claiming live TxLINE data settlement

## Tests And Checks Run

Passed:

- `npm --prefix apps/web run lint -- src/app/txline-settlement/page.tsx src/components/txline-settlement-workbench.tsx`
- `npm --prefix apps/web run lint -- src/app/products/page.tsx src/app/txline-settlement/page.tsx src/components/txline-settlement-workbench.tsx`
- `npm run test:unit:ts -- --grep txline`
- `npm run typecheck`
- static web mirror build for the root site
- MP4 probe for resolution and duration
- local generated page checks for:
  - `World Cup markets settle themselves`
  - `Brazil vs Morocco`
  - fixture `17588386`
  - `Mainnet receipt path`
  - World Cup logo asset path
- local generated `/products/` checks for the six product lines
- local Docker edge readiness check with host header

Browser checks:

- desktop screenshot of `/txline-settlement/`
- mobile screenshot of `/txline-settlement/`

## Bugs Found And Fixed

- `/products/` was a service-map bridge in the GitHub repo source; it is now a six-product page.
- TxLINE UI previously displayed too much session detail; the guest JWT is no longer displayed in the visible UI.
- the TxLINE settlement story now uses official fixture metadata instead of generic simulated match labels.
- the former generated video reference was retired from the current commercial surface.
- the primary-host Caddyfile now has an explicit `www.privatedao.org` permanent redirect block.
- the live-service verifier no longer requires the currently selected RPC endpoint to equal one hardcoded QuickNode URL; it checks the multi-endpoint pool and provider readiness instead.

## Release Boundary

This historical note is retained for provenance only. The current commercial surface is the live TxLINE settlement workflow and its evidence boundaries.

Do not claim final live TxLINE mainnet settlement until:

1. the TxLINE subscription/token activation succeeds using the official TxLINE auth flow
2. `TXLINE_API_TOKEN` is configured in the live backend
3. `/api/v1/txline/status` reports configured live TxLINE mode
4. a settlement receipt is generated from official live fixture data and independently verified
