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

echo "[strategy-surface] verifying strategy package"

placeholder_pattern="REPLACE_""WITH|REPLACE_""ME|TO""DO|T""BD|coming s""oon|not imp""lemented"

required_files=(
  "docs/ranger-strategy-documentation.md"
  "docs/strategy-blueprint.md"
  "docs/strategy-adaptor-interface.md"
  "docs/strategy-operations.md"
  "docs/risk-policy.md"
  "docs/performance-evidence.md"
  "docs/submission-dossier.md"
  "docs/ranger-strategy-config.devnet.json"
  "docs/ranger-submission-bundle.generated.md"
)

for file in "${required_files[@]}"; do
  test -f "$file" || {
    echo "[strategy-surface] missing required file: $file" >&2
    exit 1
  }
done

if search_placeholders "$placeholder_pattern" \
  docs/ranger-strategy-documentation.md \
  docs/strategy-blueprint.md \
  docs/strategy-adaptor-interface.md \
  docs/strategy-operations.md \
  docs/risk-policy.md \
  docs/performance-evidence.md \
  docs/submission-dossier.md \
  docs/ranger-submission-bundle.generated.md; then
  echo "[strategy-surface] placeholder text detected in strategy docs" >&2
  exit 1
fi

echo "[strategy-surface] PASS"
