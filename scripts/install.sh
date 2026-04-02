#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

green "PrivateDAO bootstrap"
printf '\n'

MISSING=()
for cmd in git curl node npm cargo solana anchor; do
  if ! need_cmd "$cmd"; then
    MISSING+=("$cmd")
  fi
done

if [ "${#MISSING[@]}" -gt 0 ]; then
  yellow "Missing required tools:"
  for cmd in "${MISSING[@]}"; do
    printf '  - %s\n' "$cmd"
  done
  printf '\n'
  red "Install the missing tools first, then rerun this script."
  exit 1
fi

if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp ".env.example" ".env"
  green "Created .env from .env.example"
fi

if [ -f "package-lock.json" ]; then
  npm install
else
  npm install
fi

printf '\n'
green "Bootstrap complete"
printf 'Next steps:\n'
printf '  1. Review .env\n'
printf '  2. Run npm run demo\n'
printf '  3. Run anchor build\n'
printf '  4. Use the repo scripts for create proposal, commit, reveal, finalize, and execute\n'
