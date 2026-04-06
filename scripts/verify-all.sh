#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

run_with_retry() {
  local attempts="$1"
  shift
  local try=1
  while true; do
    if "$@"; then
      return 0
    fi
    if [[ "$try" -ge "$attempts" ]]; then
      return 1
    fi
    echo "[verify-all] retry ${try}/${attempts} failed for: $*" >&2
    try=$((try + 1))
    sleep 2
  done
}

echo "[verify-all] validating Ranger strategy package"
npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json >/dev/null

echo "[verify-all] checking live proof"
npm run verify:live-proof >/dev/null

echo "[verify-all] checking strategy surface"
npm run verify:strategy-surface >/dev/null

echo "[verify-all] rebuilding zk registry"
npm run build:zk-registry >/dev/null

echo "[verify-all] rebuilding zk transcript"
npm run build:zk-transcript >/dev/null

echo "[verify-all] rebuilding zk attestation"
npm run build:zk-attestation >/dev/null

echo "[verify-all] checking frontend surface"
npm run verify:frontend-surface >/dev/null

echo "[verify-all] checking program id consistency"
npm run verify:program-id-consistency >/dev/null

echo "[verify-all] checking PDAO token surface"
npm run verify:pdao-surface >/dev/null

echo "[verify-all] rebuilding reviewer artifacts"
npm run build:devnet:review-artifacts >/dev/null

echo "[verify-all] checking submission registry"
npm run verify:submission-registry >/dev/null

echo "[verify-all] checking registry consistency"
npm run verify:registry-consistency >/dev/null

echo "[verify-all] checking generated artifacts"
npm run verify:generated-artifacts >/dev/null

echo "[verify-all] checking supply-chain attestation"
npm run verify:supply-chain-attestation >/dev/null

echo "[verify-all] checking release ceremony attestation"
npm run verify:release-ceremony-attestation >/dev/null

echo "[verify-all] checking release drill evidence"
npm run verify:release-drill >/dev/null

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

echo "[verify-all] checking read node"
npm run verify:read-node >/dev/null

echo "[verify-all] checking read node http surface"
run_with_retry 3 npm run verify:read-node:http >/dev/null

echo "[verify-all] checking read-node snapshot"
npm run verify:read-node-snapshot >/dev/null

echo "[verify-all] checking read-node ops snapshot"
npm run verify:read-node-ops >/dev/null

echo "[verify-all] checking Colosseum competitive analysis"
npm run verify:colosseum-competitive >/dev/null

echo "[verify-all] checking real-device runtime intake"
npm run verify:real-device-runtime >/dev/null

echo "[verify-all] checking runtime evidence"
npm run verify:runtime-evidence >/dev/null

echo "[verify-all] checking operational evidence"
npm run verify:operational-evidence >/dev/null

echo "[verify-all] checking runtime surface"
npm run verify:runtime-surface >/dev/null

echo "[verify-all] checking wallet compatibility matrix"
npm run verify:wallet-matrix >/dev/null

echo "[verify-all] checking devnet canary"
npm run verify:devnet-canary >/dev/null

echo "[verify-all] checking PDAO attestation"
npm run verify:pdao-attestation >/dev/null

echo "[verify-all] checking go-live attestation"
npm run verify:go-live-attestation >/dev/null

echo "[verify-all] checking review links"
npm run verify:review-links >/dev/null

echo "[verify-all] checking weekly update videos"
npm run verify:weekly-updates >/dev/null

echo "[verify-all] checking ops surface"
npm run verify:ops-surface >/dev/null

echo "[verify-all] checking reviewer surface"
VERIFY_REVIEW_SURFACE_MODE=fast npm run verify:review-surface >/dev/null

echo "[verify-all] PASS"
