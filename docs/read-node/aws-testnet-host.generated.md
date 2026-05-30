# PrivateDAO Read-Node AWS Testnet Host

Generated at: 2026-04-29T09:05:17Z
HTTPS enabled at: 2026-04-29T13:25:50Z
Primary host re-verified at: 2026-05-30T02:35:00Z

## Host

- AWS region: `eu-north-1`
- Instance ID: `i-07422d1a0a27367db`
- Instance name: `PrivateDAO`
- Key pair: `PrivateDAO AWS` (`key-0be6b232d58a45851`)
- Public IPv4: `13.51.169.254`
- Public DNS: `ec2-13-51-169-254.eu-north-1.compute.amazonaws.com`
- Runtime user: host-managed Linux user
- Service manager: `systemd`
- Service name: `privatedao-read-node`
- Reverse proxy: `Caddy`
- TLS: Caddy-managed HTTPS

## Network

- Security group: `sg-0d20f35d62f8ff6c4`
- SSH: `22/tcp` from `104.28.162.227/32`
- HTTP: `80/tcp` from `0.0.0.0/0`
- HTTPS: `443/tcp` from `0.0.0.0/0`

## Runtime

- Read-node URL before DNS: `https://13.51.169.254`
- Canonical API URL: `https://api.privatedao.org`
- HTTP behavior: redirects to HTTPS
- Internal app listener: `127.0.0.1:8787`
- Solana runtime RPC: `https://api.testnet.solana.com`
- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Umbra relayer endpoint: `https://relayer.api-devnet.umbraprivacy.com`

## Verified Endpoints

- `GET https://api.privatedao.org/healthz`
- `GET https://api.privatedao.org/api/v1/config`
- `GET https://api.privatedao.org/api/v1/umbra/relayer/health`
- `GET https://api.privatedao.org/api/v1/qvac/runtime-proof`
- `POST https://api.privatedao.org/api/v1/private-settlement/intent`

## DNS

The canonical API DNS is already cut over to the current primary host:

- Type: `A`
- Host: `api`
- Value: `13.51.169.254`
- TTL: `Automatic`

Verify:

```bash
curl -fsS https://api.privatedao.org/healthz
curl -fsS https://api.privatedao.org/api/v1/umbra/relayer/health
curl -fsS https://api.privatedao.org/api/v1/qvac/runtime-proof
```

## Legacy Host

The older read-node instance remains visible in AWS, but it is no longer the DNS primary for `api.privatedao.org`:

- Instance ID: `i-08accd60a2ff2925a`
- Instance name: `privatedao-read-node-testnet`
- Key pair: `privatedao-read-node-testnet-20260429` (`key-070c039108658a2a2`)
- Public IPv4: `13.60.187.225`
- Public DNS: `ec2-13-60-187-225.eu-north-1.compute.amazonaws.com`
