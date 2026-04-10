#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-github}"
REPO_ROOT="/home/x-pact/PrivateDAO"

required_routes=(
  "index.html"
  "404.html"
  "_next"
  "command-center/index.html"
  "dashboard/index.html"
  "proof/index.html"
  "documents/index.html"
  "documents/reviewer-fast-path/index.html"
  "documents/audit-packet/index.html"
  "documents/live-proof-v3/index.html"
  "security/index.html"
  "diagnostics/index.html"
  "analytics/index.html"
  "services/index.html"
  "awards/index.html"
  "viewer/index.html"
  "viewer/reviewer-fast-path/index.html"
  "viewer/service-catalog/index.html"
  "viewer/mainnet-blockers/index.html"
  ".nojekyll"
)

for route in "${required_routes[@]}"; do
  if [[ ! -e "$REPO_ROOT/$route" ]]; then
    echo "Missing live surface entry: $REPO_ROOT/$route" >&2
    exit 1
  fi
done

if grep -q "window.location.replace(target)" "$REPO_ROOT/index.html"; then
  echo "Root index.html still contains the old docs redirect" >&2
  exit 1
fi

case "$MODE" in
  github)
    grep -q '"/PrivateDAO/_next/' "$REPO_ROOT/index.html" || {
      echo "Root index.html is not using the GitHub Pages base path" >&2
      exit 1
    }
    ;;
  root)
    grep -q '"/_next/' "$REPO_ROOT/index.html" || {
      echo "Root index.html is not using the root-domain asset path" >&2
      exit 1
    }
    ;;
  *)
    echo "Unsupported mode: $MODE" >&2
    exit 1
    ;;
esac

echo "Verified live surface at repo root for mode: $MODE"
