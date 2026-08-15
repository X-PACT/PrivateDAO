#!/usr/bin/env bash
set -euo pipefail

# New product videos for the commercial shell. This intentionally does not call
# any of the historical product-video renderers.
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/apps/web/public/assets/product-videos"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

FONT="$(fc-match -f '%{file}' 'Space Grotesk' 2>/dev/null || true)"
if [[ -z "$FONT" || ! -f "$FONT" ]]; then
  FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
fi
LOGO="$ROOT_DIR/apps/web/public/assets/logo.png"
mkdir -p "$OUT_DIR"

render_product() {
  local slug="$1" kicker="$2" title="$3" value="$4" flow="$5" cta="$6" accent="$7"
  local product_dir="$TMP_DIR/$slug"
  mkdir -p "$product_dir"
  printf '%s\n' "$kicker" > "$product_dir/kicker.txt"
  printf '%s\n' "$title" | fold -w 34 -s > "$product_dir/title.txt"
  printf '%s\n' "$value" | fold -w 66 -s > "$product_dir/value.txt"
  printf '%s\n' "$flow" | fold -w 52 -s > "$product_dir/flow.txt"
  printf '%s\n' "$cta" | fold -w 28 -s > "$product_dir/cta.txt"

  local scene
  for scene in 1 2 3; do
    local headline_file="$product_dir/title.txt"
    local body_file="$product_dir/value.txt"
    local label_file="$product_dir/kicker.txt"
    local button_file="$product_dir/cta.txt"
    case "$scene" in
      2) body_file="$product_dir/flow.txt"; label_file="$product_dir/flow.txt" ;;
      3) headline_file="$product_dir/cta.txt"; body_file="$product_dir/value.txt"; label_file="$product_dir/kicker.txt" ;;
    esac
    ffmpeg -hide_banner -loglevel error -y \
      -f lavfi -i "color=c=0x050817:s=1280x720:r=30:d=4" \
      -i "$LOGO" \
      -filter_complex "[1:v]scale=116:-1,format=rgba[logo];[0:v][logo]overlay=82:66,drawbox=x=82:y=248:w=1116:h=2:color=$accent@0.8:t=fill,drawtext=fontfile=$FONT:textfile=$label_file:fontcolor=$accent:fontsize=22:x=88:y=132,drawtext=fontfile=$FONT:textfile=$headline_file:fontcolor=white:fontsize=56:line_spacing=10:x=88:y=188,drawtext=fontfile=$FONT:textfile=$body_file:fontcolor=0xd8e2f2:fontsize=28:line_spacing=10:x=88:y=390:enable='between(t,0,3.8)',drawtext=fontfile=$FONT:textfile=$button_file:fontcolor=white:fontsize=22:box=1:boxcolor=$accent@0.18:boxborderw=18:x=88:y=610:enable='gte(t,2.4)'" \
      -frames:v 120 -c:v libx264 -preset medium -crf 27 -pix_fmt yuv420p -movflags +faststart \
      "$product_dir/scene-$scene.mp4"
  done

  printf "file '%s'\nfile '%s'\nfile '%s'\n" "$product_dir/scene-1.mp4" "$product_dir/scene-2.mp4" "$product_dir/scene-3.mp4" > "$product_dir/concat.txt"
  ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i "$product_dir/concat.txt" \
    -c copy -movflags +faststart "$OUT_DIR/$slug.mp4"
  ffmpeg -hide_banner -loglevel error -y -i "$OUT_DIR/$slug.mp4" -frames:v 1 -vf "scale=1280:720" \
    "$OUT_DIR/$slug-poster.png"
}

render_product "blind-verification" "PRIVATE VERIFICATION" "Prove the rule. Keep the input private." \
  "For compliance, HR, grants, and finance teams that need a trusted answer without exposing sensitive data." \
  "Choose a policy  /  verify privately  /  share the result" "Start a verification pilot" "0x22d3ee"

render_product "record-verification" "RECORD VERIFICATION" "Turn critical records into trusted evidence." \
  "Submit a structured record, apply the right policy, and give every stakeholder a receipt they can check." \
  "Submit a record  /  validate  /  share a public receipt" "Request a record verification pilot" "0x34d399"

render_product "private-governance" "PRIVATE GOVERNANCE" "Make important decisions without public pressure." \
  "For DAOs, foundations, and councils that need private review, accountable voting, and a clear final result." \
  "Create a proposal  /  vote privately  /  verify execution" "Open the governance flow" "0xa78bfa"

render_product "sealed-auctions" "PRIVATE AUCTIONS" "Find the best offer without leaking the market." \
  "For procurement, grants, and agent marketplaces where losing bids and live ranking should stay private." \
  "Invite bidders  /  collect sealed offers  /  publish the final result" "Explore sealed auctions" "0xf59e0b"

render_product "treasury-coordination" "TREASURY COORDINATION" "Move funds with context, approval, and evidence." \
  "For protocol and DAO finance teams that need a reviewable path from request to accountable execution." \
  "Review the request  /  approve the policy  /  keep an evidence trail" "Talk to the treasury team" "0x60a5fa"

echo "Built new commercial product videos in $OUT_DIR"
