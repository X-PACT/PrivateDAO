#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

overall_status=0
internal_failures=0
external_blockers=0

declare -a PASS_LABELS=()
declare -a FAIL_LABELS=()
declare -a EXTERNAL_LABELS=()

run_check() {
  local label="$1"
  local mode="$2"
  shift 2

  echo "[checkup] ${label}"
  if "$@" >/tmp/privatedao-checkup.$$ 2>&1; then
    PASS_LABELS+=("$label")
    echo "[checkup] PASS ${label}"
    return 0
  fi

  if [[ "$mode" == "external" ]]; then
    external_blockers=$((external_blockers + 1))
    EXTERNAL_LABELS+=("$label")
    echo "[checkup] EXTERNAL BLOCKER ${label}"
  else
    internal_failures=$((internal_failures + 1))
    FAIL_LABELS+=("$label")
    overall_status=1
    echo "[checkup] FAIL ${label}"
  fi

  sed -n '1,40p' /tmp/privatedao-checkup.$$ || true
  return 0
}

cleanup() {
  rm -f /tmp/privatedao-checkup.$$
}
trap cleanup EXIT

run_check "source preflight" internal npm run verify:rapid-work-preflight:strict
run_check "web build" internal npm run web:build
run_check "core suite" internal npm run test:core
run_check "monitoring alerts" internal npm run verify:monitoring-alerts
run_check "real-device runtime" internal npm run verify:real-device-runtime
run_check "multisig intake evidence" external npm run verify:multisig-intake
run_check "mainnet blocker register" external npm run verify:mainnet-blockers
run_check "PDAO live metadata cutover" external npm run verify:pdao-live

echo
echo "[checkup] summary"
printf '[checkup] internal passes: %s\n' "${#PASS_LABELS[@]}"
printf '[checkup] internal failures: %s\n' "$internal_failures"
printf '[checkup] external blockers: %s\n' "$external_blockers"

if [[ "${#PASS_LABELS[@]}" -gt 0 ]]; then
  echo "[checkup] passes:"
  printf '  - %s\n' "${PASS_LABELS[@]}"
fi

if [[ "${#FAIL_LABELS[@]}" -gt 0 ]]; then
  echo "[checkup] internal failures:"
  printf '  - %s\n' "${FAIL_LABELS[@]}"
fi

if [[ "${#EXTERNAL_LABELS[@]}" -gt 0 ]]; then
  echo "[checkup] external blockers:"
  printf '  - %s\n' "${EXTERNAL_LABELS[@]}"
fi

if [[ "$overall_status" -eq 0 && "$external_blockers" -eq 0 ]]; then
  echo "[checkup] READY: no local or external blockers detected"
elif [[ "$overall_status" -eq 0 ]]; then
  echo "[checkup] LOCAL READY: internal checks pass; external closure still required"
else
  echo "[checkup] NOT READY: local failures remain before external closure"
fi

exit "$overall_status"
