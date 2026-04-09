#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-github}"
REPO_ROOT="/home/x-pact/PrivateDAO"
WEB_DIR="$REPO_ROOT/apps/web"
DIST_DIR="$REPO_ROOT/dist"
TARGET_DIR="$DIST_DIR/web-mirror-$MODE"
ARCHIVE_PATH="$DIST_DIR/web-mirror-$MODE.tar.gz"

mkdir -p "$DIST_DIR"
rm -rf "$TARGET_DIR" "$ARCHIVE_PATH"

case "$MODE" in
  github)
    (cd "$WEB_DIR" && npm run build:github)
    ;;
  root)
    (cd "$WEB_DIR" && npm run build:root)
    ;;
  *)
    echo "Unsupported mode: $MODE" >&2
    echo "Usage: bash scripts/build-web-mirror-bundle.sh [github|root]" >&2
    exit 1
    ;;
esac

cp -R "$WEB_DIR/out" "$TARGET_DIR"
tar -czf "$ARCHIVE_PATH" -C "$DIST_DIR" "web-mirror-$MODE"

echo "Built mirror bundle:"
echo "  Directory: $TARGET_DIR"
echo "  Archive:   $ARCHIVE_PATH"
