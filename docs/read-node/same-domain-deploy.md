# Read Node Same-Domain Deploy

## Goal

Serve the static PrivateDAO frontend and the read node behind the same origin so the browser uses:

- wallet-signed writes in the client
- pooled backend reads on `/api/v1`
- direct RPC only as fallback

## Deployment Target

The repo now carries a concrete primary-host target in:

- [deploy/primary-host/docker-compose.yml](/home/x-pact/PrivateDAO/deploy/primary-host/docker-compose.yml)
- [deploy/primary-host/Caddyfile](/home/x-pact/PrivateDAO/deploy/primary-host/Caddyfile)
- [deploy/primary-host/read-node.Dockerfile](/home/x-pact/PrivateDAO/deploy/primary-host/read-node.Dockerfile)
- [deploy/primary-host/.env.example](/home/x-pact/PrivateDAO/deploy/primary-host/.env.example)

Target runtime shape:

- primary static frontend
  - `https://privatedao.org/`
- same-origin read node
  - `https://privatedao.org/api/v1/*`
- public health and metrics
  - `https://privatedao.org/healthz`
  - `https://privatedao.org/api/v1/metrics`
- backup-only static mirror
  - `https://x-pact.github.io/PrivateDAO/`

## Read Node Process

The stack runs:

- `read-node`
  - containerized `npm run start:read-node`
  - bound internally to `read-node:8787`
- `edge`
  - Caddy reverse proxy
  - serves the static export
  - proxies `/healthz` and `/api/v1/*`

## Reverse Proxy Shape

Exact path mapping:

- `/`
  - static export from `dist/web-mirror-root`
- `/healthz`
  - reverse proxy to `http://read-node:8787/healthz`
- `/api/v1/*`
  - reverse proxy to `http://read-node:8787/api/v1/*`

The edge layer also adds:

- `X-PrivateDAO-Primary-Host: candidate`
- `X-PrivateDAO-Backup-Policy: github-pages-backup-only`

## Config Contract

Copy:

```bash
cp deploy/primary-host/.env.example deploy/primary-host/.env
```

Then set:

- `PRIMARY_DOMAIN=privatedao.org`
- `ACME_EMAIL=...`
- one or more Devnet RPC credentials:
  - `ALCHEMY_DEVNET_RPC_URL`
  - or `ALCHEMY_API_KEY`
  - or `HELIUS_API_KEY`
  - or `SOLANA_RPC_URL`
- `PRIVATE_DAO_PROGRAM_ID` if you want explicit override

For rehearsal the stack exposes:

- local verification edge: `http://127.0.0.1:8080`
- candidate production edge HTTP: host bind from `PRIMARY_EDGE_HTTP_BIND_PORT`
- candidate production edge HTTPS: host bind from `PRIMARY_EDGE_HTTPS_BIND_PORT`

## Commands

```bash
cd /home/x-pact/PrivateDAO
npm run deploy:primary-host:prepare
npm run deploy:primary-host:up
```

To stop it:

```bash
cd /home/x-pact/PrivateDAO
npm run deploy:primary-host:down
```

To verify the whole stack locally:

```bash
cd /home/x-pact/PrivateDAO
npm run verify:primary-host-stack
```

## Verification

After deployment, verify:

```bash
curl https://privatedao.org/healthz
curl https://privatedao.org/api/v1/runtime
curl https://privatedao.org/api/v1/ops/overview
curl https://privatedao.org/api/v1/devnet/profiles
curl https://privatedao.org/api/v1/metrics
```

For local rehearsal, the same checks should pass at:

```bash
curl http://127.0.0.1:8080/healthz
curl http://127.0.0.1:8080/api/v1/runtime
curl http://127.0.0.1:8080/api/v1/metrics
```

The repo verifier currently asserts:

- root route serves the static PrivateDAO bundle
- `/healthz` reports `healthy`
- `/api/v1/config` reports `backend-indexer`
- `/api/v1/metrics` returns counters
- `/api/v1/ops/snapshot` still advertises `/api/v1`

## DNS-Cutover Boundary

After the stack passes local verification, the remaining external work is:

1. provision the host/VPS
2. copy `deploy/primary-host/.env`
3. run `npm run deploy:primary-host:up`
4. bind `PRIMARY_EDGE_HTTP_BIND_PORT=80` and `PRIMARY_EDGE_HTTPS_BIND_PORT=443`
5. point `privatedao.org` DNS to that host
6. run `npm run verify:host-topology:strict`

At that point GitHub Pages should remain only as:

- `x-pact.github.io/PrivateDAO/`
- backup-only / non-primary public mirror

In the Runtime Panel and operator routes, confirm:

- `READ PATH = Backend Indexer`
- `REFHE BACKEND` shows live counts
- `350-WALLET PROFILE` shows the seven-wave plan
- `READ NODE METRICS` shows requests, failures, and rate-limited counters

## Security Notes

- keep the read node read-only
- do not move any signing key or treasury authority server-side
- keep rate limiting enabled
- keep CORS pinned to `https://privatedao.org` after cutover
- terminate TLS at the reverse proxy
- keep backend logs and route-hit metrics enabled for operator review
