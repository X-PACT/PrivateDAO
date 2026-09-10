#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

npx --yes solc@0.8.24 \
  --base-path "$ROOT_DIR" \
  --include-path "$ROOT_DIR/node_modules" \
  --bin --abi \
  "$ROOT_DIR/packages/evm-verification/contracts/PrivateDaoBlindPolicyGroth16Verifier.sol" \
  "$ROOT_DIR/packages/evm-verification/contracts/BlindVerificationRegistry.sol" \
  "$ROOT_DIR/packages/evm-verification/contracts/RecordVerificationRegistry.sol" \
  -o "$BUILD_DIR"

mkdir -p "$ROOT_DIR/packages/evm-verification/artifacts"
cp "$BUILD_DIR/packages_evm-verification_contracts_PrivateDaoBlindPolicyGroth16Verifier_sol_Groth16Verifier.bin" "$ROOT_DIR/packages/evm-verification/artifacts/Groth16Verifier.bin"
cp "$BUILD_DIR/packages_evm-verification_contracts_PrivateDaoBlindPolicyGroth16Verifier_sol_Groth16Verifier.abi" "$ROOT_DIR/packages/evm-verification/artifacts/Groth16Verifier.abi"
cp "$BUILD_DIR/packages_evm-verification_contracts_BlindVerificationRegistry_sol_BlindVerificationRegistry.bin" "$ROOT_DIR/packages/evm-verification/artifacts/BlindVerificationRegistry.bin"
cp "$BUILD_DIR/packages_evm-verification_contracts_BlindVerificationRegistry_sol_BlindVerificationRegistry.abi" "$ROOT_DIR/packages/evm-verification/artifacts/BlindVerificationRegistry.abi"
cp "$BUILD_DIR/packages_evm-verification_contracts_RecordVerificationRegistry_sol_RecordVerificationRegistry.bin" "$ROOT_DIR/packages/evm-verification/artifacts/RecordVerificationRegistry.bin"
cp "$BUILD_DIR/packages_evm-verification_contracts_RecordVerificationRegistry_sol_RecordVerificationRegistry.abi" "$ROOT_DIR/packages/evm-verification/artifacts/RecordVerificationRegistry.abi"

echo "EVM verification contracts compiled"
