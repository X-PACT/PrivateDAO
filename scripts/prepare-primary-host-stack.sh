#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
STACK_DIR="$REPO_ROOT/deploy/primary-host"
SITE_DIR="$STACK_DIR/volumes/site"
TARGET_IDL_DIR="$STACK_DIR/target/idl"
IDL_SOURCE="$REPO_ROOT/target/idl/private_dao.json"

if [[ ! -f "$IDL_SOURCE" ]]; then
  echo "Missing $IDL_SOURCE. Run an Anchor build first so the read-node can decode accounts." >&2
  exit 1
fi

if [[ "${PRIVATE_DAO_SKIP_SOURCE_PREFLIGHT:-0}" != "1" ]]; then
  bash "$SCRIPT_DIR/verify-source-worktree.sh"
fi

mkdir -p "$STACK_DIR/volumes" "$TARGET_IDL_DIR"

if [[ ! -f "$STACK_DIR/.env" ]]; then
  cp "$STACK_DIR/.env.example" "$STACK_DIR/.env"
fi

(cd "$REPO_ROOT" && npm run web:bundle:root)

rm -rf "$SITE_DIR"
mkdir -p "$SITE_DIR"
cp -R "$REPO_ROOT/dist/web-mirror-root/." "$SITE_DIR/"
cp "$IDL_SOURCE" "$TARGET_IDL_DIR/private_dao.json"

echo "Prepared primary-host stack inputs:"
echo "  Site bundle: $SITE_DIR"
echo "  IDL:         $TARGET_IDL_DIR/private_dao.json"
echo "  Env file:    $STACK_DIR/.env"
