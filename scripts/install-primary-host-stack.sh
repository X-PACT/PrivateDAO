#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STACK_DIR="$REPO_ROOT/deploy/primary-host"
ENV_FILE="$STACK_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE. Copy deploy/primary-host/.env.example first." >&2
  exit 1
fi

npm ci
npm run verify:source-preflight
npm run deploy:primary-host:up
npm run verify:primary-host-stack

echo "Primary host stack installed and locally verified."
echo "If this machine is the production host, the remaining step is DNS cutover."
