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

echo "[verify] anchor build"
"$ANCHOR_BIN" build

echo "[verify] anchor test"
"$ANCHOR_BIN" test --skip-build

echo "[verify] non-real-code scan"
pattern="TO""DO|FI""XME|mo""ck|place""holder|st""ub|fa""ke|not imp""lemented|to""y"
if rg -n -i "$pattern" --glob '!Cargo.lock' --glob '!yarn.lock'; then
  echo "[verify] non-real-code scan failed"
  exit 1
else
  echo "[verify] non-real-code scan clean"
fi
