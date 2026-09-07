#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PATH="$REPO_ROOT/docs/web-release-tranche-report.generated.md"

readarray -t web_paths < <(git -C "$REPO_ROOT" diff --name-only -- apps/web | sed '/^$/d' | sort -u)
readarray -t non_web_paths < <(bash "$REPO_ROOT/scripts/status-source-tree.sh" | sed -n '/^[ MARCUD?!][ MARCUD?!] /p' | sed 's/^...//' | grep -v '^apps/web/' | sort -u)

ready_paths=(
  "apps/web/src/app/android/page.tsx"
  "apps/web/src/app/awards/page.tsx"
  "apps/web/src/app/dashboard/page.tsx"
  "apps/web/src/app/engage/page.tsx"
  "apps/web/src/app/govern/page.tsx"
  "apps/web/src/app/intelligence/page.tsx"
  "apps/web/src/app/judge/page.tsx"
  "apps/web/src/app/learn/page.tsx"
  "apps/web/src/app/products/page.tsx"
  "apps/web/src/app/proof/page.tsx"
  "apps/web/src/app/services/page.tsx"
  "apps/web/src/components/action-review-modal.tsx"
  "apps/web/src/components/competition-workspace.tsx"
  "apps/web/src/components/execution-spine-surface.tsx"
  "apps/web/src/components/governance-action-workbench.tsx"
  "apps/web/src/components/guided-operation-rail.tsx"
  "apps/web/src/components/home-shell.tsx"
  "apps/web/src/components/judge-runtime-logs-panel.tsx"
  "apps/web/src/components/normal-user-operation-path.tsx"
  "apps/web/src/components/operating-journey-strip.tsx"
  "apps/web/src/components/operations-shell.tsx"
  "apps/web/src/components/service-operational-cards.tsx"
  "apps/web/src/components/site-header.tsx"
  "apps/web/src/components/track-alignment-panel.tsx"
  "apps/web/src/components/track-narrative-panel.tsx"
  "apps/web/src/components/wallet-connect-button.tsx"
  "apps/web/src/lib/judge-runtime-logs.ts"
)

contains_ready() {
  local target="$1"
  local entry
  for entry in "${ready_paths[@]}"; do
    if [[ "$entry" == "$target" ]]; then
      return 0
    fi
  done
  return 1
}

ready_changed=()
remaining_changed=()

for path in "${web_paths[@]}"; do
  if contains_ready "$path"; then
    ready_changed+=("$path")
  else
    remaining_changed+=("$path")
  fi
done

print_list() {
  local limit="$1"
  shift
  local count=0
  local item
  for item in "$@"; do
    [[ -z "$item" ]] && continue
    printf -- '- `%s`\n' "$item"
    count=$((count + 1))
    if [[ "$count" -ge "$limit" ]]; then
      break
    fi
  done
}

cat > "$OUTPUT_PATH" <<EOF
# Web Release Tranche Report
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Summary

- Changed web paths: \`${#web_paths[@]}\`
- Verified web tranche paths: \`${#ready_changed[@]}\`
- Remaining web paths outside verified tranche: \`${#remaining_changed[@]}\`
- Non-web source churn paths: \`${#non_web_paths[@]}\`

## Verified Web Tranche

These paths belong to the wallet/signing, core route, proof, and shared-surface tranche that has already been manually aligned and partially verified.

$(print_list 80 "${ready_changed[@]}")

## Remaining Web Surface

These changed web paths still sit outside the currently verified tranche and should be the next review/type/lint closure target.

$(print_list 80 "${remaining_changed[@]}")

## Non-Web Source Churn

These paths are outside \`apps/web\` and should not block the release reading of the verified web tranche, but they still block a full repo-wide release claim.

$(print_list 80 "${non_web_paths[@]}")

## Closure Rule

- Treat the verified web tranche as the current product-ready surface under active closure.
- Close remaining \`apps/web\` paths before broadening claims about release packaging.
- Keep non-web source churn separated from web-surface truth until it is intentionally reviewed.
EOF

printf 'wrote %s\n' "$OUTPUT_PATH"
