#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${PRIVATE_DAO_PRIMARY_HOST_REPO_DIR:-$HOME/PrivateDAO}"
STACK_ENV="$REPO_DIR/deploy/primary-host/.env"
EXPECTED_PROGRAM_ID="${PRIVATE_DAO_EXPECTED_PROGRAM_ID:-EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva}"
PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-api.privatedao.org}"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "PrivateDAO repo not found at $REPO_DIR" >&2
  echo "Set PRIVATE_DAO_PRIMARY_HOST_REPO_DIR=/path/to/PrivateDAO and retry." >&2
  exit 1
fi

cd "$REPO_DIR"
git pull --ff-only

cp deploy/primary-host/.env.example "$STACK_ENV"

set_env() {
  local key="$1"
  local value="$2"
  if grep -qE "^${key}=" "$STACK_ENV"; then
    sed -i "s#^${key}=.*#${key}=${value}#" "$STACK_ENV"
  else
    printf '%s=%s\n' "$key" "$value" >> "$STACK_ENV"
  fi
}

set_env PRIMARY_DOMAIN "$PRIMARY_DOMAIN"
set_env PRIMARY_EDGE_HTTP_BIND_PORT "80"
set_env PRIMARY_EDGE_HTTPS_BIND_PORT "443"
set_env PRIVATE_DAO_PROGRAM_ID "$EXPECTED_PROGRAM_ID"
set_env SOLANA_CLUSTER "testnet"
set_env PRIVATE_DAO_READ_ALLOWED_ORIGIN "https://privatedao.org"
set_env UMBRA_RELAYER_API_ENDPOINT "https://relayer.api-devnet.umbraprivacy.com"

PRIVATE_DAO_SKIP_SOURCE_PREFLIGHT=1 npm run deploy:primary-host:up
npm run verify:remote-primary-host -- "https://${PRIMARY_DOMAIN}"

