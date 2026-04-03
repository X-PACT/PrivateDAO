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

echo "[ops-surface] verifying production and audit surfaces"

required_files=(
  "docs/mainnet-readiness.md"
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
    echo "[ops-surface] missing required file: $file" >&2
    exit 1
  }
done

if search_placeholders "REPLACE_WITH|REPLACE_ME|TODO|TBD|coming soon|not implemented" \
  docs/mainnet-readiness.md \
  docs/production-operations.md \
  docs/monitoring-alerts.md \
  docs/incident-response.md \
  docs/mainnet-cutover-runbook.md \
  docs/operator-checklist.md \
  docs/risk-register.md \
  docs/audit-handoff.md; then
  echo "[ops-surface] placeholder text detected in ops docs" >&2
  exit 1
fi

echo "[ops-surface] PASS"
