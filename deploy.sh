#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
# ─────────────────────────────────────────────────────────────────────────────
#  PrivateDAO — Full Deploy Script
#  Solana Graveyard Hackathon 2026
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; CYAN='\033[0;36m'; NC='\033[0m'
OK="${GREEN}✓${NC}"; WARN="${YELLOW}⚠${NC}"

divider() { echo -e "\n${CYAN}── $1 $(printf '─%.0s' $(seq 1 $((52 - ${#1}))))${NC}"; }
ok()      { echo -e "  ${OK}  $1"; }
warn()    { echo -e "  ${WARN}  $1"; }
fail()    { echo -e "  ${RED}✗  $1${NC}"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/scripts/lib/solana-tools.sh"
ensure_required_tools \
  "SOLANA_BIN:solana" \
  "SOLANA_KEYGEN_BIN:solana-keygen" \
  "ANCHOR_BIN:anchor" \
  "NODE_BIN:node" \
  "CARGO_BIN:cargo"

# ── Load .env safely (skip non KEY=VALUE lines) ───────────────────────────────
if [ -f ".env" ]; then
  while IFS= read -r line; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue
    if [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
      export "$line" 2>/dev/null || true
    fi
  done < .env
  ok "Loaded .env"
else
  warn ".env not found — copy .env.example and add your Helius key"
fi

SOLANA_RPC_URL="$(select_devnet_rpc)"
if [[ "$SOLANA_RPC_URL" == *"alchemy.com"* ]]; then
  ok "Using Alchemy devnet RPC"
elif [[ "$SOLANA_RPC_URL" == *"helius"* ]]; then
  ok "Using Helius devnet RPC"
else
  warn "Using public devnet RPC — set ALCHEMY_API_KEY/ALCHEMY_DEVNET_RPC_URL or HELIUS_API_KEY"
fi

PROGRAM_ID="${PROGRAM_ID:-62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm}"

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║      PrivateDAO — Deploy to Solana Devnet                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "  RPC:        $SOLANA_RPC_URL"
echo "  Program ID: $PROGRAM_ID"

# ── 1. Prerequisites ──────────────────────────────────────────────────────────
divider "1. Prerequisites"

check_bin() {
  local label="$1"
  local bin_path="$2"
  if [[ -z "$bin_path" ]]; then
    fail "$label not found"
  fi
  ok "$label: $("$bin_path" --version 2>&1 | head -1)"
}

check_bin solana "$SOLANA_BIN"
check_bin anchor "$ANCHOR_BIN"
check_bin node "$NODE_BIN"
check_bin cargo "$CARGO_BIN"

# ── 2. Wallet ─────────────────────────────────────────────────────────────────
divider "2. Wallet"

WALLET="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
if [ ! -f "$WALLET" ]; then
  "$SOLANA_KEYGEN_BIN" new --outfile "$WALLET" --no-bip39-passphrase --silent
  ok "New wallet created: $WALLET"
fi
PUBKEY=$("$SOLANA_KEYGEN_BIN" pubkey "$WALLET")
ok "Wallet: $PUBKEY"

# ── 3. Configure Solana CLI ───────────────────────────────────────────────────
divider "3. Network Config"

"$SOLANA_BIN" config set --url "$SOLANA_RPC_URL" --keypair "$WALLET" > /dev/null
ok "Cluster: devnet"

# ── 4. SOL Balance ────────────────────────────────────────────────────────────
divider "4. SOL Balance"

BALANCE=$("$SOLANA_BIN" balance "$PUBKEY" --url "$SOLANA_RPC_URL" 2>/dev/null | awk '{print $1}' || echo "0")
echo "  Balance: $BALANCE SOL"

if awk "BEGIN{exit !($BALANCE < 2)}"; then
  echo "  Requesting airdrop..."
  "$SOLANA_BIN" airdrop 2 "$PUBKEY" --url "$SOLANA_RPC_URL" && ok "Airdrop: +2 SOL" || {
    warn "Airdrop rate-limited. Visit https://faucet.solana.com"
    warn "Then re-run ./deploy.sh"
  }
fi

# ── 5. Node dependencies ──────────────────────────────────────────────────────
divider "5. Node Dependencies"

if [[ -n "${YARN_BIN:-}" ]]; then
  "$YARN_BIN" install --silent 2>&1 | tail -2
  ok "yarn install done"
else
  npm install --silent 2>&1 | tail -2
  ok "npm install done"
fi

# ── 6. Build ──────────────────────────────────────────────────────────────────
divider "6. Build"

echo "  anchor build... (1-2 min first time)"
"$ANCHOR_BIN" build 2>&1 | grep -E "^error|Compiling private_dao|Finished" || true

[ -f "target/deploy/private_dao.so" ] \
  && ok "Built: target/deploy/private_dao.so ($(du -sh target/deploy/private_dao.so | cut -f1))" \
  || fail "Build failed. Read errors above."

# ── 7. Deploy ─────────────────────────────────────────────────────────────────
divider "7. Deploy"

echo "  Deploying to devnet..."
"$ANCHOR_BIN" deploy \
  --provider.cluster "$SOLANA_RPC_URL" \
  --provider.wallet  "$WALLET" \
  2>&1 | tee /tmp/privatedao_deploy.txt

DEPLOYED_ID=$(grep -oP '(?<=Program Id: )[A-Za-z0-9]+' /tmp/privatedao_deploy.txt | head -1)

if [ -n "$DEPLOYED_ID" ]; then
  ok "Deployed: $DEPLOYED_ID"
  if [ "$DEPLOYED_ID" != "$PROGRAM_ID" ]; then
    warn "Program ID changed! Updating source files..."
    sed -i "s/$PROGRAM_ID/$DEPLOYED_ID/g" programs/private-dao/src/lib.rs Anchor.toml
    ok "Updated declare_id! → $DEPLOYED_ID"
    echo "  Rebuilding..."
    "$ANCHOR_BIN" build 2>&1 | tail -3
    PROGRAM_ID="$DEPLOYED_ID"
  fi
fi

# ── 8. Summary ────────────────────────────────────────────────────────────────
divider "Done"

echo ""
echo "  ✅ Deployed successfully!"
echo ""
echo "  Program ID:  $PROGRAM_ID"
echo "  Explorer:    https://solscan.io/account/$PROGRAM_ID?cluster=devnet"
echo ""
echo "  ── Next steps ──────────────────────────────────────────"
echo ""
echo "  yarn create-dao -- --name \"MyDAO\" --quorum 51 --mode dual"
echo "  yarn deposit -- --dao <DAO_PDA> --amount 1.0"
echo ""
echo "  ── Hackathon Submission ────────────────────────────────"
echo "  URL:      https://app.superteam.fun"
echo "  Deadline: February 28, 2026"
echo "  Tracks:   DAOs (\$5K) + Migrations (\$7K) + Overall (\$15K)"
echo ""
