#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

suite_name="${1:-core}"
test_file="${2:-tests/private-dao.ts}"

supports_avx2() {
  if [[ -r /proc/cpuinfo ]] && grep -qi 'avx2' /proc/cpuinfo; then
    return 0
  fi

  if command -v lscpu >/dev/null 2>&1 && lscpu | grep -qi 'avx2'; then
    return 0
  fi

  return 1
}

run_portable_core_checks() {
  echo "[local-anchor-suite] portable core checks (${suite_name})"
  cargo test -p private-dao --manifest-path "$ROOT_DIR/Cargo.toml" --lib -- --list >/dev/null
  ./node_modules/.bin/ts-node scripts/verify-pdao-token-surface.ts >/dev/null

  if [[ "$suite_name" == "core" || "$suite_name" == "all" ]]; then
    ./node_modules/.bin/ts-node scripts/verify-frontend-surface.ts >/dev/null
    MAGICBLOCK_HTTP_TIMEOUT_MS="${MAGICBLOCK_HTTP_TIMEOUT_MS:-2500}" \
      PRIVATE_DAO_RPC_TIMEOUT_MS="${PRIVATE_DAO_RPC_TIMEOUT_MS:-12000}" \
      ./node_modules/.bin/ts-node scripts/verify-read-node.ts >/dev/null
  fi

  echo "[local-anchor-suite] PASS portable checks complete; Anchor local-validator suite requires an AVX2-capable runtime"
}

if supports_avx2; then
  echo "[local-anchor-suite] running anchor suite on AVX2-capable host (${suite_name})"
  if [[ "$suite_name" == "all" ]]; then
    anchor test --provider.cluster localnet
  else
    anchor test --provider.cluster localnet --run "$test_file"
  fi
  exit 0
fi

run_portable_core_checks
