#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
verify_tools() {
  echo "[verify] cwd: $(pwd)"
  echo "[verify] tool versions"
  "$NODE_BIN" -v
  if [[ -n "${YARN_BIN:-}" ]]; then
    "$YARN_BIN" --version
  elif command -v npm >/dev/null 2>&1; then
    npm -v
  else
    echo "[verify] warning: yarn/npm not found"
  fi
  "$ANCHOR_BIN" --version
  "$SOLANA_BIN" --version
  "$CARGO_BIN" --version
}

verify_build() {
  echo "[verify] anchor build"
  "$ANCHOR_BIN" build
}

verify_fmt() {
  echo "[verify] formatting checks"
  "$CARGO_BIN" fmt --all -- --check
}

verify_lint() {
  echo "[verify] lint checks"
  RUSTFLAGS="${RUSTFLAGS:-} -Aunexpected_cfgs -Adeprecated" \
    "$CARGO_BIN" clippy --workspace --all-targets --all-features -- -D warnings
}

verify_test() {
  echo "[verify] anchor test"
  "$ANCHOR_BIN" test --skip-build
}

verify_typecheck() {
  echo "[verify] typescript typecheck"
  if [[ -x "./node_modules/.bin/tsc" ]]; then
    ./node_modules/.bin/tsc --noEmit
  else
    echo "[verify] missing local TypeScript compiler. Run npm install or yarn install first." >&2
    return 1
  fi
}

verify_scan() {
  echo "[verify] non-real-code scan"
  local pattern
  pattern="TO""DO|FI""XME|mo""ck|st""ub|fa""ke|not imp""lemented|to""y"
  if rg -n -i "$pattern" \
    --glob '*.rs' \
    --glob '*.ts' \
    --glob '*.js' \
    --glob '*.sh' \
    --glob '*.py' \
    --glob '*.toml' \
    --glob '*.yml' \
    --glob '*.yaml' \
    --glob '*.html' \
    --glob '!Cargo.lock' \
    --glob '!yarn.lock'; then
    echo "[verify] non-real-code scan failed"
    return 1
  fi
  echo "[verify] non-real-code scan clean"
}


verify_rpc() {
  echo "[verify] rpc selection tests"
  bash "$SCRIPT_DIR/test-rpc-selection.sh"
}


verify_rpc_health() {
  echo "[verify] rpc endpoint health"
  bash "$SCRIPT_DIR/check-rpc-health.sh"
}

verify_rpc_health_unit() {
  echo "[verify] rpc health classifier tests"
  bash "$SCRIPT_DIR/test-rpc-health.sh"
}

mode="${1:-all}"
case "$mode" in
  tools)
    ensure_required_tools "NODE_BIN:node" "ANCHOR_BIN:anchor" "SOLANA_BIN:solana" "CARGO_BIN:cargo"
    verify_tools
    ;;
  fmt)
    ensure_required_tools "CARGO_BIN:cargo"
    verify_fmt
    ;;
  lint)
    ensure_required_tools "CARGO_BIN:cargo"
    verify_lint
    ;;
  build)
    ensure_required_tools "ANCHOR_BIN:anchor"
    verify_build
    ;;
  test)
    ensure_required_tools "ANCHOR_BIN:anchor"
    verify_test
    ;;
  scan)
    verify_scan
    ;;
  typecheck)
    verify_typecheck
    ;;
  rpc)
    verify_rpc
    verify_rpc_health_unit
    ;;
  rpc-health)
    verify_rpc_health
    ;;
  rpc-health-unit)
    verify_rpc_health_unit
    ;;
  all)
    ensure_required_tools "NODE_BIN:node" "ANCHOR_BIN:anchor" "SOLANA_BIN:solana" "CARGO_BIN:cargo"
    verify_tools
    verify_typecheck
    verify_fmt
    verify_lint
    verify_build
    verify_test
    verify_scan
    verify_rpc
    verify_rpc_health_unit
    verify_rpc_health
    ;;
  *)
    echo "Usage: $0 [all|tools|typecheck|fmt|lint|build|test|scan|rpc|rpc-health|rpc-health-unit]" >&2
    exit 2
    ;;
esac
