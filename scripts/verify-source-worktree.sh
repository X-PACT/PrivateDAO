#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

forbidden_regex='^(404\.html|CNAME|__next\.|_next/|_not-found/|analytics/|assistant/|awards/|command-center/|community/|dashboard/|developers/|diagnostics/|documents/|network/|products/|proof/|search/|security/|services/|start/|story/|tracks/|treasury/|viewer/|dist/|docs/index\.html|docs/assets/weekly-live-captures/|docs/assets/weekly-updates-live/|docs/assets/weekly-youtube-ready/|docs/assets/weekly-updates/private-dao-week-1-update\.mp4|docs/assets/weekly-updates/week-1-scene-[1-5]\.png)'

unstaged_paths="$(git -C "$REPO_ROOT" diff --name-only)"
staged_paths="$(git -C "$REPO_ROOT" diff --cached --name-only)"
untracked_paths="$(git -C "$REPO_ROOT" ls-files --others --exclude-standard)"

candidate_paths="$(printf '%s\n%s\n%s\n' "$unstaged_paths" "$staged_paths" "$untracked_paths" | sed '/^$/d' | sort -u)"

if [[ -z "$candidate_paths" ]]; then
  echo "source worktree preflight: no source hygiene issues"
  exit 0
fi

forbidden_paths="$(printf '%s\n' "$candidate_paths" | grep -E "$forbidden_regex" || true)"

if [[ -n "$forbidden_paths" ]]; then
  forbidden_count="$(printf '%s\n' "$forbidden_paths" | wc -l | tr -d ' ')"
  echo "source worktree preflight: mirror/export churn detected"
  printf 'mirror/export paths: %s\n' "$forbidden_count"
  printf '%s\n' "$forbidden_paths" | sed -n '1,25p'
  if [[ "$forbidden_count" -gt 25 ]]; then
    printf '... truncated %s additional path(s)\n' "$((forbidden_count - 25))"
  fi
  if [[ "${PRIVATE_DAO_STRICT_WORKTREE_PREFLIGHT:-0}" == "1" ]]; then
    exit 1
  fi
  echo "source worktree preflight: warning only (set PRIVATE_DAO_STRICT_WORKTREE_PREFLIGHT=1 to hard fail)"
  exit 0
fi

echo "source worktree preflight: worktree is source-safe"
