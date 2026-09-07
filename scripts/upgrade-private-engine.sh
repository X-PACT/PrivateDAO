#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
bash scripts/private-engine-preflight.sh
docker compose -f docker-compose.onprem.yml up -d --build
echo "PrivateDAO Engine upgraded. Existing mounted data was preserved."
