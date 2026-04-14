# Primary Host Bootstrap

## Purpose

This document reduces the external cutover work to:

1. bootstrap an Ubuntu VPS
2. place the production `.env`
3. start the primary-host stack
4. point DNS to that host

The repo now contains the rest.

## Files

- [bootstrap-primary-host-ubuntu.sh](/home/x-pact/PrivateDAO/scripts/bootstrap-primary-host-ubuntu.sh)
- [install-primary-host-stack.sh](/home/x-pact/PrivateDAO/scripts/install-primary-host-stack.sh)
- [verify-remote-primary-host.sh](/home/x-pact/PrivateDAO/scripts/verify-remote-primary-host.sh)
- [docker-compose.yml](/home/x-pact/PrivateDAO/deploy/primary-host/docker-compose.yml)
- [Caddyfile](/home/x-pact/PrivateDAO/deploy/primary-host/Caddyfile)
- [.env.example](/home/x-pact/PrivateDAO/deploy/primary-host/.env.example)

## Ubuntu bootstrap

Run as `root` or via `sudo` on the VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/X-PACT/PrivateDAO/main/scripts/bootstrap-primary-host-ubuntu.sh -o /tmp/bootstrap-primary-host-ubuntu.sh
sudo TARGET_USER=ubuntu INSTALL_DIR=/opt/privatedao bash /tmp/bootstrap-primary-host-ubuntu.sh
```

This installs:

- Docker Engine
- Docker Compose plugin
- Node.js 20
- Git

## Install the stack on the VPS

As the target user:

```bash
cd /opt/privatedao
git clone https://github.com/X-PACT/PrivateDAO.git .
git checkout main
cp deploy/primary-host/.env.example deploy/primary-host/.env
nano deploy/primary-host/.env
npm run install:primary-host-stack
```

Or equivalently:

```bash
npm run install:primary-host-stack
```

This runs:

- `npm ci`
- source preflight
- primary-host stack bring-up
- local stack verification

## Remote verification after DNS

After DNS points to the VPS:

```bash
./scripts/verify-remote-primary-host.sh https://privatedao.org
npm run verify:host-topology:strict
```

Expected result:

- `privatedao.org` no longer reports `Server: GitHub.com`
- `/healthz` returns `healthy`
- `/api/v1/config` returns `backend-indexer`
- `/api/v1/metrics` returns counters

## Remaining external actions

The repo cannot perform these without infrastructure credentials:

1. provision the VPS itself
2. edit the real production `.env`
3. attach `privatedao.org` DNS to the host
4. manage registrar or DNS provider records
