#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/zk/common.sh"
CIRCUIT_DIR="$ROOT_DIR/zk/circuits"
BUILD_DIR="$ROOT_DIR/zk/build"
SETUP_DIR="$ROOT_DIR/zk/setup"
PTAU_0="$SETUP_DIR/pot12_0000.ptau"
PTAU_1="$SETUP_DIR/pot12_0001.ptau"
PTAU_FINAL="$SETUP_DIR/pot12_final.ptau"

mkdir -p "$BUILD_DIR" "$SETUP_DIR"

if (($#)); then
  circuits=("$@")
else
  mapfile -t circuits < <(zk_circuits)
fi

if [[ ! -f "$PTAU_FINAL" ]]; then
  echo "[zk] building powers of tau"
  rm -f "$PTAU_0" "$PTAU_1" "$PTAU_FINAL"
  npx snarkjs powersoftau new bn128 12 "$PTAU_0"
  npx snarkjs powersoftau contribute "$PTAU_0" "$PTAU_1" --name="PrivateDAO zk phase1" -e="PrivateDAO deterministic phase1"
  npx snarkjs powersoftau prepare phase2 "$PTAU_1" "$PTAU_FINAL"
else
  echo "[zk] reusing existing powers of tau"
fi

for circuit in "${circuits[@]}"; do
  local_r1cs="$BUILD_DIR/${circuit}.r1cs"
  local_zkey_0="$SETUP_DIR/${circuit}_0000.zkey"
  local_zkey_final="$SETUP_DIR/${circuit}_final.zkey"
  local_vk_json="$SETUP_DIR/${circuit}_vkey.json"

  rm -rf "$BUILD_DIR/${circuit}_js"
  rm -f "$local_r1cs" "$BUILD_DIR/${circuit}.sym" "$local_zkey_0" "$local_zkey_final" "$local_vk_json"

  echo "[zk] compiling circuit: $circuit"
  circom "$CIRCUIT_DIR/${circuit}.circom" --r1cs --wasm --sym -o "$BUILD_DIR"

  echo "[zk] running Groth16 setup: $circuit"
  npx snarkjs groth16 setup "$local_r1cs" "$PTAU_FINAL" "$local_zkey_0"
  npx snarkjs zkey contribute "$local_zkey_0" "$local_zkey_final" --name="PrivateDAO zk phase2 ${circuit}" -e="PrivateDAO deterministic phase2 ${circuit}"
  npx snarkjs zkey export verificationkey "$local_zkey_final" "$local_vk_json"
done

echo "[zk] setup complete"
