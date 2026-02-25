#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/lib/solana-tools.sh
. "$SCRIPT_DIR/lib/solana-tools.sh"

is_proxy_block_error() {
  local err="${1:-}"
  [[ "$err" == *"CONNECT tunnel failed, response 403"* ]] || [[ "$err" == *"Proxy CONNECT aborted"* ]]
}

is_network_error() {
  local err="${1:-}"
  [[ "$err" == *"Failed to connect"* ]] \
    || [[ "$err" == *"Could not resolve host"* ]] \
    || [[ "$err" == *"Connection timed out"* ]] \
    || [[ "$err" == *"Operation timed out"* ]] \
    || [[ "$err" == *"Connection reset by peer"* ]] \
    || is_proxy_block_error "$err"
}

print_rpc_failure_hints() {
  local err="${1:-}"
  if is_proxy_block_error "$err"; then
    echo "  hint: outbound proxy is blocking this endpoint (HTTP CONNECT 403)."
    echo "  hint: set proxy allowlist / NO_PROXY or run from a network without forced proxy."
    return 0
  fi

  if [[ "$err" == *"Could not resolve host"* ]]; then
    echo "  hint: DNS lookup failed for this RPC host."
    return 0
  fi

  if [[ "$err" == *"timed out"* ]]; then
    echo "  hint: network timeout. Increase RPC_HEALTH_CONNECT_TIMEOUT_S / RPC_HEALTH_MAX_TIME_S if needed."
    return 0
  fi
}

check_rpc() {
  local rpc="$1"
  local payload status body err tmp_body tmp_err
  payload='{"jsonrpc":"2.0","id":1,"method":"getVersion"}'

  tmp_body="$(mktemp /tmp/privatedao-rpc-health-body.XXXXXX)"
  tmp_err="$(mktemp /tmp/privatedao-rpc-health-err.XXXXXX)"

  if [[ -n "${AUTH_HEADER_VALUE}" ]]; then
    status="$(curl -sS -X POST "$rpc" \
      --connect-timeout "$CONNECT_TIMEOUT_S" \
      --max-time "$MAX_TIME_S" \
      -H "Content-Type: application/json" \
      -H "$AUTH_HEADER_VALUE" \
      --data "$payload" \
      -o "$tmp_body" \
      -w "%{http_code}" 2>"$tmp_err" || true)"
  else
    status="$(curl -sS -X POST "$rpc" \
      --connect-timeout "$CONNECT_TIMEOUT_S" \
      --max-time "$MAX_TIME_S" \
      -H "Content-Type: application/json" \
      --data "$payload" \
      -o "$tmp_body" \
      -w "%{http_code}" 2>"$tmp_err" || true)"
  fi

  body="$(head -c 500 "$tmp_body" 2>/dev/null || true)"
  err="$(head -c 300 "$tmp_err" 2>/dev/null || true)"

  rm -f "$tmp_body" "$tmp_err"

  if [[ "$status" =~ ^2[0-9][0-9]$ ]] && [[ "$body" == *'"solana-core"'* ]]; then
    echo "PASS $rpc ($status)"
    return 0
  fi

  echo "FAIL $rpc (${status:-000})"
  if [[ -n "$err" ]]; then
    echo "  curl: $err"
    print_rpc_failure_hints "$err"
  fi
  if [[ -n "$body" ]]; then
    echo "  body: $body"
  fi

  if is_network_error "$err"; then
    return 3
  fi

  return 1
}

main() {
  if ! command -v curl >/dev/null 2>&1; then
    echo "curl is required" >&2
    return 1
  fi

  mapfile -t RPCS < <(collect_devnet_rpcs)
  if [[ "${#RPCS[@]}" -eq 0 ]]; then
    echo "No RPC endpoints resolved." >&2
    return 1
  fi

  AUTH_HEADER_VALUE="$(trim_value "${RPC_AUTH_HEADER:-}")"
  CONNECT_TIMEOUT_S="${RPC_HEALTH_CONNECT_TIMEOUT_S:-8}"
  MAX_TIME_S="${RPC_HEALTH_MAX_TIME_S:-15}"

  echo "RPC health check started (connect-timeout=${CONNECT_TIMEOUT_S}s, max-time=${MAX_TIME_S}s)"

  local total_ok=0
  local total_fail=0
  local total_network_fail=0

  local rpc
  for rpc in "${RPCS[@]}"; do
    if check_rpc "$rpc"; then
      total_ok=$((total_ok + 1))
    else
      rc=$?
      total_fail=$((total_fail + 1))
      if [[ "$rc" -eq 3 ]]; then
        total_network_fail=$((total_network_fail + 1))
      fi
    fi
  done

  echo "RPC health summary: pass=${total_ok} fail=${total_fail} network_fail=${total_network_fail}"

  if [[ "$total_ok" -gt 0 ]]; then
    return 0
  fi

  if [[ "$total_network_fail" -eq "$total_fail" && "$total_fail" -gt 0 ]]; then
    if [[ "${RPC_HEALTH_ALLOW_NETWORK_FAIL:-0}" == "1" ]]; then
      echo "RPC health degraded: all failures are network/proxy related, but continuing due to RPC_HEALTH_ALLOW_NETWORK_FAIL=1"
      return 0
    fi
    return 3
  fi

  return 1
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi
