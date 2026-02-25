#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT_DIR="$ROOT_DIR/LEGAL/evidence-pack"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
PKG_DIR="$OUT_DIR/$TS"

mkdir -p "$PKG_DIR"

PROGRAM_ID="$(sed -n 's/.*private_dao = "\(.*\)".*/\1/p' "$ROOT_DIR/Anchor.toml" | head -n1)"
DEPLOY_SLOT="$(solana program show "$PROGRAM_ID" --url "${SOLANA_RPC_URL:-https://api.devnet.solana.com}" 2>/dev/null | sed -n 's/^Last Deployed In Slot: //p' | tr -d '[:space:]' || true)"

{
  echo "timestamp_utc=$TS"
  echo "project=PrivateDAO"
  echo "owner=Eslam Kotb (X-PACT)"
  echo "program_id=$PROGRAM_ID"
  echo "deploy_slot=${DEPLOY_SLOT:-unknown}"
  echo "repo_head=$(git -C "$ROOT_DIR" rev-parse HEAD)"
  echo "repo_branch=$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)"
} > "$PKG_DIR/metadata.txt"

git -C "$ROOT_DIR" log --date=iso --pretty=format:'%H|%ad|%an|%s' > "$PKG_DIR/git-log.txt"
git -C "$ROOT_DIR" tag -n > "$PKG_DIR/git-tags.txt" || true
git -C "$ROOT_DIR" status --short > "$PKG_DIR/git-status.txt"

cp "$ROOT_DIR/README.md" "$PKG_DIR/README.snapshot.md"
cp "$ROOT_DIR/IP_POLICY.md" "$PKG_DIR/IP_POLICY.snapshot.md"
cp "$ROOT_DIR/TRADEMARKS.md" "$PKG_DIR/TRADEMARKS.snapshot.md"
cp "$ROOT_DIR/CHANGELOG.md" "$PKG_DIR/CHANGELOG.snapshot.md"
cp "$ROOT_DIR/docs/index.html" "$PKG_DIR/docs.index.snapshot.html"

if [ -f "$ROOT_DIR/docs/assets/logo.png" ]; then
  cp "$ROOT_DIR/docs/assets/logo.png" "$PKG_DIR/logo.png"
fi
if [ -f "$ROOT_DIR/docs/assets/social-preview.svg" ]; then
  cp "$ROOT_DIR/docs/assets/social-preview.svg" "$PKG_DIR/social-preview.svg"
fi

tar -czf "$OUT_DIR/evidence-pack-$TS.tar.gz" -C "$OUT_DIR" "$TS"
echo "Evidence pack generated:"
echo "  $OUT_DIR/evidence-pack-$TS.tar.gz"
