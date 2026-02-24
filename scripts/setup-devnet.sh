#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
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

HELIUS_KEY="${HELIUS_API_KEY:-}"
if [ -z "$HELIUS_KEY" ] || [ "$HELIUS_KEY" = "your_helius_api_key_here" ]; then
  echo -e "${YELLOW}⚠  HELIUS_API_KEY not set in .env${NC}"
  echo "   Using public devnet (rate-limited)."
  echo "   Get free key at: https://dev.helius.xyz"
  echo ""
  RPC_URL="https://api.devnet.solana.com"
else
  RPC_URL="https://devnet.helius-rpc.com/?api-key=${HELIUS_KEY}"
  echo "✓ Helius RPC configured"
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
