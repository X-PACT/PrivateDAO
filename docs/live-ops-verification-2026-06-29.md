# Live Ops Verification - 2026-06-29

This note records the current live state after the PDAO, TxLINE, announcement, and product-surface updates.

## Live Product Links

- Product map: `https://privatedao.org/products/`
- Proof Workflows: `https://privatedao.org/proof-workflows/`
- Private Governance: `https://privatedao.org/govern/`
- Treasury Coordination: `https://privatedao.org/treasury/`
- Sealed Auctions: `https://privatedao.org/auctions/`
- Payment Gate: `https://privatedao.org/payment-gate/`
- TxLINE Match Settlement: `https://privatedao.org/txline-settlement/`
- PDAO token page: `https://privatedao.org/token/`
- Announcements: `https://privatedao.org/announcements/`

## API Health Checks

Observed HTTP `200`:

- `https://api.privatedao.org/healthz`
- `https://api.privatedao.org/api/v1/payment-gate/random/status`
- `https://api.privatedao.org/api/v1/commercial/checkout/status`
- `https://api.privatedao.org/api/v1/txline/status`
- `https://api.privatedao.org/api/v1/txline/matches`

## Supabase

AWS host-local environment contains the public Supabase URL, publishable key, and project ref.

A REST write check from the AWS host inserted a zero-value verification row into `governance_receipts` and returned HTTP `201`.

No service-role key was printed or required for this check.

## TxLINE Match Settlement

Source requirement file reviewed:

- `/home/x-pact/Desktop/txdoc`

Official TxLINE mainnet constants used by the activation helper:

- Program ID: `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA`
- TxL Token-2022 mint: `Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL`
- Free World Cup service level: `1`
- Duration: `4` weeks

Activation helper:

```bash
npm run txline:activate-free-tier:dry-run
```

Dry-run derived:

- Pricing matrix PDA: `HPjtXsXRYAdBppSMzsqGGDTuhUQT7aXtsbn52CjhqRM7`
- Token treasury PDA: `Gjt57tE6wcUC1qd3FQRG4X9wULcc6y2vA22m4CvPEvpZ`
- User TxL ATA: `C4QbPKS3wqTazQoBS9cJ8GEzVET7skmQUtq7MjEuf5G4`
- Token treasury vault: `DnbxehrjqjVr3YwekMiCG8Uf4KVsrgwqRmHbdxLJ3Haa`

Activation result:

- The project wallet `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD` was funded and used for the official TxLINE free-tier subscription path.
- Successful subscription transaction: `3xrzVX1L4XX9T23JJe7xi2ic691GPE7rQAYPXtoEcbfAkBonox45P4PeYWh2symZL11AemZYt1w2QKiwiv8gpWmD`
- `TXLINE_SESSION_JWT` and `TXLINE_API_TOKEN` were configured on AWS without printing secrets.
- The read-node container was rebuilt and recreated so it loaded the new TxLINE environment.
- `https://api.privatedao.org/api/v1/txline/status` now reports `live-txline-provider`.
- `https://api.privatedao.org/api/v1/txline/matches` now fetches from `https://txline.txodds.com/api/fixtures/snapshot` and returned 18 live-provider fixtures.

Settlement boundary:

- A live fixture resolve test returned HTTP `422` with `Settlement proof was not issued because the match is not final.`
- This is the intended safety behavior: PrivateDAO should not issue a settlement proof from a non-final match.

Do not claim final settlement from a live fixture until a fixture has ended and `/api/v1/txline/resolve` returns a proof package from `live-txline-provider`.

## PDAO Token Discovery

Mainnet mint:

- `9isGuumtaqvJeJeyLF44fvfskk2cv5mYsopexMBfpump`

Observed:

- `https://privatedao.org/token.json` returns HTTP `200`.
- Jupiter Tokens API returns PDAO metadata, price, holder count, liquidity, and market data.
- Solana Tracker token page returns HTTP `200`.
- SolanaFM token address page returns HTTP `200`.
- GeckoTerminal pool page returns HTTP `200`.
- DexScreener public API returns pair data for `EZiPEFFGhvU7BmZTcsJxKFVw7Edby7KxN91fGfzpxHpz`.

Jupiter verification:

- Standard/Basic VRFD request id: `13951`
- Status: `pending`
- `verifiedAt`: `null`

Do not represent PDAO as Jupiter-verified until Jupiter changes the request status.

## QuickNode

AWS env check:

- `QUICKNODE_X402_KEYPAIR_PATH`: not configured
- `QUICKNODE_MAINNET_RPC`: not configured

QuickNode Streams remain active:

- `https://api.privatedao.org/api/v1/quicknode/stream/stats` returned HTTP `200`.
- Stats reported `auth: configured`.
- Accepted payloads observed: `15506`.

QuickNode x402 status:

- The package `@quicknode/x402-solana` is installed and exposes `createSolanaX402Clients`.
- A pay-per-request x402 test with the project wallet failed with `Unexpected error verifying payment`.
- The project wallet currently has `0` USDC on Solana Mainnet.
- Do not claim QuickNode x402 RPC requests are live until the wallet has USDC or QuickNode confirms the free x402 allowance works for this wallet without a USDC balance.

## Announcement Automation

The product announcement orchestrator is available:

```bash
npm run announce:txline:dry-run
```

It updates:

- `https://privatedao.org/announcements/`
- `https://privatedao.org/announcements/feed.json`
- `https://privatedao.org/announcements/rss.xml`

It can publish to X, Telegram, Discord, PrivateDAO API, and extra webhooks when the relevant runtime secrets are present.
