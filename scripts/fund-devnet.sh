#!/usr/bin/env bash
set -euo pipefail

WALLET_PATH="${ANCHOR_WALLET:-$HOME/.config/solana/id.json}"
if [[ ! -f "$WALLET_PATH" ]]; then
  echo "Wallet not found at $WALLET_PATH"
  exit 1
fi

WALLET_ADDRESS="$(solana-keygen pubkey "$WALLET_PATH")"
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

echo "Using wallet: ${WALLET_ADDRESS}"
solana config set --keypair "$WALLET_PATH" --url "${RPCS[0]}" >/dev/null

airdrop_once() {
  local rpc="$1"
  local amount="$2"
  echo "Attempting airdrop ${amount} SOL via ${rpc}"
  if solana airdrop "$amount" "$WALLET_ADDRESS" --url "$rpc" >/tmp/fund-devnet-airdrop.log 2>&1; then
    cat /tmp/fund-devnet-airdrop.log
    return 0
  fi
  cat /tmp/fund-devnet-airdrop.log
  return 1
}

balance_sol() {
  local rpc="$1"
  solana balance "$WALLET_ADDRESS" --url "$rpc" | awk '{print $1}'
}

for ((round=1; round<=MAX_ROUNDS; round++)); do
  echo "\n=== Funding round ${round}/${MAX_ROUNDS} ==="
  for rpc in "${RPCS[@]}"; do
    solana config set --url "$rpc" >/dev/null || true
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
