#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SNARKJS_BIN="${SNARKJS_BIN:-${ROOT_DIR}/node_modules/.bin/snarkjs}"
INPUT="${ROOT_DIR}/zk/inputs/private_dao_auction_outcome.sample.json"
WASM="${ROOT_DIR}/zk/build/private_dao_auction_outcome_js/private_dao_auction_outcome.wasm"
ZKEY="${ROOT_DIR}/zk/setup/private_dao_auction_outcome_final.zkey"
OUT="${ROOT_DIR}/zk/proofs"

test -x "$SNARKJS_BIN" || { echo "snarkjs is required; install dependencies before proving." >&2; exit 2; }
test -f "$WASM" && test -f "$ZKEY"
mkdir -p "$OUT"
node "$ROOT_DIR/scripts/zk/generate-auction-outcome-sample.mjs" "$INPUT"
node "${ROOT_DIR}/zk/build/private_dao_auction_outcome_js/generate_witness.js" "$WASM" "$INPUT" "$OUT/private_dao_auction_outcome.wtns"
"$SNARKJS_BIN" groth16 prove "$ZKEY" "$OUT/private_dao_auction_outcome.wtns" "$OUT/private_dao_auction_outcome.proof.json" "$OUT/private_dao_auction_outcome.public.json"
"$SNARKJS_BIN" groth16 verify "${ROOT_DIR}/zk/setup/private_dao_auction_outcome_vkey.json" "$OUT/private_dao_auction_outcome.public.json" "$OUT/private_dao_auction_outcome.proof.json"
