#!/usr/bin/env bash
set -euo pipefail

supports_avx2() {
  if [[ -r /proc/cpuinfo ]] && grep -qi 'avx2' /proc/cpuinfo; then
    return 0
  fi

  if command -v lscpu >/dev/null 2>&1 && lscpu | grep -qi 'avx2'; then
    return 0
  fi

  return 1
}

if ! command -v solana-test-validator >/dev/null 2>&1; then
  echo "[local-validator] FAIL solana-test-validator is not installed"
  exit 1
fi

if supports_avx2; then
  echo "[local-validator] PASS AVX2-capable host detected"
  exit 0
fi

echo "[local-validator] PASS host does not expose AVX2; solana-test-validator integration suites must run on an AVX2-capable machine or a devnet-backed verification path"
