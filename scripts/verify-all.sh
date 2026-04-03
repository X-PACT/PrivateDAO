#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[verify-all] validating Ranger strategy package"
npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json >/dev/null

echo "[verify-all] checking live proof"
npm run verify:live-proof >/dev/null

echo "[verify-all] checking strategy surface"
npm run verify:strategy-surface >/dev/null

echo "[verify-all] rebuilding zk registry"
npm run build:zk-registry >/dev/null

echo "[verify-all] checking zk surface"
npm run verify:zk-surface >/dev/null

echo "[verify-all] checking frontend surface"
npm run verify:frontend-surface >/dev/null

echo "[verify-all] checking runtime surface"
npm run verify:runtime-surface >/dev/null

echo "[verify-all] checking submission registry"
npm run verify:submission-registry >/dev/null

echo "[verify-all] checking registry consistency"
npm run verify:registry-consistency >/dev/null

echo "[verify-all] rebuilding deployment attestation"
npm run build:deployment-attestation >/dev/null

echo "[verify-all] rebuilding runtime attestation"
npm run build:runtime-attestation >/dev/null

echo "[verify-all] rebuilding go-live attestation"
npm run build:go-live-attestation >/dev/null

echo "[verify-all] rebuilding cryptographic manifest"
npm run build:cryptographic-manifest >/dev/null

echo "[verify-all] rebuilding audit packet"
npm run build:audit-packet >/dev/null

echo "[verify-all] rebuilding review attestation"
npm run build:review-attestation >/dev/null

echo "[verify-all] rebuilding mainnet readiness report"
npm run build:mainnet-readiness-report >/dev/null

echo "[verify-all] checking generated artifacts"
npm run verify:generated-artifacts >/dev/null

echo "[verify-all] checking cryptographic integrity"
npm run verify:cryptographic-manifest >/dev/null

echo "[verify-all] checking release manifest"
npm run verify:release-manifest >/dev/null

echo "[verify-all] checking mainnet readiness report"
npm run verify:mainnet-readiness-report >/dev/null

echo "[verify-all] checking deployment attestation"
npm run verify:deployment-attestation >/dev/null

echo "[verify-all] checking runtime attestation"
npm run verify:runtime-attestation >/dev/null

echo "[verify-all] checking go-live attestation"
npm run verify:go-live-attestation >/dev/null

echo "[verify-all] checking review links"
npm run verify:review-links >/dev/null

echo "[verify-all] checking ops surface"
npm run verify:ops-surface >/dev/null

echo "[verify-all] checking reviewer surface"
npm run verify:review-surface >/dev/null

echo "[verify-all] PASS"
