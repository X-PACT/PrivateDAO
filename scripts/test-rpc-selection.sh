#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

assert_eq() {
  local expected="$1"
  local actual="$2"
  local name="$3"
  if [[ "$expected" != "$actual" ]]; then
    echo "[rpc-test] FAIL: ${name}" >&2
    echo "[rpc-test] expected: ${expected}" >&2
    echo "[rpc-test] actual:   ${actual}" >&2
    exit 1
  fi
  echo "[rpc-test] PASS: ${name}"
}

assert_cmd_fails() {
  local name="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "[rpc-test] FAIL: ${name} (expected non-zero)" >&2
    exit 1
  fi
  echo "[rpc-test] PASS: ${name}"
}

actual="$(SOLANA_RPC_URL='https://custom.devnet.rpc' ALCHEMY_API_KEY='live' HELIUS_API_KEY='live' bash -lc '. scripts/lib/solana-tools.sh; select_devnet_rpc')"
assert_eq "https://custom.devnet.rpc" "$actual" "SOLANA_RPC_URL has highest priority"

actual="$(SOLANA_RPC_URL='https://devnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}' ALCHEMY_API_KEY='alchemy-live' HELIUS_API_KEY='helius-live' bash -lc '. scripts/lib/solana-tools.sh; select_devnet_rpc')"
assert_eq "https://solana-devnet.g.alchemy.com/v2/alchemy-live" "$actual" "Placeholder SOLANA_RPC_URL ignored in favor of Alchemy"

actual="$(ALCHEMY_DEVNET_RPC_URL='https://solana-devnet.g.alchemy.com/v2/custom' ALCHEMY_API_KEY='alchemy-live' bash -lc '. scripts/lib/solana-tools.sh; build_devnet_alchemy_rpc')"
assert_eq "https://solana-devnet.g.alchemy.com/v2/custom" "$actual" "ALCHEMY_DEVNET_RPC_URL preferred over ALCHEMY_API_KEY"

actual="$(unset ALCHEMY_API_KEY ALCHEMY_DEVNET_RPC_URL SOLANA_RPC_URL; HELIUS_API_KEY='helius-live' bash -lc '. scripts/lib/solana-tools.sh; select_devnet_rpc')"
assert_eq "https://devnet.helius-rpc.com/?api-key=helius-live" "$actual" "Helius fallback"

actual="$(unset SOLANA_RPC_URL ALCHEMY_API_KEY ALCHEMY_DEVNET_RPC_URL HELIUS_API_KEY; bash -lc '. scripts/lib/solana-tools.sh; select_devnet_rpc')"
assert_eq "https://api.devnet.solana.com" "$actual" "Public devnet fallback"

assert_cmd_fails "Placeholder Alchemy key rejected" bash -lc 'ALCHEMY_API_KEY=your_alchemy_api_key_here; . scripts/lib/solana-tools.sh; build_devnet_alchemy_rpc'
assert_cmd_fails "Placeholder Helius key rejected" bash -lc 'HELIUS_API_KEY=your_helius_api_key_here; . scripts/lib/solana-tools.sh; build_devnet_helius_rpc'

actual="$(ALCHEMY_API_KEY='  alchemy-live  ' bash -lc '. scripts/lib/solana-tools.sh; build_devnet_alchemy_rpc')"
assert_eq "https://solana-devnet.g.alchemy.com/v2/alchemy-live" "$actual" "Alchemy key is whitespace-trimmed"

actual="$(SOLANA_RPC_URL='  https://my.devnet.rpc  ' bash -lc '. scripts/lib/solana-tools.sh; select_devnet_rpc')"
assert_eq "https://my.devnet.rpc" "$actual" "SOLANA_RPC_URL is whitespace-trimmed"

actual_count="$(SOLANA_RPC_URL='https://api.devnet.solana.com' EXTRA_DEVNET_RPCS='https://api.devnet.solana.com, https://rpc.ankr.com/solana_devnet' bash -lc '. scripts/lib/solana-tools.sh; mapfile -t RP < <(collect_devnet_rpcs); printf "%s" "${#RP[@]}"')"
assert_eq "2" "$actual_count" "collect_devnet_rpcs deduplicates providers"

echo "[rpc-test] All RPC selection tests passed."
