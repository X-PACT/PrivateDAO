#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILD_DIR="$ROOT_DIR/zk/build"
SETUP_DIR="$ROOT_DIR/zk/setup"
INPUT_DIR="$ROOT_DIR/zk/inputs"
PROOF_DIR="$ROOT_DIR/zk/proofs"
INPUT_JSON="$INPUT_DIR/private_dao_vote_overlay.sample.json"
WASM_DIR="$BUILD_DIR/private_dao_vote_overlay_js"
WASM_FILE="$WASM_DIR/private_dao_vote_overlay.wasm"
WITNESS="$PROOF_DIR/private_dao_vote_overlay.wtns"
PROOF_JSON="$PROOF_DIR/private_dao_vote_overlay.proof.json"
PUBLIC_JSON="$PROOF_DIR/private_dao_vote_overlay.public.json"

mkdir -p "$INPUT_DIR" "$PROOF_DIR"

echo "[zk] generating sample input"
node "$ROOT_DIR/scripts/generate-zk-sample-input.js" "$INPUT_JSON"

echo "[zk] generating witness"
node "$WASM_DIR/generate_witness.js" "$WASM_FILE" "$INPUT_JSON" "$WITNESS"

echo "[zk] generating proof"
npx snarkjs groth16 prove "$SETUP_DIR/private_dao_vote_overlay_final.zkey" "$WITNESS" "$PROOF_JSON" "$PUBLIC_JSON"

echo "[zk] proof generated"
