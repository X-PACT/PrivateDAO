#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

bash "$ROOT_DIR/scripts/render-frontier-overview-video.sh"

mkdir -p \
  "$ROOT_DIR/assets" \
  "$ROOT_DIR/docs/assets" \
  "$ROOT_DIR/apps/web/public/assets" \
  "/home/x-pact/Desktop/PrivateDAO-Product-Overview"

cp "$ROOT_DIR/assets/private-dao-frontier-overview.mp4" \
  "$ROOT_DIR/assets/private-dao-product-overview.mp4"
cp "$ROOT_DIR/assets/private-dao-frontier-overview-poster.png" \
  "$ROOT_DIR/assets/private-dao-product-overview-poster.png"
cp "$ROOT_DIR/docs/assets/private-dao-frontier-overview.mp4" \
  "$ROOT_DIR/docs/assets/private-dao-product-overview.mp4"
cp "$ROOT_DIR/docs/assets/private-dao-frontier-overview-poster.png" \
  "$ROOT_DIR/docs/assets/private-dao-product-overview-poster.png"
cp "$ROOT_DIR/apps/web/public/assets/private-dao-frontier-overview.mp4" \
  "$ROOT_DIR/apps/web/public/assets/private-dao-product-overview.mp4"
cp "$ROOT_DIR/apps/web/public/assets/private-dao-frontier-overview-poster.png" \
  "$ROOT_DIR/apps/web/public/assets/private-dao-product-overview-poster.png"
cp "$ROOT_DIR/assets/private-dao-frontier-overview.mp4" \
  "/home/x-pact/Desktop/PrivateDAO-Product-Overview/PrivateDAO - Product Overview - Everything We Offer and Why Us.mp4"
cp "$ROOT_DIR/assets/private-dao-frontier-overview-poster.png" \
  "/home/x-pact/Desktop/PrivateDAO-Product-Overview/PrivateDAO - Product Overview - Poster.png"

echo "Rendered product overview aliases:"
echo "  $ROOT_DIR/assets/private-dao-product-overview.mp4"
echo "  $ROOT_DIR/assets/private-dao-product-overview-poster.png"
echo "  /home/x-pact/Desktop/PrivateDAO-Product-Overview/PrivateDAO - Product Overview - Everything We Offer and Why Us.mp4"
