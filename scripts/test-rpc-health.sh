#!/usr/bin/env bash
# Copyright (c) 2026 X-PACT. MIT License.
set -euo pipefail

# shellcheck source=scripts/check-rpc-health.sh
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/check-rpc-health.sh"

assert_ok() {
  local name="$1"
  shift
  if "$@"; then
    echo "[rpc-health-test] PASS: $name"
  else
    echo "[rpc-health-test] FAIL: $name" >&2
    exit 1
  fi
}

assert_fail() {
  local name="$1"
  shift
  if "$@"; then
    echo "[rpc-health-test] FAIL: $name (expected false)" >&2
    exit 1
  fi
  echo "[rpc-health-test] PASS: $name"
}

assert_ok "proxy CONNECT 403 recognized" is_proxy_block_error "curl: (56) CONNECT tunnel failed, response 403"
assert_ok "Proxy CONNECT aborted recognized" is_proxy_block_error "curl: (56) Proxy CONNECT aborted"
assert_fail "non-proxy text not recognized as proxy block" is_proxy_block_error "curl: (7) Failed to connect"

assert_ok "DNS resolution error is network failure" is_network_error "curl: (6) Could not resolve host"
assert_ok "timeout is network failure" is_network_error "curl: (28) Operation timed out"
assert_ok "proxy block is network failure" is_network_error "curl: (56) CONNECT tunnel failed, response 403"
assert_fail "application JSON error is not network failure" is_network_error '{"error":{"code":-32002}}'

echo "[rpc-health-test] All checks passed."
