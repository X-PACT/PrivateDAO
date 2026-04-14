#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STACK_DIR="$REPO_ROOT/deploy/primary-host"

if [[ -f "$STACK_DIR/.env" ]]; then
  docker compose --env-file "$STACK_DIR/.env" -f "$STACK_DIR/docker-compose.yml" down --remove-orphans
else
  docker compose -f "$STACK_DIR/docker-compose.yml" down --remove-orphans
fi
