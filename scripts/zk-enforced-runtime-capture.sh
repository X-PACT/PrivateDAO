#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_DIR="$ROOT_DIR/docs/zk-enforced-runtime-templates"
TMP_DIR="${TMPDIR:-/tmp}"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/zk-enforced-runtime-capture.sh <target> [--template-only]

Targets:
  phantom-desktop-zk-enforced
  solflare-desktop-zk-enforced
  backpack-desktop-zk-enforced
  glow-desktop-zk-enforced
  android-runtime-zk-enforced

Examples:
  bash scripts/zk-enforced-runtime-capture.sh phantom-desktop-zk-enforced --template-only
EOF
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

TARGET="$1"
shift || true
TEMPLATE_ONLY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template-only) TEMPLATE_ONLY="true"; shift ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 1 ;;
  esac
done

TEMPLATE="$TEMPLATE_DIR/$TARGET.json"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Unknown target template: $TARGET" >&2
  exit 1
fi

OUT="$TMP_DIR/${TARGET}.capture.json"
cp "$TEMPLATE" "$OUT"
echo "Wrote template copy: $OUT"

if [[ "$TEMPLATE_ONLY" == "true" ]]; then
  exit 0
fi

echo "Fill the copied JSON with real Devnet evidence, then run:"
echo "  npm run record:zk-enforced-runtime -- $OUT"
