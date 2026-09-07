#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# Copyright (c) 2026 X-PACT. AGPL-3.0-or-later.
# ─────────────────────────────────────────────────────────────────────────────
#  setup-devnet.sh — Quick setup for devnet.
#  Run ONCE before deploy.sh.
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
ensure_required_tools "SOLANA_BIN:solana" "SOLANA_KEYGEN_BIN:solana-keygen"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

echo -e "\n${GREEN}PrivateDAO — Devnet Setup${NC}\n"

# Load .env safely (skip lines that aren't KEY=VALUE)
if [ -f ".env" ]; then
  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    # Only export if line looks like KEY=VALUE (no spaces before =)
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line" 2>/dev/null || true
    fi
  done < .env
fi

RPC_URL="$(select_devnet_rpc)"

if [[ "$RPC_URL" == *"alchemy.com"* ]]; then
  echo "✓ Alchemy devnet RPC configured"
elif [[ "$RPC_URL" == *"helius"* ]]; then
  echo "✓ Helius devnet RPC configured"
elif [[ "$RPC_URL" == "https://api.devnet.solana.com" ]]; then
  echo -e "${YELLOW}⚠  No premium RPC configured (Alchemy/Helius)${NC}"
  echo "   Using public devnet (rate-limited)."
fi

WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"

# Generate wallet if missing
if [ ! -f "$WALLET" ]; then
  "$SOLANA_KEYGEN_BIN" new --outfile "$WALLET" --no-bip39-passphrase --silent
  echo "✓ New wallet created: $WALLET"
fi

# Configure Solana CLI
"$SOLANA_BIN" config set --url "$RPC_URL" --keypair "$WALLET" > /dev/null
PUBKEY=$("$SOLANA_KEYGEN_BIN" pubkey "$WALLET")
echo "✓ Wallet: $PUBKEY"
echo "✓ RPC: $RPC_URL"

# Airdrop
echo ""
echo "  Requesting 2 SOL airdrop..."
"$SOLANA_BIN" airdrop 2 "$PUBKEY" --url "$RPC_URL" \
  && echo "✓ Airdrop successful" \
  || echo -e "${YELLOW}⚠  Airdrop rate-limited. Use: https://faucet.solana.com${NC}"

BALANCE=$("$SOLANA_BIN" balance "$PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "unknown")
echo "  Balance: $BALANCE"
echo ""
echo "✅ Setup complete. Run ./deploy.sh to build and deploy."
