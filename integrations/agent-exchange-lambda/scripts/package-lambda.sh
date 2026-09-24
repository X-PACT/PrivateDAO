#!/usr/bin/env bash
set -euo pipefail

OUTPUT_PATH=${1:-/tmp/privatedao-agent-exchange.zip}
PACKAGE_DIR=$(mktemp -d)
trap 'rm -rf "$PACKAGE_DIR"' EXIT

cp -R src assets package.json package-lock.json "$PACKAGE_DIR/"
test -f "$PACKAGE_DIR/assets/brand/privatedao-official-logo.jpg"
test -f "$PACKAGE_DIR/assets/brand/privatedao-official-banner.jpg"
test -f "$PACKAGE_DIR/assets/ecosystem/ibm-watsonx.svg"
test -f "$PACKAGE_DIR/assets/ecosystem/openvino.svg"
test -f "$PACKAGE_DIR/assets/ecosystem/mongodb.svg"
test -f "$PACKAGE_DIR/assets/ecosystem/github.svg"
test -f "$PACKAGE_DIR/assets/clients/openai-knot.svg"
test -f "$PACKAGE_DIR/assets/clients/claude-symbol.svg"
test -f "$PACKAGE_DIR/assets/clients/grok-symbol.svg"
test -f "$PACKAGE_DIR/assets/clients/openclaw-symbol.png"

(
  cd "$PACKAGE_DIR"
  npm ci --omit=dev --ignore-scripts --no-audit --no-fund
  node --check src/handler.mjs
  zip -qr "$OUTPUT_PATH" src assets package.json package-lock.json node_modules
)

test -s "$OUTPUT_PATH"
echo "Lambda package created: $OUTPUT_PATH"
