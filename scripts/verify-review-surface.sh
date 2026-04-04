#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

search_placeholders() {
  local pattern="$1"
  shift
  if command -v rg >/dev/null 2>&1; then
    rg -n "$pattern" "$@"
  else
    grep -nE "$pattern" "$@"
  fi
}

echo "[review-surface] verifying reviewer-facing evidence"

placeholder_pattern="REPLACE_""WITH|REPLACE_""ME|TO""DO|T""BD|coming s""oon|not imp""lemented"

required_files=(
  "README.md"
  "docs/security-review.md"
  "docs/threat-model.md"
  "docs/security-coverage-map.md"
  "docs/failure-modes.md"
  "docs/replay-analysis.md"
  "docs/protocol-spec.md"
  "docs/independent-verification.md"
  "docs/attack-simulation-log.md"
  "docs/token.md"
  "docs/pdao-token.md"
  "docs/pdao-attestation.generated.json"
  "docs/assets/pdao-token.json"
  "docs/fair-voting.md"
  "docs/wallet-runtime.md"
  "docs/zk-upgrade.md"
  "docs/zk-threat-extension.md"
  "docs/zk-assumption-matrix.md"
  "docs/zk-capability-matrix.md"
  "docs/zk-provenance.md"
  "docs/zk-verification-flow.md"
  "docs/zk-stack.md"
  "docs/zk-registry.generated.json"
  "docs/zk-transcript.generated.md"
  "docs/zk-attestation.generated.json"
  "docs/zk-architecture.md"
  "docs/zk-evidence.md"
  "docs/reviewer-fast-path.md"
  "docs/live-proof.md"
  "docs/devnet-resilience-report.md"
  "docs/devnet-release-manifest.md"
  "docs/proof-registry.json"
  "docs/verification-gates.md"
  "docs/mainnet-readiness.md"
  "docs/ranger-strategy-documentation.md"
  "docs/strategy-blueprint.md"
  "docs/strategy-adaptor-interface.md"
  "docs/performance-evidence.md"
  "docs/submission-dossier.md"
  "docs/submission-registry.json"
  "docs/competition-readiness.md"
  "docs/audit-packet.generated.md"
  "docs/review-attestation.generated.json"
  "docs/cryptographic-integrity.md"
  "docs/cryptographic-manifest.generated.json"
  "docs/mainnet-readiness.generated.md"
  "docs/deployment-attestation.generated.json"
  "docs/go-live-criteria.md"
  "docs/operational-drillbook.md"
  "docs/runtime-attestation.generated.json"
  "docs/go-live-attestation.generated.json"
  "docs/ranger-submission-bundle.generated.md"
  "docs/ranger-strategy-config.devnet.json"
  "docs/strategy-operations.md"
  "docs/production-operations.md"
  "docs/monitoring-alerts.md"
  "docs/incident-response.md"
  "docs/mainnet-cutover-runbook.md"
  "docs/operator-checklist.md"
  "docs/risk-register.md"
  "docs/audit-handoff.md"
)

for file in "${required_files[@]}"; do
  test -f "$file" || {
    echo "[review-surface] missing required file: $file" >&2
    exit 1
  }
done

echo "[review-surface] checking for reviewer-facing placeholder strings"
if search_placeholders "$placeholder_pattern" \
  README.md \
  docs/security-review.md \
  docs/threat-model.md \
  docs/security-coverage-map.md \
  docs/failure-modes.md \
  docs/replay-analysis.md \
  docs/zk-upgrade.md \
  docs/zk-threat-extension.md \
  docs/zk-assumption-matrix.md \
  docs/zk-capability-matrix.md \
  docs/zk-provenance.md \
  docs/zk-verification-flow.md \
  docs/zk-stack.md \
  docs/zk-transcript.generated.md \
  docs/zk-architecture.md \
  docs/zk-evidence.md \
  docs/cryptographic-integrity.md \
  docs/protocol-spec.md \
  docs/independent-verification.md \
  docs/attack-simulation-log.md \
  docs/token.md \
  docs/pdao-token.md \
  docs/fair-voting.md \
  docs/wallet-runtime.md \
  docs/go-live-criteria.md \
  docs/operational-drillbook.md \
  docs/live-proof.md \
  docs/devnet-resilience-report.md \
  docs/mainnet-readiness.md \
  docs/ranger-strategy-documentation.md \
  docs/ranger-submission-bundle.generated.md \
  docs/strategy-operations.md \
  docs/production-operations.md; then
  echo "[review-surface] reviewer-facing placeholder text detected" >&2
  exit 1
fi

echo "[review-surface] checking real verification address in devnet strategy config"
node -e '
  const fs = require("fs");
  const config = JSON.parse(fs.readFileSync("docs/ranger-strategy-config.devnet.json", "utf8"));
  const addr = config.onChainVerification?.vaultAddress || config.onChainVerification?.walletAddress || "";
  if (!addr || addr.includes("REPLACE")) {
    process.exit(1);
  }
'

echo "[review-surface] checking live-proof consistency"
npx ts-node scripts/verify-live-proof.ts >/dev/null

echo "[review-surface] checking canonical program id consistency"
npx ts-node scripts/verify-program-id-consistency.ts >/dev/null

echo "[review-surface] checking PDAO token surface"
npx ts-node scripts/verify-pdao-token-surface.ts >/dev/null

echo "[review-surface] checking zk doc coherence"
npx ts-node scripts/verify-zk-docs.ts >/dev/null

echo "[review-surface] checking zk public signal consistency"
npx ts-node scripts/verify-zk-consistency.ts >/dev/null

echo "[review-surface] checking zk tamper rejection"
npx ts-node scripts/verify-zk-negative.ts >/dev/null

echo "[review-surface] checking zk registry consistency"
npx ts-node scripts/verify-zk-registry.ts >/dev/null

echo "[review-surface] checking zk transcript consistency"
npx ts-node scripts/verify-zk-transcript.ts >/dev/null

echo "[review-surface] checking zk attestation consistency"
npx ts-node scripts/verify-zk-attestation.ts >/dev/null

echo "[review-surface] checking cryptographic integrity"
npx ts-node scripts/verify-cryptographic-manifest.ts >/dev/null

echo "[review-surface] checking release manifest consistency"
npx ts-node scripts/verify-release-manifest.ts >/dev/null

echo "[review-surface] checking mainnet readiness report"
npx ts-node scripts/verify-mainnet-readiness-report.ts >/dev/null

echo "[review-surface] checking deployment attestation"
npx ts-node scripts/verify-deployment-attestation.ts >/dev/null

echo "[review-surface] checking runtime attestation"
npx ts-node scripts/verify-runtime-attestation.ts >/dev/null

echo "[review-surface] checking PDAO attestation"
npx ts-node scripts/verify-pdao-attestation.ts >/dev/null

echo "[review-surface] checking devnet resilience report"
npx ts-node scripts/verify-devnet-resilience-report.ts >/dev/null

echo "[review-surface] checking runtime surface"
npx ts-node scripts/verify-runtime-surface.ts >/dev/null

echo "[review-surface] checking go-live attestation"
npx ts-node scripts/verify-go-live-attestation.ts >/dev/null

echo "[review-surface] checking review-link consistency"
npx ts-node scripts/verify-review-links.ts >/dev/null

echo "[review-surface] PASS"
