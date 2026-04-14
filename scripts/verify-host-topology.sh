#!/usr/bin/env bash
set -euo pipefail

PRIMARY_URL="${1:-https://privatedao.org/}"
BACKUP_URL="${2:-https://x-pact.github.io/PrivateDAO/}"
STRICT_MODE="${PRIVATE_DAO_STRICT_HOST_TOPOLOGY:-0}"

fetch_headers() {
  local url="$1"
  curl -sSI -L --max-redirs 5 "$url"
}

primary_headers="$(fetch_headers "$PRIMARY_URL")"
backup_headers="$(fetch_headers "$BACKUP_URL")"

primary_server="$(printf '%s\n' "$primary_headers" | awk -F': ' 'tolower($1)=="server" {print $2}' | tail -n1 | tr -d '\r')"
backup_server="$(printf '%s\n' "$backup_headers" | awk -F': ' 'tolower($1)=="server" {print $2}' | tail -n1 | tr -d '\r')"

primary_is_github=0
backup_is_github=0

if printf '%s\n' "$primary_server" | grep -qi 'github'; then
  primary_is_github=1
fi

if printf '%s\n' "$backup_server" | grep -qi 'github'; then
  backup_is_github=1
fi

echo "Host topology check"
echo "  Primary URL: $PRIMARY_URL"
echo "  Primary server: ${primary_server:-unknown}"
echo "  Backup URL: $BACKUP_URL"
echo "  Backup server: ${backup_server:-unknown}"

if [[ "$primary_is_github" -eq 1 ]]; then
  echo "  Current topology: primary is still served by GitHub Pages"
else
  echo "  Current topology: primary is served by an independent host"
fi

if [[ "$backup_is_github" -eq 1 ]]; then
  echo "  Backup topology: GitHub Pages mirror detected"
else
  echo "  Backup topology: backup host is not GitHub Pages"
fi

if [[ "$STRICT_MODE" == "1" && "$primary_is_github" -eq 1 ]]; then
  echo "Strict host topology check failed: privatedao.org is still served by GitHub Pages." >&2
  exit 1
fi
