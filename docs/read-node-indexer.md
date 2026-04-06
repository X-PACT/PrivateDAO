# PrivateDAO Read Node And Indexer

PrivateDAO now includes a backend read path so proposal discovery, DAO inspection, runtime health, and wallet-readiness checks do not depend only on browser-side RPC calls.

## What it does

- exposes a pooled read path over multiple Devnet RPC endpoints
- caches proposal, DAO, and runtime reads for a short TTL
- keeps wallet-signed writes on the frontend
- returns reviewer-friendly JSON for:
  - runtime health
  - proposal lists
  - single proposal inspection
  - DAO inspection
  - governance-token readiness per wallet

## Why it matters

- reduces rate-limit pressure from browser polling
- keeps Solana reads closer to a mainnet production shape
- lets a custom domain or reverse proxy serve:
  - static frontend
  - `/api/v1/*` read endpoints
- preserves the current static frontend as a safe fallback

## Endpoints

- `GET /healthz`
- `GET /api/v1/config`
- `GET /api/v1/runtime`
- `GET /api/v1/metrics`
- `GET /api/v1/ops/overview`
- `GET /api/v1/ops/snapshot`
- `GET /api/v1/devnet/profiles`
- `GET /api/v1/proposals`
- `GET /api/v1/proposals/:proposal`
- `GET /api/v1/daos/:dao`
- `GET /api/v1/daos/:dao/wallets/:wallet/readiness`

## Run it locally

```bash
cd /home/x-pact/PrivateDAO
npm run start:read-node
```

Then open the frontend with:

```text
https://x-pact.github.io/PrivateDAO/?readApi=http://127.0.0.1:8787/api/v1
```

## Security shape

- read-only server
- no wallet secrets
- no signing
- no treasury authority
- no mutation endpoints
- in-memory rate limiting
- bounded CORS
- cache TTL configurable by environment
- request counters and route-hit metrics
- deployable behind a same-domain reverse proxy

## Snapshot Evidence

The repository can also generate a reviewer-facing backend snapshot:

```bash
cd /home/x-pact/PrivateDAO
npm run build:read-node-snapshot
npm run verify:read-node-snapshot
```

## Mainnet direction

For production, serve the frontend and read node behind the same domain and reverse proxy so the browser uses:

- wallet-signed writes locally
- pooled backend reads through the read node
- direct RPC only as fallback
