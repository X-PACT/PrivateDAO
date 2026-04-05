#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/real-device-capture.sh <target-id> [options]

Targets:
  phantom-desktop
  solflare-desktop
  backpack-desktop
  glow-desktop
  android-runtime

Options:
  --wallet-version <value>
  --os <value>
  --client <value>
  --tx <devnet-signature>
  --connect <success|failure>
  --signing <success|failure|not-attempted>
  --submission <success|failure|not-attempted>
  --diagnostics <true|false>
  --error <message>
  --evidence <comma,separated,paths>
  --captured-at <iso8601>
  --template-only
  --full-verify

Examples:
  bash scripts/real-device-capture.sh phantom-desktop \
    --wallet-version "24.11.0" \
    --os "Windows 11" \
    --client "Chrome 135" \
    --tx "5sExampleSignatureOnDevnet" \
    --full-verify

  bash scripts/real-device-capture.sh android-runtime --template-only
EOF
}

template_path() {
  case "$1" in
    phantom-desktop|solflare-desktop|backpack-desktop|glow-desktop|android-runtime)
      printf '%s/docs/real-device-runtime-templates/%s.json\n' "$ROOT_DIR" "$1"
      ;;
    *)
      echo "Unknown target: $1" >&2
      exit 1
      ;;
  esac
}

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  usage
  exit 1
fi
shift || true

WALLET_VERSION="fill-with-real-version"
OS_NAME="fill-with-real-os"
CLIENT_NAME="fill-with-real-browser"
TX_SIGNATURE=""
CONNECT_RESULT="success"
SIGNING_RESULT="success"
SUBMISSION_RESULT="success"
DIAGNOSTICS_CAPTURED="true"
ERROR_MESSAGE=""
EVIDENCE_REFS=""
CAPTURED_AT="$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
TEMPLATE_ONLY="false"
FULL_VERIFY="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --wallet-version) WALLET_VERSION="${2:-}"; shift 2 ;;
    --os) OS_NAME="${2:-}"; shift 2 ;;
    --client) CLIENT_NAME="${2:-}"; shift 2 ;;
    --tx) TX_SIGNATURE="${2:-}"; shift 2 ;;
    --connect) CONNECT_RESULT="${2:-}"; shift 2 ;;
    --signing) SIGNING_RESULT="${2:-}"; shift 2 ;;
    --submission) SUBMISSION_RESULT="${2:-}"; shift 2 ;;
    --diagnostics) DIAGNOSTICS_CAPTURED="${2:-}"; shift 2 ;;
    --error) ERROR_MESSAGE="${2:-}"; shift 2 ;;
    --evidence) EVIDENCE_REFS="${2:-}"; shift 2 ;;
    --captured-at) CAPTURED_AT="${2:-}"; shift 2 ;;
    --template-only) TEMPLATE_ONLY="true"; shift 1 ;;
    --full-verify) FULL_VERIFY="true"; shift 1 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

TEMPLATE="$(template_path "$TARGET")"
TMP_CAPTURE="/tmp/privatedao-${TARGET}-capture.json"

if [[ "$TEMPLATE_ONLY" == "true" ]]; then
  cp "$TEMPLATE" "$TMP_CAPTURE"
  echo "Wrote template copy: $TMP_CAPTURE"
  exit 0
fi

if [[ "$SUBMISSION_RESULT" == "success" && -z "$TX_SIGNATURE" ]]; then
  echo "--tx is required when --submission success" >&2
  exit 1
fi

if [[ "$CONNECT_RESULT" != "success" && "$SIGNING_RESULT" == "success" ]]; then
  echo "signing cannot be success when connect failed" >&2
  exit 1
fi

if [[ "$SUBMISSION_RESULT" == "success" ]]; then
  ERROR_MESSAGE_JSON="null"
else
  ERROR_MESSAGE_JSON="\"${ERROR_MESSAGE:-runtime-error}\""
fi

if [[ -n "$EVIDENCE_REFS" ]]; then
  IFS=',' read -r -a _refs <<<"$EVIDENCE_REFS"
  EVIDENCE_JSON_ITEMS=()
  for ref in "${_refs[@]}"; do
    EVIDENCE_JSON_ITEMS+=("\"${ref}\"")
  done
  EVIDENCE_JSON="$(printf '%s\n' "${EVIDENCE_JSON_ITEMS[@]}" | paste -sd, -)"
else
  EVIDENCE_JSON=""
fi

WALLET_LABEL="$(node -e '
const fs = require("fs");
const p = process.argv[1];
const data = JSON.parse(fs.readFileSync(p, "utf8"));
console.log(data.walletLabel);
' "$TEMPLATE")"
ENVIRONMENT_TYPE="$(node -e '
const fs = require("fs");
const p = process.argv[1];
const data = JSON.parse(fs.readFileSync(p, "utf8"));
console.log(data.environmentType);
' "$TEMPLATE")"

cat > "$TMP_CAPTURE" <<EOF
{
  "id": "$TARGET",
  "walletLabel": "$WALLET_LABEL",
  "walletVersion": "$WALLET_VERSION",
  "environmentType": "$ENVIRONMENT_TYPE",
  "os": "$OS_NAME",
  "browserOrClient": "$CLIENT_NAME",
  "network": "devnet",
  "connectResult": "$CONNECT_RESULT",
  "signingResult": "$SIGNING_RESULT",
  "submissionResult": "$SUBMISSION_RESULT",
  "diagnosticsSnapshotCaptured": $DIAGNOSTICS_CAPTURED,
  "txSignature": ${TX_SIGNATURE:+"\"$TX_SIGNATURE\""},
  "errorMessage": $ERROR_MESSAGE_JSON,
  "evidenceRefs": [${EVIDENCE_JSON}],
  "capturedAt": "$CAPTURED_AT"
}
EOF

# Normalize empty txSignature field when not provided.
node -e '
const fs = require("fs");
const p = process.argv[1];
const data = JSON.parse(fs.readFileSync(p, "utf8"));
if (!data.txSignature) data.txSignature = null;
fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n");
' "$TMP_CAPTURE"

echo "Prepared capture payload: $TMP_CAPTURE"
npm run record:real-device-runtime -- "$TMP_CAPTURE"
npm run build:real-device-runtime
npm run verify:real-device-runtime

if [[ "$FULL_VERIFY" == "true" ]]; then
  bash scripts/verify-all.sh
fi

echo "Capture flow complete for $TARGET"
