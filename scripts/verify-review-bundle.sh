#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OUT_DIR="dist/reviewer-bundle"
ARCHIVE="dist/reviewer-bundle.tar.gz"

echo "[review-bundle] rebuilding packaged reviewer bundle"
npm run build:review-bundle >/dev/null

require_file() {
  local path="$1"
  if [[ ! -f "$path" ]]; then
    echo "[review-bundle] missing required file: $path" >&2
    exit 1
  fi
}

require_archive_entry() {
  local entry="$1"
  if ! tar -tzf "$ARCHIVE" "$entry" >/dev/null 2>&1; then
    echo "[review-bundle] missing archive entry: $entry" >&2
    exit 1
  fi
}

require_file "$ARCHIVE"
require_file "$OUT_DIR/README.md"
require_file "$OUT_DIR/docs/live-proof.md"
require_file "$OUT_DIR/docs/governance-hardening-v3.md"
require_file "$OUT_DIR/docs/settlement-hardening-v3.md"
require_file "$OUT_DIR/docs/test-wallet-live-proof-v3.generated.md"
require_file "$OUT_DIR/docs/reviewer-fast-path.md"
require_file "$OUT_DIR/docs/reviewer-surface-map.md"
require_file "$OUT_DIR/docs/audit-packet.generated.md"
require_file "$OUT_DIR/docs/mainnet-readiness.generated.md"
require_file "$OUT_DIR/docs/governance-runtime-proof.generated.md"
require_file "$OUT_DIR/docs/browser-wallet.generated.md"
require_file "$OUT_DIR/docs/execution-unlock-bundle.generated.md"

require_archive_entry "reviewer-bundle/README.md"
require_archive_entry "reviewer-bundle/docs/live-proof.md"
require_archive_entry "reviewer-bundle/docs/governance-hardening-v3.md"
require_archive_entry "reviewer-bundle/docs/settlement-hardening-v3.md"
require_archive_entry "reviewer-bundle/docs/test-wallet-live-proof-v3.generated.md"
require_archive_entry "reviewer-bundle/docs/reviewer-fast-path.md"
require_archive_entry "reviewer-bundle/docs/reviewer-surface-map.md"
require_archive_entry "reviewer-bundle/docs/audit-packet.generated.md"
require_archive_entry "reviewer-bundle/docs/mainnet-readiness.generated.md"
require_archive_entry "reviewer-bundle/docs/governance-runtime-proof.generated.md"
require_archive_entry "reviewer-bundle/docs/browser-wallet.generated.md"
require_archive_entry "reviewer-bundle/docs/execution-unlock-bundle.generated.md"

echo "[review-bundle] PASS"
