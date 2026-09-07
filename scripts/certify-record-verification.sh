#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${RECORD_TEST_PORT:-18891}"
DATA_DIR="$(mktemp -d "${TMPDIR:-/tmp}/privatedao-record-cert.XXXXXX")"
PID=""
cleanup() { if [[ -n "$PID" ]]; then kill "$PID" 2>/dev/null || true; wait "$PID" 2>/dev/null || true; fi; rm -rf "$DATA_DIR"; }
trap cleanup EXIT

cd "$ROOT_DIR"
npm --prefix apps/web run lint
node --check services/private-engine/src/server.mjs
node --check services/private-engine/src/record-verification.mjs
node --check scripts/test-record-verification-solana-e2e.mjs
PRIVATEDAO_ALLOW_DEV_LICENSE=true PRIVADAO_AUTH_MODE=development PRIVATEDAO_DATABASE_MODE=json PRIVATEDAO_DATA_DIR="$DATA_DIR" PRIVATEDAO_DATABASE_FILE="$DATA_DIR/records.json" PRIVATEDAO_RECORD_ANCHOR_URL="${PRIVATEDAO_RECORD_ANCHOR_URL:-}" PRIVATEDAO_RECORD_ANCHOR_RECONCILE_URL="${PRIVATEDAO_RECORD_ANCHOR_RECONCILE_URL:-}" PORT="$PORT" node services/private-engine/src/server.mjs >/tmp/privatedao-record-cert.log 2>&1 &
PID=$!
for _ in $(seq 1 40); do curl -fsS "http://127.0.0.1:${PORT}/health" >/dev/null && break; sleep 0.1; done
RECORD_TEST_EXTERNAL=1 RECORD_TEST_PORT="$PORT" node scripts/test-record-verification.mjs
node --input-type=module -e 'import { canonicalize, normalizeRecord } from "./services/private-engine/src/record-verification.mjs"; const a=canonicalize({b:2,a:1}); const b=canonicalize({a:1,b:2}); if(a!==b) process.exit(1); console.log("canonical vectors: passed")'
RECORD_TEST_EXTERNAL=1 RECORD_TEST_PORT="$PORT" node scripts/test-record-verification-solana-e2e.mjs
echo "Record Verification local certification: PASS"
