#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail

SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
EMULATOR_BIN="$SDK_ROOT/emulator/emulator"
ADB_BIN="$SDK_ROOT/platform-tools/adb"
AVD_NAME="${PRIVATE_DAO_ANDROID_AVD_NAME:-PrivateDAO_API_36}"
AVD_HOME="${ANDROID_AVD_HOME:-$HOME/.android/avd}"
DATA_PARTITION_MB="${PRIVATE_DAO_ANDROID_DATA_PARTITION_MB:-2048}"
HEADLESS_MODE="${PRIVATE_DAO_ANDROID_HEADLESS:-1}"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}/privatedao-android"
LOG_FILE="$STATE_DIR/emulator.log"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

mkdir -p "$STATE_DIR"
mkdir -p "$AVD_HOME"
export ANDROID_AVD_HOME="$AVD_HOME"

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
  -wipe-data
  -no-snapshot
  -no-snapshot-load
  -no-snapshot-save
  -partition-size "$DATA_PARTITION_MB"
  -no-boot-anim
  -noaudio
  -camera-back none
  -camera-front none
  -gpu swiftshader_indirect
)

if [ "$HEADLESS_MODE" = "1" ] || [ -z "${DISPLAY:-}" ]; then
  EMULATOR_ARGS+=(-no-window)
fi

if pgrep -f "$EMULATOR_BIN .* -avd ${AVD_NAME}|qemu-system-x86_64 .* -avd ${AVD_NAME}" >/dev/null 2>&1; then
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
