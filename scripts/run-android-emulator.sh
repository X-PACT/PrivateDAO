#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail

SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
EMULATOR_BIN="$SDK_ROOT/emulator/emulator"
ADB_BIN="$SDK_ROOT/platform-tools/adb"
AVD_NAME="${PRIVATE_DAO_ANDROID_AVD_NAME:-PrivateDAO_API_36}"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/privatedao-android"
LOG_FILE="$STATE_DIR/emulator.log"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

mkdir -p "$STATE_DIR"

if [ ! -x "$EMULATOR_BIN" ]; then
  red "Android emulator binary not found: $EMULATOR_BIN"
  printf 'Run bootstrap first:\n'
  printf '  %s\n' "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/bootstrap-android-emulator.sh"
  exit 1
fi

if [ ! -x "$ADB_BIN" ]; then
  red "adb not found: $ADB_BIN"
  exit 1
fi

EMULATOR_ARGS=(
  -avd "$AVD_NAME"
  -netdelay none
  -netspeed full
  -no-snapshot-save
  -gpu swiftshader_indirect
)

if [ -z "${DISPLAY:-}" ]; then
  EMULATOR_ARGS+=(-no-window)
fi

if pgrep -f "emulator.*-avd ${AVD_NAME}" >/dev/null 2>&1; then
  yellow "Emulator already running for AVD ${AVD_NAME}"
else
  nohup "$EMULATOR_BIN" "${EMULATOR_ARGS[@]}" >"$LOG_FILE" 2>&1 &
  green "Started emulator for ${AVD_NAME}"
  printf 'Log: %s\n' "$LOG_FILE"
fi

"$ADB_BIN" wait-for-device

BOOT_COMPLETE=""
for _ in $(seq 1 120); do
  BOOT_COMPLETE="$("$ADB_BIN" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
  if [ "$BOOT_COMPLETE" = "1" ]; then
    break
  fi
  sleep 2
done

if [ "$BOOT_COMPLETE" != "1" ]; then
  red "Emulator did not finish booting within the expected window"
  printf 'Check log: %s\n' "$LOG_FILE"
  exit 1
fi

green "Emulator boot complete"
"$ADB_BIN" devices -l
