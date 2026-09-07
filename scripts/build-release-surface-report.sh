#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PATH="$REPO_ROOT/docs/release-surface-report.generated.md"

triage_output="$(bash "$SCRIPT_DIR/worktree-triage-report.sh")"

source_changes="$(printf '%s\n' "$triage_output" | awk -F': ' '/source changes/ {print $2}' | head -n1)"
docs_changes="$(printf '%s\n' "$triage_output" | awk -F': ' '/docs changes/ {print $2}' | head -n1)"
generated_changes="$(printf '%s\n' "$triage_output" | awk -F': ' '/generated\/runtime artifacts/ {print $2}' | head -n1)"
head_hash="$(git -C "$REPO_ROOT" rev-parse HEAD)"
origin_hash="$(git -C "$REPO_ROOT" rev-parse origin/main 2>/dev/null || printf 'origin-unavailable')"

cat > "$OUTPUT_PATH" <<EOF
# Release Surface Report
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

## Git State

- HEAD: \`$head_hash\`
- origin/main: \`$origin_hash\`

## Triage Summary

- Source changes: \`$source_changes\`
- Docs changes: \`$docs_changes\`
- Generated/runtime artifacts: \`$generated_changes\`

## Current Rule

- Evaluate release readiness from source changes first.
- Treat generated mirrors, export churn, and runtime artifacts as separate from source closure.
- Do not claim full release packaging until source changes are intentionally reviewed and grouped.

## Next Closure Route

- Primary closure target: \`web runtime\`
- Current tranche reference:
  - [release-tranche-plan.generated.md](/home/x-pact/PrivateDAO/docs/release-tranche-plan.generated.md)
- Practical next move:
  - close the \`apps/web\` surface first
  - then close ops/verification files
  - then reconcile tests/protocol touchpoints
  - only after that refresh docs/evidence

## Current Triage Output

\`\`\`text
$triage_output
\`\`\`
EOF

printf 'wrote %s\n' "$OUTPUT_PATH"
