#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"
bash scripts/private-engine-preflight.sh
if [[ ! -f services/private-engine/.env ]]; then
  cp services/private-engine/.env.example services/private-engine/.env
  chmod 600 services/private-engine/.env
  echo "Created services/private-engine/.env. Review the public key and deployment settings before production use."
fi
mkdir -p services/private-engine/data
docker compose -f docker-compose.onprem.yml up -d --build
echo "PrivateDAO Engine installed. Open http://localhost:3000/admin/private-engine"
