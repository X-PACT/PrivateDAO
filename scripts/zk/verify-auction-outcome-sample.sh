#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SNARKJS_BIN="${SNARKJS_BIN:-${ROOT_DIR}/node_modules/.bin/snarkjs}"
test -x "$SNARKJS_BIN" || { echo "snarkjs is required; install dependencies before verifying." >&2; exit 2; }
"$SNARKJS_BIN" groth16 verify \
  "$ROOT_DIR/zk/setup/private_dao_auction_outcome_vkey.json" \
  "$ROOT_DIR/zk/proofs/private_dao_auction_outcome.public.json" \
  "$ROOT_DIR/zk/proofs/private_dao_auction_outcome.proof.json"
