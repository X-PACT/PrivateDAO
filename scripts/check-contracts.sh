#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"
ensure_required_tools "SOLANA_BIN:solana"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <ADDRESS_1> [ADDRESS_2 ...]"
  echo "Example: $0 62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm <SECOND_ADDRESS>"
  exit 1
fi

RPC_URL="${RPC_URL:-https://api.devnet.solana.com}"
CLUSTER_LABEL="${CLUSTER_LABEL:-devnet}"

TOKEN_PROGRAM_ID="TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
TOKEN_2022_PROGRAM_ID="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
SYSTEM_PROGRAM_ID="11111111111111111111111111111111"

extract_json_field() {
  local key="$1"
  sed -n "s/.*\"${key}\":\\(\"[^\"]*\"\\|[^,}]*\\).*/\\1/p" | head -n 1 | sed 's/^"//; s/"$//'
}

classify_account() {
  local owner="$1"
  local executable="$2"
  local space="$3"

  if [[ "$executable" == "true" ]]; then
    echo "Program (executable account)"
    return
  fi

  if [[ "$owner" == "$TOKEN_PROGRAM_ID" || "$owner" == "$TOKEN_2022_PROGRAM_ID" ]]; then
    if [[ "$space" == "82" ]]; then
      echo "SPL Mint account"
    elif [[ "$space" == "165" ]]; then
      echo "SPL Token account"
    else
      echo "SPL Token-owned data account"
    fi
    return
  fi

  if [[ "$owner" == "$SYSTEM_PROGRAM_ID" ]]; then
    echo "System account"
  else
    echo "Data account"
  fi
}

echo "RPC: ${RPC_URL}"
echo ""

for address in "$@"; do
  echo "=== ${address} ==="

  if ! raw_json="$("$SOLANA_BIN" account "$address" --url "$RPC_URL" --output json-compact 2>&1)"; then
    echo "Status: not found or inaccessible"
    echo "Error:  ${raw_json}"
    echo "Explorer: https://solscan.io/account/${address}?cluster=${CLUSTER_LABEL}"
    echo ""
    continue
  fi

  owner="$(printf '%s' "$raw_json" | extract_json_field owner)"
  lamports="$(printf '%s' "$raw_json" | extract_json_field lamports)"
  executable="$(printf '%s' "$raw_json" | extract_json_field executable)"
  space="$(printf '%s' "$raw_json" | extract_json_field space)"
  account_type="$(classify_account "$owner" "$executable" "$space")"

  echo "Status:      found"
  echo "Type:        ${account_type}"
  echo "Lamports:    ${lamports}"
  echo "Executable:  ${executable}"
  echo "Owner:       ${owner}"
  echo "Data space:  ${space} bytes"
  echo "Explorer:    https://solscan.io/account/${address}?cluster=${CLUSTER_LABEL}"
  echo ""
done
