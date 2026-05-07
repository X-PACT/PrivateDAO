#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_FILE="${ROOT_DIR}/docs/supabase-operation-receipts.sql"

if [[ ! -f "${SCHEMA_FILE}" ]]; then
  echo "Missing schema file: ${SCHEMA_FILE}" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_PASSWORD:-}" && -z "${SUPABASE_POOLER_CONNECTION_STRING:-}" ]]; then
  echo "Set SUPABASE_DB_PASSWORD or SUPABASE_POOLER_CONNECTION_STRING before running." >&2
  exit 1
fi

if [[ -n "${SUPABASE_POOLER_CONNECTION_STRING:-}" ]]; then
  docker run --rm \
    --network host \
    -v "${ROOT_DIR}:/work:ro" \
    postgres:16-alpine \
    psql "${SUPABASE_POOLER_CONNECTION_STRING}" \
    -v ON_ERROR_STOP=1 \
    -f /work/docs/supabase-operation-receipts.sql
else
  docker run --rm \
    --network host \
    -e PGPASSWORD="${SUPABASE_DB_PASSWORD}" \
    -v "${ROOT_DIR}:/work:ro" \
    postgres:16-alpine \
    psql "host=aws-1-us-east-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.zhjtxxykchcbtnqiykyj sslmode=require connect_timeout=10" \
    -v ON_ERROR_STOP=1 \
    -f /work/docs/supabase-operation-receipts.sql
fi

echo "Supabase receipts schema applied. Run: bash -lc 'set -a; source .env; set +a; npm run verify:supabase-receipts'"
