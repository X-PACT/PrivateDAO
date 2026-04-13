#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/apps/android-native"
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
CMDLINE_TOOLS="$SDK_ROOT/cmdline-tools/latest/bin"
SDKMANAGER="$CMDLINE_TOOLS/sdkmanager"
AVDMANAGER="$CMDLINE_TOOLS/avdmanager"
AVD_NAME="${PRIVATE_DAO_ANDROID_AVD_NAME:-PrivateDAO_API_36}"
AVD_HOME="${ANDROID_AVD_HOME:-$HOME/.android/avd}"
SYSTEM_IMAGE="${PRIVATE_DAO_ANDROID_SYSTEM_IMAGE:-system-images;android-36;google_apis;x86_64}"
DEVICE_ID="${PRIVATE_DAO_ANDROID_DEVICE_ID:-pixel_6}"
DATA_PARTITION_MB="${PRIVATE_DAO_ANDROID_DATA_PARTITION_MB:-2048}"

green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$1"; }
red() { printf '\033[0;31m%s\033[0m\n' "$1"; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1
}

if [ ! -x "$SDKMANAGER" ] || [ ! -x "$AVDMANAGER" ]; then
  red "Android cmdline-tools were not found under $SDK_ROOT"
  printf 'Expected:\n'
  printf '  %s\n' "$SDKMANAGER"
  printf '  %s\n' "$AVDMANAGER"
  exit 1
fi

for cmd in yes java unzip; do
  if ! need_cmd "$cmd"; then
    red "Missing required host tool: $cmd"
    exit 1
  fi
done

export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-17-openjdk-amd64}"
export ANDROID_HOME="$SDK_ROOT"
export ANDROID_SDK_ROOT="$SDK_ROOT"
export ANDROID_AVD_HOME="$AVD_HOME"

green "Bootstrapping PrivateDAO Android emulator environment"
printf 'SDK root: %s\n' "$SDK_ROOT"
printf 'AVD name: %s\n' "$AVD_NAME"
printf 'AVD home: %s\n' "$AVD_HOME"
printf 'System image: %s\n' "$SYSTEM_IMAGE"
printf '\n'

set +o pipefail
yes | "$SDKMANAGER" --sdk_root="$SDK_ROOT" \
  "platform-tools" \
  "platforms;android-36" \
  "build-tools;36.0.0" \
  "emulator" \
  "$SYSTEM_IMAGE"
set -o pipefail

if "$AVDMANAGER" list avd | rg -q "^Name: ${AVD_NAME}\$"; then
  yellow "AVD already exists: $AVD_NAME"
else
  printf 'no\n' | "$AVDMANAGER" create avd \
    --force \
    --name "$AVD_NAME" \
    --device "$DEVICE_ID" \
    --package "$SYSTEM_IMAGE"
  green "Created AVD: $AVD_NAME"
fi

AVD_CONFIG="$AVD_HOME/${AVD_NAME}.avd/config.ini"
if [ -f "$AVD_CONFIG" ]; then
  python3 - "$AVD_CONFIG" "$DATA_PARTITION_MB" <<'PY'
import pathlib
import sys

config_path = pathlib.Path(sys.argv[1])
partition_mb = sys.argv[2]
partition_bytes = int(partition_mb) * 1024 * 1024
updates = {
    "disk.dataPartition.size": str(partition_bytes),
    "fastboot.forceFastBoot": "no",
    "firstboot.bootFromDownloadableSnapshot": "no",
    "firstboot.bootFromLocalSnapshot": "no",
    "firstboot.saveToLocalSnapshot": "no",
    "userdata.useQcow2": "yes",
    "sdcard.size": "256M",
}

lines = []
seen = set()
for raw_line in config_path.read_text().splitlines():
    stripped = raw_line.strip()
    if "=" not in stripped:
        lines.append(raw_line)
        continue
    key, _ = [part.strip() for part in stripped.split("=", 1)]
    if key in updates:
        lines.append(f"{key} = {updates[key]}")
        seen.add(key)
    else:
        lines.append(raw_line)

for key, value in updates.items():
    if key not in seen:
        lines.append(f"{key} = {value}")

config_path.write_text("\n".join(lines) + "\n")
PY
  green "Pinned AVD data partition to ${DATA_PARTITION_MB} MB"
fi

printf '\n'
green "Android emulator bootstrap complete"
printf 'Next steps:\n'
printf '  1. %s\n' "$ROOT_DIR/scripts/run-android-emulator.sh"
printf '  2. %s\n' "$ROOT_DIR/scripts/install-android-debug-apk.sh"
printf '  3. Open the app and pair with an MWA-compatible wallet on the emulator/device\n'
printf '\n'
printf 'Build artifact path:\n'
printf '  %s\n' "$APP_DIR/app/build/outputs/apk/debug/app-debug.apk"
