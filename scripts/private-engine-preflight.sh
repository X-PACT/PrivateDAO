#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "PrivateDAO Engine preflight"
command -v docker >/dev/null || { echo "docker is required" >&2; exit 1; }
docker compose version >/dev/null || { echo "docker compose plugin is required" >&2; exit 1; }
test -f "$ROOT_DIR/docker-compose.onprem.yml" || { echo "docker-compose.onprem.yml is missing" >&2; exit 1; }
test -f "$ROOT_DIR/services/private-engine/.env.example" || { echo ".env.example is missing" >&2; exit 1; }
test -d "$ROOT_DIR/zk/setup" || { echo "ZK setup artifacts are missing" >&2; exit 1; }
test -f "$ROOT_DIR/zk/setup/private_dao_blind_kyc_final.zkey" || { echo "KYC proving key is missing" >&2; exit 1; }
test -f "$ROOT_DIR/zk/setup/private_dao_blind_underwriting_vkey.json" || { echo "Underwriting verification key is missing" >&2; exit 1; }
echo "Preflight: PASS"
