#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-github}"
REPO_ROOT="/home/x-pact/PrivateDAO"
TARGET_DIR="$REPO_ROOT/dist/web-mirror-$MODE"

case "$MODE" in
  github|root)
    ;;
  *)
    echo "Unsupported mode: $MODE" >&2
    echo "Usage: bash scripts/publish-web-live-surface.sh [github|root]" >&2
    exit 1
    ;;
esac

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "Missing mirror bundle at $TARGET_DIR. Building it first."
  npm --prefix "$REPO_ROOT" run "web:bundle:$MODE"
fi

protected_entries=(
  ".git"
  ".github"
  "apps"
  "docs"
  "scripts"
  "programs"
  "tests"
  "sdk"
  "migrations"
  "frontend"
  "target"
  "node_modules"
  "dist"
)

mapfile -t exported_entries < <(find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -printf '%f\n' | sort)

for entry in "${exported_entries[@]}"; do
  for protected in "${protected_entries[@]}"; do
    if [[ "$entry" == "$protected" ]]; then
      echo "Refusing to publish unexpected protected entry: $entry" >&2
      exit 1
    fi
  done
done

for entry in "${exported_entries[@]}"; do
  rm -rf "$REPO_ROOT/$entry"
done

cp -R "$TARGET_DIR"/. "$REPO_ROOT"/
touch "$REPO_ROOT/.nojekyll"

echo "Published web live surface from $TARGET_DIR into $REPO_ROOT"
