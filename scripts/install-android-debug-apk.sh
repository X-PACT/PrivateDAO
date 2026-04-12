#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/apps/android-native"
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
ADB_BIN="$SDK_ROOT/platform-tools/adb"
APK_PATH="$APP_DIR/app/build/outputs/apk/debug/app-debug.apk"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

if [ ! -x "$ADB_BIN" ]; then
  red "adb not found: $ADB_BIN"
  exit 1
fi

export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export ANDROID_HOME="$SDK_ROOT"
export ANDROID_SDK_ROOT="$SDK_ROOT"

cd "$APP_DIR"

if [ ! -f "$APK_PATH" ]; then
  ./gradlew assembleDebug --console=plain
fi

if ! "$ADB_BIN" get-state >/dev/null 2>&1; then
  red "No Android device/emulator is attached"
  printf 'Start one first:\n'
  printf '  %s\n' "$ROOT_DIR/scripts/run-android-emulator.sh"
  exit 1
fi

"$ADB_BIN" install -r "$APK_PATH"
"$ADB_BIN" shell am start -n io.xpact.privatedao.android/.MainActivity

green "Installed and launched PrivateDAO debug APK"
printf 'APK: %s\n' "$APK_PATH"
