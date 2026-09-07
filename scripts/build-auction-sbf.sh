#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOLANA_RELEASE="${HOME}/.local/share/solana/install/releases/3.1.8/solana-release"
SDK_SOURCE="${SOLANA_RELEASE}/bin/platform-tools-sdk"
SDK_BACKUP="${SOLANA_RELEASE}/bin/platform-tools-sdk.bak-20260704/sbf"
SDK_TMP="$(ccp mktemp -d /tmp/privatedao-auction-sbf.XXXXXX)"
trap 'ccp rm -rf "$SDK_TMP"' EXIT

ccp mkdir -p "${SDK_TMP}/dependencies"
ccp ln -s "${SDK_SOURCE}" "${SDK_TMP}/dependencies/platform-tools"
ccp ln -s "${SDK_BACKUP}/scripts" "${SDK_TMP}/scripts"
ccp ln -s "${SDK_BACKUP}/env.sh" "${SDK_TMP}/env.sh"
ccp ln -s "${SDK_BACKUP}/syscalls.txt" "${SDK_TMP}/syscalls.txt"
ccp touch "${SDK_TMP}/dependencies/platform-tools-v1.52.md"

cd "${ROOT}"
ccp env \
  PATH="${HOME}/.rustup/toolchains/1.89.0-x86_64-unknown-linux-gnu/bin:${SDK_SOURCE}/rust/bin:${HOME}/.local/bin:${SOLANA_RELEASE}/bin:${PATH}" \
  RUSTC="${SDK_SOURCE}/rust/bin/rustc" \
  "${SOLANA_RELEASE}/bin/cargo-build-sbf" \
  --no-rustup-override \
  --skip-tools-install \
  --optimize-size \
  --sbf-sdk "${SDK_TMP}" \
  --manifest-path programs/privatedao-auction/Cargo.toml \
  --sbf-out-dir target/deploy
