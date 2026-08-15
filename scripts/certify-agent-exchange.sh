#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
node --check services/agent-exchange/src/handler.mjs
node --check services/agent-exchange/src/solana.mjs
npm --prefix services/agent-exchange test
npm --prefix services/agent-exchange run smoke
if rg -n -i --glob '!services/agent-exchange/package-lock.json' --glob '!docs/**' '(^|["'"'"' ])(AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|PRIVATE_KEY|seed phrase|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)(["'"'"' =:]|$)' services/agent-exchange infra/agent-exchange sdk/agent-exchange; then
  echo "secret scan failed" >&2; exit 1
fi
test -f infra/agent-exchange/template.yaml
echo "agent-exchange certification: PASS (local deterministic gates)"
