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
CUSTOM_FAUCET_URL="${CUSTOM_FAUCET_URL:-}"
CUSTOM_FAUCET_METHOD="${CUSTOM_FAUCET_METHOD:-POST}"

mapfile -t RPCS < <(collect_devnet_rpcs)

echo "RPC priority order:"
for idx in "${!RPCS[@]}"; do
  echo "  [$((idx + 1))] ${RPCS[$idx]}"
done

echo "Using wallet: ${WALLET_ADDRESS}"
"$SOLANA_BIN" config set --keypair "$WALLET_PATH" --url "${RPCS[0]}" >/dev/null

if [[ -n "$CUSTOM_FAUCET_URL" ]]; then
  echo "Custom faucet endpoint configured: ${CUSTOM_FAUCET_URL}"
fi

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

custom_faucet_once() {
  if [[ -z "$CUSTOM_FAUCET_URL" ]]; then
    return 1
  fi

  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required for CUSTOM_FAUCET_URL mode"
    return 1
  fi

  local payload status
  payload="$(cat <<JSON
{"wallet":"$WALLET_ADDRESS","address":"$WALLET_ADDRESS","recipient":"$WALLET_ADDRESS","to":"$WALLET_ADDRESS","amount":"$TARGET_SOL","amount_sol":"$TARGET_SOL","amountSol":"$TARGET_SOL"}
JSON
)"

  echo "Attempting custom faucet request via ${CUSTOM_FAUCET_METHOD} ${CUSTOM_FAUCET_URL}"
  status="$(curl -sS -X "$CUSTOM_FAUCET_METHOD" \
    -H "Content-Type: application/json" \
    --data "$payload" \
    -o /tmp/fund-devnet-custom-faucet.log \
    -w "%{http_code}" \
    "$CUSTOM_FAUCET_URL" || true)"

  echo "Custom faucet HTTP status: ${status}"
  head -c 400 /tmp/fund-devnet-custom-faucet.log || true
  echo

  [[ "$status" =~ ^2[0-9][0-9]$ ]]
}

for ((round=1; round<=MAX_ROUNDS; round++)); do
  echo "\n=== Funding round ${round}/${MAX_ROUNDS} ==="

  if custom_faucet_once; then
    for rpc in "${RPCS[@]}"; do
      bal="$(balance_sol "$rpc" || echo "0")"
      echo "Current balance on ${rpc}: ${bal} SOL"
      if awk "BEGIN {exit !(${bal} >= ${TARGET_SOL})}"; then
        echo "Funding successful via custom faucet."
        exit 0
      fi
    done
  fi

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
