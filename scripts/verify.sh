#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
ensure_required_tools \
  "NODE_BIN:node" \
  "ANCHOR_BIN:anchor" \
  "SOLANA_BIN:solana" \
  "CARGO_BIN:cargo"

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

verify_test() {
  echo "[verify] anchor test"
  "$ANCHOR_BIN" test --skip-build
}

verify_scan() {
  echo "[verify] non-real-code scan"
  local pattern
  pattern="TO""DO|FI""XME|mo""ck|place""holder|st""ub|fa""ke|not imp""lemented|to""y"
  if rg -n -i "$pattern" --glob '!Cargo.lock' --glob '!yarn.lock'; then
    echo "[verify] non-real-code scan failed"
    return 1
  fi
  echo "[verify] non-real-code scan clean"
}

mode="${1:-all}"
case "$mode" in
  tools) verify_tools ;;
  build) verify_build ;;
  test) verify_test ;;
  scan) verify_scan ;;
  all)
    verify_tools
    verify_build
    verify_test
    verify_scan
    ;;
  *)
    echo "Usage: $0 [all|tools|build|test|scan]" >&2
    exit 2
    ;;
esac
