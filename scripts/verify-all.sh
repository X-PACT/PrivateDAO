#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[verify-all] validating Ranger strategy package"
npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json >/dev/null

echo "[verify-all] checking live proof"
npm run verify:live-proof >/dev/null

echo "[verify-all] checking release manifest"
npm run verify:release-manifest >/dev/null

echo "[verify-all] checking review links"
npm run verify:review-links >/dev/null

echo "[verify-all] checking ops surface"
npm run verify:ops-surface >/dev/null

echo "[verify-all] checking reviewer surface"
npm run verify:review-surface >/dev/null

echo "[verify-all] PASS"
