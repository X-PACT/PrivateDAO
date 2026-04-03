#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CIRCUIT_DIR="$ROOT_DIR/zk/circuits"
BUILD_DIR="$ROOT_DIR/zk/build"
SETUP_DIR="$ROOT_DIR/zk/setup"
PTAU_0="$SETUP_DIR/pot12_0000.ptau"
PTAU_1="$SETUP_DIR/pot12_0001.ptau"
PTAU_FINAL="$SETUP_DIR/pot12_final.ptau"
R1CS="$BUILD_DIR/private_dao_vote_overlay.r1cs"
ZKEY_0="$SETUP_DIR/private_dao_vote_overlay_0000.zkey"
ZKEY_FINAL="$SETUP_DIR/private_dao_vote_overlay_final.zkey"
VK_JSON="$SETUP_DIR/private_dao_vote_overlay_vkey.json"

mkdir -p "$BUILD_DIR" "$SETUP_DIR"
rm -f \
  "$SETUP_DIR/pot10_0000.ptau" \
  "$SETUP_DIR/pot10_0001.ptau" \
  "$SETUP_DIR/pot10_final.ptau" \
  "$PTAU_0" "$PTAU_1" "$PTAU_FINAL" "$ZKEY_0" "$ZKEY_FINAL" "$VK_JSON"

echo "[zk] compiling circuit"
circom "$CIRCUIT_DIR/private_dao_vote_overlay.circom" --r1cs --wasm --sym -o "$BUILD_DIR"

echo "[zk] building powers of tau"
npx snarkjs powersoftau new bn128 12 "$PTAU_0"
npx snarkjs powersoftau contribute "$PTAU_0" "$PTAU_1" --name="PrivateDAO zk phase1" -e="PrivateDAO deterministic phase1"
npx snarkjs powersoftau prepare phase2 "$PTAU_1" "$PTAU_FINAL"

echo "[zk] running Groth16 setup"
npx snarkjs groth16 setup "$R1CS" "$PTAU_FINAL" "$ZKEY_0"
npx snarkjs zkey contribute "$ZKEY_0" "$ZKEY_FINAL" --name="PrivateDAO zk phase2" -e="PrivateDAO deterministic phase2"
npx snarkjs zkey export verificationkey "$ZKEY_FINAL" "$VK_JSON"

echo "[zk] setup complete"
