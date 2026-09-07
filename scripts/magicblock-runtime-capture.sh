#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$ROOT_DIR/docs/magicblock/templates"

target="${1:-}"
mode="${2:-}"

if [[ -z "$target" ]]; then
  echo "usage: npm run capture:magicblock-runtime -- <target-id> [--template-only]" >&2
  exit 1
fi

template_path="$TEMPLATE_DIR/${target}.json"

if [[ ! -f "$template_path" ]]; then
  echo "unknown MagicBlock runtime target: $target" >&2
  echo "available targets:" >&2
  ls "$TEMPLATE_DIR"/*.json | xargs -n1 basename >&2
  exit 1
fi

echo "template: $template_path"
if [[ "$mode" == "--template-only" ]]; then
  cat "$template_path"
  exit 0
fi

echo "copy the template, fill it with real runtime values, then run:"
echo "npm run record:magicblock-runtime -- /path/to/filled-capture.json"
