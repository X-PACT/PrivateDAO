#!/usr/bin/env bash
set -euo pipefail

echo "[verify] cwd: $(pwd)"

echo "[verify] tool versions"
node -v
yarn -v
anchor --version
solana --version
cargo --version

echo "[verify] anchor build"
anchor build

echo "[verify] anchor test"
anchor test --skip-build

echo "[verify] non-real-code scan"
pattern="TO""DO|FI""XME|mo""ck|place""holder|st""ub|fa""ke|not imp""lemented|to""y"
if rg -n -i "$pattern" --glob '!Cargo.lock' --glob '!yarn.lock'; then
  echo "[verify] non-real-code scan failed"
  exit 1
else
  echo "[verify] non-real-code scan clean"
fi
