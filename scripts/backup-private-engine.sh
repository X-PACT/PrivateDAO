#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="${PRIVATEDAO_DATA_DIR:-$ROOT_DIR/services/private-engine/data}"
OUTPUT="${1:-$ROOT_DIR/backups/private-engine-$(date -u +%Y%m%dT%H%M%SZ).tar.gz}"
mkdir -p "$(dirname "$OUTPUT")"
test -d "$DATA_DIR" || { echo "Data directory does not exist: $DATA_DIR" >&2; exit 1; }
tar --exclude='*.tmp' --exclude='*.lock' -czf "$OUTPUT" -C "$DATA_DIR" .
chmod 600 "$OUTPUT"
echo "Backup written: $OUTPUT"
