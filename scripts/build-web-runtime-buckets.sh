#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PATH="$REPO_ROOT/docs/web-runtime-buckets.generated.md"

web_paths="$(git -C "$REPO_ROOT" diff --name-only -- apps/web | sed '/^$/d')"

bucket_for() {
  local path="$1"
  case "$path" in
    apps/web/src/components/wallet-*|apps/web/src/components/action-review-modal.tsx|apps/web/src/components/governance-action-workbench.tsx|apps/web/src/components/guided-operation-rail.tsx)
      printf 'wallet-and-signing\n'
      ;;
    apps/web/src/app/govern/*|apps/web/src/app/execute/*|apps/web/src/app/proof/*|apps/web/src/app/dashboard/*|apps/web/src/app/android/*|apps/web/src/app/judge/*)
      printf 'primary-routes\n'
      ;;
    apps/web/src/components/operating-journey-strip.tsx|apps/web/src/components/judge-runtime-logs-panel.tsx|apps/web/src/lib/judge-runtime-logs.ts)
      printf 'evidence-and-status\n'
      ;;
    apps/web/src/app/*|apps/web/src/components/*|apps/web/src/lib/*)
      printf 'supporting-surface\n'
      ;;
    apps/web/package.json|apps/web/package-lock.json|apps/web/next.config.ts)
      printf 'web-tooling\n'
      ;;
    *)
      printf 'other\n'
      ;;
  esac
}

count_bucket() {
  local key="$1"
  printf '%s\n' "$web_paths" | while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ "$(bucket_for "$path")" == "$key" ]]; then
      printf '%s\n' "$path"
    fi
  done | sed '/^$/d' | wc -l | tr -d ' '
}

sample_bucket() {
  local key="$1"
  printf '%s\n' "$web_paths" | while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if [[ "$(bucket_for "$path")" == "$key" ]]; then
      printf -- '- `%s`\n' "$path"
    fi
  done | sed -n '1,20p'
}

wallet_count="$(count_bucket wallet-and-signing)"
routes_count="$(count_bucket primary-routes)"
evidence_count="$(count_bucket evidence-and-status)"
supporting_count="$(count_bucket supporting-surface)"
tooling_count="$(count_bucket web-tooling)"
other_count="$(count_bucket other)"

cat > "$OUTPUT_PATH" <<EOF
# Web Runtime Buckets
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Counts

- Wallet and signing: \`$wallet_count\`
- Primary routes: \`$routes_count\`
- Evidence and status: \`$evidence_count\`
- Supporting surface: \`$supporting_count\`
- Web tooling: \`$tooling_count\`
- Other: \`$other_count\`

## Wallet and Signing

$(sample_bucket wallet-and-signing)

## Primary Routes

$(sample_bucket primary-routes)

## Evidence and Status

$(sample_bucket evidence-and-status)

## Supporting Surface

$(sample_bucket supporting-surface)

## Web Tooling

$(sample_bucket web-tooling)

## Closure Rule

- Close wallet/signing and primary routes first.
- Then close evidence/status interpretation.
- Then close supporting surface copy and routing consistency.
- Leave tooling/package drift for the end of tranche 1 unless it blocks runtime.
EOF

printf 'wrote %s\n' "$OUTPUT_PATH"
