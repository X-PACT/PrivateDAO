# Read Node Operator Flow

## Goal

Run a backend read node without changing the trust model of the current app.

## Step 1

Set Devnet RPC environment variables in `.env`:

- `SOLANA_RPC_URL`
- `ALCHEMY_DEVNET_RPC_URL`
- `HELIUS_API_KEY`
- `QUICKNODE_DEVNET_RPC`
- `EXTRA_DEVNET_RPCS`

At least one authenticated RPC is recommended.

## Step 2

Start the read node:

```bash
cd /home/x-pact/PrivateDAO
npm run start:read-node
```

## Step 3

Verify the read node:

```bash
cd /home/x-pact/PrivateDAO
npm run verify:read-node
curl http://127.0.0.1:8787/healthz
```

## Step 4

Point the static frontend to the backend read path:

```text
?readApi=http://127.0.0.1:8787/api/v1
```

or deploy both behind the same domain and expose:

```text
/api/v1
```

## Step 5

Confirm in `Diagnostics`:

- `READ PATH = Backend Indexer`
- `RPC HEALTH = Healthy`
- proposal loading works without repeated browser-side RPC strain

## Production notes

- keep write signing in the wallet
- do not move treasury authority into the read node
- keep rate limiting enabled
- restrict CORS to the real frontend origin
- run the service behind a reverse proxy with TLS
