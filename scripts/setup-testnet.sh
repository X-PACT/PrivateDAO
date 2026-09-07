#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
# ─────────────────────────────────────────────────────────────────────────────
#  setup-testnet.sh — Prepare the Anchor wallet and Solana CLI for Testnet.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
ensure_required_tools "SOLANA_BIN:solana" "SOLANA_KEYGEN_BIN:solana-keygen"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "\n${GREEN}PrivateDAO — Testnet Setup${NC}\n"

if [ -f ".env" ]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line" 2>/dev/null || true
    fi
  done < .env
fi

RPC_URL="$(select_testnet_rpc)"
WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"

if [ ! -f "$WALLET" ]; then
  "$SOLANA_KEYGEN_BIN" new --outfile "$WALLET" --no-bip39-passphrase --silent
  echo "✓ New wallet created: $WALLET"
fi

"$SOLANA_BIN" config set --url "$RPC_URL" --keypair "$WALLET" > /dev/null
PUBKEY=$("$SOLANA_KEYGEN_BIN" pubkey "$WALLET")
BALANCE=$("$SOLANA_BIN" balance "$PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "unknown")

echo "✓ Wallet: $PUBKEY"
echo "✓ RPC: $RPC_URL"
echo "✓ Balance: $BALANCE"

if [[ "$BALANCE" == "0 SOL" || "$BALANCE" == "unknown" ]]; then
  echo -e "${YELLOW}⚠ Testnet wallet is not funded. Use the Solana faucet, then run npm run deploy:testnet.${NC}"
fi
