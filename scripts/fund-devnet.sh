#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
ensure_required_tools "SOLANA_BIN:solana" "SOLANA_KEYGEN_BIN:solana-keygen"

WALLET_PATH="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
if [[ ! -f "$WALLET_PATH" ]]; then
  echo "Wallet not found at $WALLET_PATH"
  exit 1
fi

WALLET_ADDRESS="$("$SOLANA_KEYGEN_BIN" pubkey "$WALLET_PATH")"
TARGET_SOL="${1:-2}"
MAX_ROUNDS="${MAX_ROUNDS:-5}"

RPCS=(
  "https://api.devnet.solana.com"
  "https://rpc.ankr.com/solana_devnet"
)

if [[ -n "${HELIUS_API_KEY:-}" ]]; then
  RPCS+=("https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}")
fi

if [[ -n "${QUICKNODE_DEVNET_RPC:-}" ]]; then
  RPCS+=("${QUICKNODE_DEVNET_RPC}")
fi

if [[ -n "${EXTRA_DEVNET_RPCS:-}" ]]; then
  IFS=',' read -r -a extra_rpcs <<< "${EXTRA_DEVNET_RPCS}"
  for rpc in "${extra_rpcs[@]}"; do
    if [[ -n "${rpc// }" ]]; then
      RPCS+=("$rpc")
    fi
  done
fi

echo "Using wallet: ${WALLET_ADDRESS}"
"$SOLANA_BIN" config set --keypair "$WALLET_PATH" --url "${RPCS[0]}" >/dev/null

airdrop_once() {
  local rpc="$1"
  local amount="$2"
  echo "Attempting airdrop ${amount} SOL via ${rpc}"
  if "$SOLANA_BIN" airdrop "$amount" "$WALLET_ADDRESS" --url "$rpc" >/tmp/fund-devnet-airdrop.log 2>&1; then
    cat /tmp/fund-devnet-airdrop.log
    return 0
  fi
  cat /tmp/fund-devnet-airdrop.log
  return 1
}

balance_sol() {
  local rpc="$1"
  "$SOLANA_BIN" balance "$WALLET_ADDRESS" --url "$rpc" | awk '{print $1}'
}

for ((round=1; round<=MAX_ROUNDS; round++)); do
  echo "\n=== Funding round ${round}/${MAX_ROUNDS} ==="
  for rpc in "${RPCS[@]}"; do
    "$SOLANA_BIN" config set --url "$rpc" >/dev/null || true
    if airdrop_once "$rpc" "$TARGET_SOL"; then
      bal="$(balance_sol "$rpc" || echo "0")"
      echo "Current balance on ${rpc}: ${bal} SOL"
      if awk "BEGIN {exit !(${bal} >= ${TARGET_SOL})}"; then
        echo "Funding successful."
        exit 0
      fi
    fi
    sleep $((round * 3))
  done
done

echo "Funding not completed automatically after ${MAX_ROUNDS} rounds."
echo "Next step: trigger GitHub Action 'Fund Devnet Wallet' with wallet ${WALLET_ADDRESS}."
echo "Also try faucet fallback: https://faucet.solana.com"
exit 2
