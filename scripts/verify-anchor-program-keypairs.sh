#!/usr/bin/env bash
# Verify that local Anchor deploy keypairs match the program IDs declared in Anchor.toml.
# This must run before any build/deploy command so Anchor cannot silently generate
# a new program identity or deploy an unintended program.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v solana-keygen >/dev/null 2>&1; then
  echo "[anchor-keys] solana-keygen is required" >&2
  exit 1
fi

failed=0
while IFS='|' read -r program_name keypair_path; do
  expected="$(awk -v name="$program_name" '$1 == name && $2 == "=" { gsub(/[",]/, "", $3); print $3; exit }' Anchor.toml)"
  if [[ -z "$expected" ]]; then
    echo "[anchor-keys] no declared ID found for $program_name" >&2
    failed=1
    continue
  fi

  if [[ ! -f "$keypair_path" ]]; then
    echo "[anchor-keys] missing deploy keypair for $program_name: $keypair_path" >&2
    failed=1
    continue
  fi

  actual="$(solana-keygen pubkey "$keypair_path")"
  if [[ "$actual" != "$expected" ]]; then
    echo "[anchor-keys] program ID mismatch for $program_name" >&2
    echo "[anchor-keys] declared: $expected" >&2
    echo "[anchor-keys] keypair:  $actual" >&2
    failed=1
  fi
done <<EOF
private_dao|$ROOT_DIR/target/deploy/private_dao-keypair.json
privatedao_auction|$ROOT_DIR/target/deploy/privatedao_auction-keypair.json
zk_groth16_verifier|$ROOT_DIR/target/deploy/zk_groth16_verifier-keypair.json
EOF

if (( failed )); then
  echo "[anchor-keys] refusing build/deploy until every program keypair matches Anchor.toml" >&2
  exit 1
fi

echo "[anchor-keys] all declared program keypairs match Anchor.toml"
