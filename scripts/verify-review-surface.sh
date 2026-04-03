#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[review-surface] verifying reviewer-facing evidence"

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
  "docs/zk-upgrade.md"
  "docs/zk-architecture.md"
  "docs/zk-evidence.md"
  "docs/reviewer-fast-path.md"
  "docs/live-proof.md"
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
if rg -n "REPLACE_WITH|REPLACE_ME|TODO|TBD|coming soon|not implemented" \
  README.md \
  docs/security-review.md \
  docs/threat-model.md \
  docs/security-coverage-map.md \
  docs/failure-modes.md \
  docs/replay-analysis.md \
  docs/zk-upgrade.md \
  docs/zk-architecture.md \
  docs/zk-evidence.md \
  docs/protocol-spec.md \
  docs/independent-verification.md \
  docs/attack-simulation-log.md \
  docs/live-proof.md \
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

echo "[review-surface] checking zk surface consistency"
bash scripts/verify-zk-surface.sh >/dev/null

echo "[review-surface] checking release manifest consistency"
npx ts-node scripts/verify-release-manifest.ts >/dev/null

echo "[review-surface] checking review-link consistency"
npx ts-node scripts/verify-review-links.ts >/dev/null

echo "[review-surface] PASS"
