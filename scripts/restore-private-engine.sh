#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE="${1:-}"
DATA_DIR="${PRIVATEDAO_DATA_DIR:-$ROOT_DIR/services/private-engine/data}"
[[ -n "$ARCHIVE" && -f "$ARCHIVE" ]] || { echo "Usage: $0 backup.tar.gz" >&2; exit 1; }
mkdir -p "$DATA_DIR"
tar -xzf "$ARCHIVE" -C "$DATA_DIR"
echo "Backup restored to: $DATA_DIR"
