#!/usr/bin/env bash
set -euo pipefail

<<<<<<< ours
echo "[verify] checking docs config schema"
node -e 'const fs=require("fs"); const c=JSON.parse(fs.readFileSync("docs/config.json","utf8")); if(!c.cluster||!c.rpcUrl||!c.programId) throw new Error("docs/config.json must contain cluster,rpcUrl,programId"); console.log(c);'

echo "[verify] checking required frontend entry files"
test -f docs/index.html
test -f docs/app.js
test -f privatedao-frontend.html

echo "[verify] checking workflow files"
test -f .github/workflows/build.yml
test -f .github/workflows/test.yml
test -f .github/workflows/verify.yml
test -f .github/workflows/devnet-deploy.yml

echo "[verify] done"
=======
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_cmd anchor
require_cmd cargo
require_cmd node

if command -v yarn >/dev/null 2>&1; then
  yarn install --frozen-lockfile
else
  npm ci
fi

anchor build
cargo fmt --all -- --check
cargo clippy --workspace --all-targets -- -D warnings
>>>>>>> theirs
