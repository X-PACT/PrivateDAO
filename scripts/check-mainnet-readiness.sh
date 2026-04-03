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
npm run build:mainnet-readiness-report >/dev/null
npm run verify:mainnet-readiness-report >/dev/null
npm run build:deployment-attestation >/dev/null
npm run verify:deployment-attestation >/dev/null
npm run verify:review-links >/dev/null
npm run verify:ops-surface >/dev/null
npm run verify:review-surface >/dev/null

echo "[mainnet] required docs"
test -f README.md
test -f docs/live-proof.md
test -f docs/mainnet-readiness.md
test -f docs/mainnet-readiness.generated.md
test -f docs/deployment-attestation.generated.json
test -f docs/judge-technical-audit.md

echo "[mainnet] PASS"
