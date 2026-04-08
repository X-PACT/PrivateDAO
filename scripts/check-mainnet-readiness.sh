#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[mainnet] PrivateDAO readiness gate"

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "[mainnet] missing required tool: $1" >&2
    exit 1
  }
}

retry_cmd() {
  local attempts="$1"
  local delay="$2"
  shift 2

  local attempt=1
  while true; do
    if "$@"; then
      return 0
    fi

    if [[ "$attempt" -ge "$attempts" ]]; then
      echo "[mainnet] command failed after $attempts attempts: $*" >&2
      return 1
    fi

    echo "[mainnet] retrying command after transient failure ($attempt/$attempts): $*" >&2
    sleep "$delay"
    attempt=$((attempt + 1))
  done
}

need_cmd anchor
need_cmd cargo
need_cmd npm

echo "[mainnet] checking repository hygiene"
git diff --check

echo "[mainnet] building program"
anchor build >/dev/null

echo "[mainnet] running Rust unit tests"
cargo test -p private-dao --lib -- --nocapture >/dev/null

echo "[mainnet] validating Ranger submission package"
npm run validate:ranger-strategy -- docs/ranger-strategy-config.devnet.json >/dev/null

echo "[mainnet] generating Ranger submission bundle"
npm run build:ranger-submission -- docs/ranger-strategy-config.devnet.json docs/ranger-submission-bundle.generated.md >/dev/null

echo "[mainnet] verifying live proof and review surface"
npm run verify:live-proof >/dev/null
npm run verify:release-manifest >/dev/null
npm run verify:program-id-consistency >/dev/null
npm run verify:pdao-surface >/dev/null
npm run build:deployment-attestation >/dev/null
npm run verify:deployment-attestation >/dev/null
npm run build:runtime-attestation >/dev/null
npm run verify:runtime-attestation >/dev/null
npm run verify:runtime-surface >/dev/null
npm run build:go-live-attestation >/dev/null
npm run verify:go-live-attestation >/dev/null
npm run build:pdao-attestation >/dev/null
npm run verify:pdao-attestation >/dev/null
npm run build:cryptographic-manifest >/dev/null
npm run verify:cryptographic-manifest >/dev/null
npm run build:review-attestation >/dev/null
npm run build:mainnet-readiness-report >/dev/null
npm run verify:launch-ops >/dev/null
npm run verify:monitoring-alerts >/dev/null
npm run verify:mainnet-blockers >/dev/null
npm run verify:mainnet-readiness-report >/dev/null
retry_cmd 3 5 npm run verify:pdao-live >/dev/null
npm run verify:review-links >/dev/null
npm run verify:ops-surface >/dev/null
npm run verify:review-surface >/dev/null

echo "[mainnet] required docs"
test -f README.md
test -f docs/live-proof.md
test -f docs/mainnet-readiness.md
test -f docs/mainnet-readiness.generated.md
test -f docs/mainnet-blockers.json
test -f docs/mainnet-blockers.md
test -f docs/launch-ops-checklist.json
test -f docs/launch-ops-checklist.md
test -f docs/monitoring-alert-rules.json
test -f docs/monitoring-alert-rules.md
test -f docs/authority-transfer-runbook.md
test -f docs/wallet-e2e-test-plan.md
test -f docs/deployment-attestation.generated.json
test -f docs/go-live-criteria.md
test -f docs/operational-drillbook.md
test -f docs/runtime-attestation.generated.json
test -f docs/go-live-attestation.generated.json
test -f docs/pdao-attestation.generated.json
test -f docs/assets/pdao-token.json
test -f docs/judge-technical-audit.md

echo "[mainnet] PASS"
