#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOCK="${ROOT}/.certify-auction-devnet.lock"
exec 9>"${LOCK}"
flock -n 9 || { echo "auction certification is already running" >&2; exit 2; }

cd "${ROOT}"
export PATH="${HOME}/.rustup/toolchains/1.89.0-x86_64-unknown-linux-gnu/bin:${HOME}/.local/bin:${HOME}/.cargo/bin:${HOME}/.local/share/solana/install/active_release/bin:${PATH}"

echo "[1/5] Rust checks"
cargo check -p privatedao-auction
echo "[2/5] Web typecheck"
npm --prefix apps/web exec -- tsc --noEmit --pretty false
echo "[3/5] SBF build"
bash scripts/build-auction-sbf.sh
echo "[4/5] Static guards"
! rg -n --glob '!node_modules/**' --glob '!target/**' 'fake transaction|simulated success|TODO|PLACEHOLDER' apps/web/src programs/privatedao-auction
echo "[5/5] Development E2E"
if [[ "${RUN_AUCTION_DEVNET_E2E:-0}" != "1" ]]; then
  echo "RUN_AUCTION_DEVNET_E2E=1 is required for wallet/PER network certification" >&2
  exit 3
fi
AUCTION_ALLOW_TEE_ATTESTATION_UNAVAILABLE=0 bash scripts/run-auction-devnet-e2e.sh
