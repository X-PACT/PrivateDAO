#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SETUP_DIR="$ROOT_DIR/zk/setup"
PROOF_DIR="$ROOT_DIR/zk/proofs"

echo "[zk] verifying proof"
npx snarkjs groth16 verify \
  "$SETUP_DIR/private_dao_vote_overlay_vkey.json" \
  "$PROOF_DIR/private_dao_vote_overlay.public.json" \
  "$PROOF_DIR/private_dao_vote_overlay.proof.json"

echo "[zk] verification passed"
