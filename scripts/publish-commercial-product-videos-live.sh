#!/usr/bin/env bash
set -euo pipefail

# Deliberately narrow live publish: static video assets and page sections only.
# It does not touch APIs, containers, databases, wallets, or environment files.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOST="${PRIVATE_DAO_LIVE_HOST:-13.63.101.160}"
USER_NAME="${PRIVATE_DAO_LIVE_USER:-ec2-user}"
SSH_KEY="${PRIVATE_DAO_SSH_KEY:?Set PRIVATE_DAO_SSH_KEY to the temporary/approved SSH key path}"
REMOTE_ROOT="${PRIVATE_DAO_LIVE_ROOT:-/home/ec2-user/PrivateDAO}"
REMOTE_SITE="$REMOTE_ROOT/deploy/primary-host/volumes/site"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
SSH=(ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/privatedao-live-known_hosts -o ConnectTimeout=12 "$USER_NAME@$HOST")
SCP=(scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/tmp/privatedao-live-known_hosts)

"${SSH[@]}" "mkdir -p '$REMOTE_ROOT/.release-staging/product-videos-$STAMP' '$REMOTE_SITE/assets/product-videos' '$REMOTE_SITE/products/record-verification'"
"${SSH[@]}" "tar -czf '$REMOTE_ROOT/.release-staging/product-videos-$STAMP/rollback.tar.gz' -C '$REMOTE_SITE' products/index.html govern/index.html treasury/index.html auctions/index.html proof-workflows/blind-policy/index.html products/record-verification 2>/dev/null || true"
"${SCP[@]}" "$ROOT_DIR/apps/web/public/assets/product-videos/"*.mp4 "$ROOT_DIR/apps/web/public/assets/product-videos/"*.png "$USER_NAME@$HOST:$REMOTE_SITE/assets/product-videos/"
"${SCP[@]}" "$ROOT_DIR/apps/web/public/record-verification-live.html" "$USER_NAME@$HOST:$REMOTE_SITE/products/record-verification/index.html"
"${SCP[@]}" "$ROOT_DIR/scripts/inject-live-product-video-sections.py" "$USER_NAME@$HOST:$REMOTE_ROOT/.release-staging/product-videos-$STAMP/"
"${SSH[@]}" "python3 '$REMOTE_ROOT/.release-staging/product-videos-$STAMP/inject-live-product-video-sections.py' '$REMOTE_SITE' '$STAMP'"
"${SSH[@]}" "docker exec privatedao-primary-host-edge-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile >/dev/null"

echo "Published commercial product videos to $HOST; rollback archive: $REMOTE_ROOT/.release-staging/product-videos-$STAMP/rollback.tar.gz"
