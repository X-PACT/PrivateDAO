#!/usr/bin/env bash
set -euo pipefail

ROOT_DOMAIN="${PRIVATE_DAO_ROOT_DOMAIN:-privatedao.org}"
API_DOMAIN="${PRIVATE_DAO_API_DOMAIN:-api.privatedao.org}"

echo "PrivateDAO public edge health"
echo "Checked at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo

echo "DNS"
for name in "$ROOT_DOMAIN" "www.$ROOT_DOMAIN" "$API_DOMAIN"; do
  printf "%-28s" "$name"
  if command -v dig >/dev/null 2>&1; then
    dig +short "$name" A | paste -sd "," -
  else
    getent ahostsv4 "$name" | awk '{print $1}' | sort -u | paste -sd "," -
  fi
done

echo
echo "HTTP timing"
check_url() {
  local url="$1"
  local expect="${2:-200}"
  local result
  result="$(curl -L -sS -o /dev/null \
    -w "%{http_code} dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s first_byte=%{time_starttransfer}s total=%{time_total}s redirects=%{num_redirects}" \
    --max-time 20 "$url" || true)"
  echo "$url -> $result"
  local code="${result%% *}"
  if [[ "$code" != "$expect" ]]; then
    echo "WARN: expected HTTP $expect for $url but got $code" >&2
  fi
}

check_url "https://$ROOT_DOMAIN/"
check_url "https://www.$ROOT_DOMAIN/"
check_url "https://$ROOT_DOMAIN/judge/"
check_url "https://$ROOT_DOMAIN/services/encrypt-ika-operations/"
check_url "https://$API_DOMAIN/api/v1/readiness"
check_url "https://$API_DOMAIN/api/v1/ika/solana-prealpha/readiness"
check_url "https://$API_DOMAIN/api/v1/cryptographic-readiness"

echo
echo "Interpretation"
echo "- Root/www should resolve to GitHub Pages addresses and return 200."
echo "- API should return JSON 200 for readiness and cryptographic-readiness."
echo "- Any 502/404 on the API routes indicates live backend deployment drift or reverse-proxy health failure."
