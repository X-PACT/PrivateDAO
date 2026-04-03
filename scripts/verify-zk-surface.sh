#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[verify-zk-surface] checking zk docs and artifacts"

required_files=(
  "docs/zk-layer.md"
  "docs/zk-upgrade.md"
  "docs/zk-architecture.md"
  "docs/zk-evidence.md"
  "zk/circuits/private_dao_vote_overlay.circom"
  "zk/inputs/private_dao_vote_overlay.sample.json"
  "zk/proofs/private_dao_vote_overlay.proof.json"
  "zk/proofs/private_dao_vote_overlay.public.json"
  "zk/setup/private_dao_vote_overlay_final.zkey"
  "zk/setup/private_dao_vote_overlay_vkey.json"
)

for file in "${required_files[@]}"; do
  test -f "$file" || {
    echo "[verify-zk-surface] missing required file: $file" >&2
    exit 1
  }
done

echo "[verify-zk-surface] checking placeholder text"
if rg -n "REPLACE_WITH|REPLACE_ME|TODO|TBD|coming soon|not implemented" \
  docs/zk-layer.md \
  docs/zk-upgrade.md \
  docs/zk-architecture.md \
  docs/zk-evidence.md; then
  echo "[verify-zk-surface] placeholder text detected" >&2
  exit 1
fi

echo "[verify-zk-surface] verifying sample proof"
npm run zk:verify:sample >/dev/null

echo "[verify-zk-surface] PASS"
