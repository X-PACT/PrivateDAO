# Read Node Same-Domain Deploy

## Goal

Serve the static PrivateDAO frontend and the read node behind the same origin so the browser uses:

- wallet-signed writes in the client
- pooled backend reads on `/api/v1`
- direct RPC only as fallback

## Deployment Shape

- frontend static files
  - `https://app.privatedao.xyz/`
- read node reverse-proxied
  - `https://app.privatedao.xyz/api/v1/*`
- health and metrics
  - `https://app.privatedao.xyz/healthz`
  - `https://app.privatedao.xyz/api/v1/metrics`

## Read Node Process

Run the read node on the host:

```bash
cd /home/x-pact/PrivateDAO
PRIVATE_DAO_READ_NODE_HOST=127.0.0.1 \
PRIVATE_DAO_READ_NODE_PORT=8787 \
PRIVATE_DAO_READ_ALLOWED_ORIGIN=https://app.privatedao.xyz \
npm run start:read-node
```

## Reverse Proxy Shape

Example path mapping:

- `/`
  - static site
- `/api/v1/`
  - proxy to `http://127.0.0.1:8787/api/v1/`
- `/healthz`
  - proxy to `http://127.0.0.1:8787/healthz`

## Frontend Binding

When the frontend is served from the same domain, use:

```text
?readApi=https://app.privatedao.xyz/api/v1
```

or inject the same value into the served HTML environment if the static host supports it.

## Verification

After deployment, verify:

```bash
curl https://app.privatedao.xyz/healthz
curl https://app.privatedao.xyz/api/v1/runtime
curl https://app.privatedao.xyz/api/v1/ops/overview
curl https://app.privatedao.xyz/api/v1/devnet/profiles
curl https://app.privatedao.xyz/api/v1/metrics
```

In the Runtime Panel, confirm:

- `READ PATH = Backend Indexer`
- `REFHE BACKEND` shows live counts
- `350-WALLET PROFILE` shows the seven-wave plan
- `READ NODE METRICS` shows requests, failures, and rate-limited counters

## Security Notes

- keep the read node read-only
- do not move any signing key or treasury authority server-side
- keep rate limiting enabled
- keep CORS pinned to the real frontend origin
- terminate TLS at the reverse proxy
- keep backend logs and route-hit metrics enabled for operator review
