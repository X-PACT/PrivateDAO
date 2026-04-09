#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-github}"
REPO_ROOT="/home/x-pact/PrivateDAO"
DIST_DIR="$REPO_ROOT/dist"
TARGET_DIR="$DIST_DIR/web-mirror-$MODE"
ARCHIVE_PATH="$DIST_DIR/web-mirror-$MODE.tar.gz"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Missing mirror directory: $TARGET_DIR" >&2
  exit 1
fi

if [[ ! -f "$ARCHIVE_PATH" ]]; then
  echo "Missing mirror archive: $ARCHIVE_PATH" >&2
  exit 1
fi

required_routes=(
  "index.html"
  "command-center/index.html"
  "dashboard/index.html"
  "proof/index.html"
  "security/index.html"
  "diagnostics/index.html"
  "analytics/index.html"
  "services/index.html"
  "awards/index.html"
)

for route in "${required_routes[@]}"; do
  if [[ ! -f "$TARGET_DIR/$route" ]]; then
    echo "Missing exported route: $TARGET_DIR/$route" >&2
    exit 1
  fi
done

if ! tar -tzf "$ARCHIVE_PATH" >/dev/null; then
  echo "Mirror archive is not readable: $ARCHIVE_PATH" >&2
  exit 1
fi

echo "Verified mirror bundle:"
echo "  Mode:      $MODE"
echo "  Directory: $TARGET_DIR"
echo "  Archive:   $ARCHIVE_PATH"
