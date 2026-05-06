#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PATH="$REPO_ROOT/docs/release-tranche-plan.generated.md"

source_paths="$(git -C "$REPO_ROOT" diff --name-only -- \
  .github \
  apps \
  docs \
  frontend \
  migrations \
  programs \
  scripts \
  sdk \
  tests \
  README.md \
  Anchor.toml \
  Cargo.toml \
  Cargo.lock \
  package.json \
  package-lock.json \
  tsconfig.json | sed '/^$/d')"

classify() {
  local path="$1"
  case "$path" in
    apps/web/*)
      printf 'web-runtime\n'
      ;;
    scripts/*|README.md|package.json|package-lock.json)
      printf 'ops-and-verification\n'
      ;;
    programs/*|tests/*|Cargo.lock|Cargo.toml|Anchor.toml)
      printf 'protocol-and-tests\n'
      ;;
    docs/*)
      printf 'docs-and-evidence\n'
      ;;
    *)
      printf 'other\n'
      ;;
  esac
}

count_for() {
  local key="$1"
  printf '%s\n' "$source_paths" | while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ "$(classify "$path")" == "$key" ]]; then
      printf '%s\n' "$path"
    fi
  done | sed '/^$/d' | wc -l | tr -d ' '
}

sample_for() {
  local key="$1"
  printf '%s\n' "$source_paths" | while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ "$(classify "$path")" == "$key" ]]; then
      printf -- '- `%s`\n' "$path"
    fi
  done | sed -n '1,20p'
}

web_count="$(count_for web-runtime)"
ops_count="$(count_for ops-and-verification)"
protocol_count="$(count_for protocol-and-tests)"
docs_count="$(count_for docs-and-evidence)"
other_count="$(count_for other)"

cat > "$OUTPUT_PATH" <<EOF
# Release Tranche Plan
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Tranche Order

1. Web runtime
2. Ops and verification
3. Protocol and tests
4. Docs and evidence

## Counts

- Web runtime: \`$web_count\`
- Ops and verification: \`$ops_count\`
- Protocol and tests: \`$protocol_count\`
- Docs and evidence: \`$docs_count\`
- Other: \`$other_count\`

## Tranche 1: Web Runtime

These files directly affect the user-visible product surface, wallet UX, guided flow, proof routing, and live/dashboard interpretation.

$(sample_for web-runtime)

## Tranche 2: Ops and Verification

These files affect triage, release reporting, runtime capture, and verification automation.

$(sample_for ops-and-verification)

## Tranche 3: Protocol and Tests

These files affect protocol-adjacent validation or test coverage and should be reviewed after the web release surface is intentional.

$(sample_for protocol-and-tests)

## Tranche 4: Docs and Evidence

These files package truth, generated proof, or reviewer-facing material and should follow the source tranches instead of leading them.

$(sample_for docs-and-evidence)

## Current Rule

- Close tranche 1 before claiming product-surface release readiness.
- Close tranche 2 before claiming operator or reviewer-grade release readiness.
- Close tranche 3 before claiming stronger engineering closure.
- Close tranche 4 last so published evidence matches the final source state.
EOF

printf 'wrote %s\n' "$OUTPUT_PATH"
