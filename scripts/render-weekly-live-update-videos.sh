#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
CAPTURES_DIR="$ASSETS_DIR/weekly-live-captures"
UPDATES_DIR="$ASSETS_DIR/weekly-updates-live"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Colosseum-Weekly-Live"
DEMO_VIDEO="/home/x-pact/Desktop/PrivateDAO-Demo-Video/PrivateDAO - Real Demo Flow - Create DAO Submit Proposal Private Vote Execute Treasury - Clean.mp4"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$UPDATES_DIR" "$DESKTOP_DIR"

ensure_capture() {
  local name="$1"
  local url="$2"
  local out="$CAPTURES_DIR/$name.png"

  if [[ -f "$out" ]]; then
    return 0
  fi

  mkdir -p "$CAPTURES_DIR"
  timeout 25s google-chrome \
    --headless=new \
    --no-sandbox \
    --disable-gpu \
    --hide-scrollbars \
    --window-size=1440,1024 \
    --virtual-time-budget=8000 \
    --screenshot="$out" \
    "$url" >/dev/null 2>&1 || true

  if [[ ! -f "$out" ]]; then
    echo "Missing capture: $out" >&2
    exit 1
  fi
}

render_still_scene() {
  local output="$1"
  local bg="$2"
  local header="$3"
  local title="$4"
  local line1="$5"
  local line2="$6"
  local footer="$7"
  local accent="$8"

  ffmpeg -y -i "$bg" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=1:1,drawbox=x=0:y=0:w=1280:h=720:color=0x050B14@0.34:t=fill,drawbox=x=64:y=72:w=1152:h=576:color=0x050C14@0.42:t=fill,drawbox=x=92:y=94:w=340:h=40:color=${accent}@0.24:t=fill,drawbox=x=92:y=176:w=1096:h=108:color=0x09131E@0.34:t=fill,drawbox=x=92:y=350:w=1096:h=122:color=0x08111A@0.34:t=fill,drawbox=x=92:y=548:w=1096:h=44:color=0x03070D@0.30:t=fill,drawtext=fontfile=$FONT_BOLD:text='${header}':fontsize=22:fontcolor=white:x=112:y=102,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=48:fontcolor=white:x=102:y=194,drawtext=fontfile=$FONT_REG:text='${line1}':fontsize=26:fontcolor=0xE5EEF8:x=106:y=372,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=26:fontcolor=0xE5EEF8:x=106:y=414,drawtext=fontfile=$FONT_BOLD:text='${footer}':fontsize=22:fontcolor=${accent}:x=108:y=555" \
    -frames:v 1 -update 1 "$output"
}

render_video_scene() {
  local output="$1"
  local start="$2"
  local duration="$3"
  local header="$4"
  local title="$5"
  local line1="$6"
  local line2="$7"
  local accent="$8"

  ffmpeg -y -ss "$start" -t "$duration" -i "$DEMO_VIDEO" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,drawbox=x=0:y=0:w=1280:h=720:color=0x040812@0.28:t=fill,drawbox=x=70:y=70:w=1140:h=76:color=0x050C14@0.46:t=fill,drawbox=x=70:y=540:w=1140:h=108:color=0x050C14@0.50:t=fill,drawbox=x=92:y=90:w=240:h=34:color=${accent}@0.24:t=fill,drawtext=fontfile=$FONT_BOLD:text='${header}':fontsize=20:fontcolor=white:x=108:y=95,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=36:fontcolor=white:x=96:y=555,drawtext=fontfile=$FONT_REG:text='${line1}':fontsize=22:fontcolor=0xE5EEF8:x=98:y=598,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=22:fontcolor=0xE5EEF8:x=98:y=626" \
    -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$output"
}

compose_video() {
  local output="$1"
  local poster="$2"
  shift 2
  local scenes=("$@")

  ffmpeg -y \
    -loop 1 -t 7 -i "${scenes[0]}" \
    -loop 1 -t 7 -i "${scenes[1]}" \
    -i "${scenes[2]}" \
    -loop 1 -t 7 -i "${scenes[3]}" \
    -loop 1 -t 7 -i "${scenes[4]}" \
    -filter_complex "[0:v]fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p[v1];[2:v]fps=30,format=yuv420p[v2];[3:v]fps=30,format=yuv420p[v3];[4:v]fps=30,format=yuv420p[v4];[v0][v1]xfade=transition=fade:duration=0.8:offset=6.2[x1];[x1][v2]xfade=transition=fade:duration=0.8:offset=12.4[x2];[x2][v3]xfade=transition=fade:duration=0.8:offset=18.6[x3];[x3][v4]xfade=transition=fade:duration=0.8:offset=24.8,fade=t=in:st=0:d=0.25,fade=t=out:st=30.6:d=0.4[v]" \
    -map "[v]" -an -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$output"

  cp "${scenes[4]}" "$poster"
}

copy_upload_asset() {
  local video="$1"
  local poster="$2"
  local title="$3"

  cp "$video" "$DESKTOP_DIR/$title.mp4"
  cp "$poster" "$DESKTOP_DIR/$title - Poster.png"
}

render_week1() {
  local base="$UPDATES_DIR/live-week-1"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.png"
  local s3="$base-scene-3.mp4"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-1-live-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-1-live-update-poster.png"

  render_still_scene "$s1" "$CAPTURES_DIR/home.png" "WEEK 1 UPDATE" "PrivateDAO is already a live Devnet product" "The product shell is public, wallet-first, and already shaped like governance" "infrastructure instead of a hackathon mockup." "Live product momentum on Solana." "0x00E5FF"
  render_still_scene "$s2" "$CAPTURES_DIR/command-center.png" "COMMAND CENTER" "Normal users can enter one guided operating surface" "Private voting, proof, diagnostics, and commercial rails now sit inside one" "clear route instead of being fragmented across tools." "Product coherence is visible from week one." "0x22C55E"
  render_video_scene "$s3" 4 6 "LIVE DEMO" "Core governance flow is already working" "Create DAO, submit proposal, commit private vote, and move toward execution." "The demo is not slideware; it is a real product sequence." "0xFFE48A"
  render_still_scene "$s4" "$CAPTURES_DIR/dashboard.png" "OPERATIONS" "The dashboard already reads like an operating product" "Treasury posture, execution visibility, and runtime thinking are already part" "of the interface shown to reviewers and future operators." "A serious operating shell is already visible." "0x7E57FF"
  render_still_scene "$s5" "$CAPTURES_DIR/home.png" "NEXT" "Week 1 closes with a credible foundation" "Next we deepen trust, buyer routes, and competition-specific packaging on top" "of the same live Devnet base." "privatedao.org  ·  Frontier Week 1" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s2" "$s3" "$s4" "$s5"
  copy_upload_asset "$video" "$poster" "Week 1 - PrivateDAO Frontier Hackathon - Live Devnet Governance Progress"
}

render_week2() {
  local base="$UPDATES_DIR/live-week-2"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.mp4"
  local s3="$base-scene-3.png"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-2-live-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-2-live-update-poster.png"

  render_still_scene "$s1" "$CAPTURES_DIR/command-center.png" "WEEK 2 UPDATE" "Governance flow is becoming easier to trust" "The command center now packages actions, proof, and operational guidance in one" "route that normal users can actually follow." "Week 2 sharpens the working path." "0x00E5FF"
  render_video_scene "$s2" 9 6 "PROPOSALS" "Proposal creation is no longer abstract" "Treasury actions and advanced layers stay visible before signing." "The app explains what matters while the user is still in flow." "0x22C55E"
  render_still_scene "$s3" "$CAPTURES_DIR/dashboard.png" "DASHBOARD" "Execution visibility stays close to governance state" "Proposal state, timelines, and readiness cues remain part of the product shell" "instead of being hidden behind reviewer-only docs." "Operational UX is getting tighter." "0x7E57FF"
  render_still_scene "$s4" "$CAPTURES_DIR/security.png" "PRIVATE VOTE" "Commit and reveal remain the core wedge" "Private intent stays protected during commit, while proof, hardening, and launch" "boundaries remain visible in the same product shell." "The privacy thesis stays legible to judges." "0xFFE48A"
  render_still_scene "$s5" "$CAPTURES_DIR/command-center.png" "NEXT" "Week 2 builds toward stronger trust surfaces" "The next layer is deeper commercial routing, service packaging, and proof-aware" "buyer motion on top of the same governance core." "privatedao.org  ·  Frontier Week 2" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s3" "$s2" "$s4" "$s5"
  copy_upload_asset "$video" "$poster" "Week 2 - PrivateDAO Frontier Hackathon - Guided Governance And Private Voting"
}

render_week3() {
  local base="$UPDATES_DIR/live-week-3"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.mp4"
  local s3="$base-scene-3.png"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-3-live-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-3-live-update-poster.png"

  render_still_scene "$s1" "$CAPTURES_DIR/home.png" "WEEK 3 UPDATE" "Private governance is expanding into product corridors" "The site now packages governance, treasury, services, and buyer routes as one" "commercially legible operating system." "Week 3 pushes beyond protocol-only framing." "0x00E5FF"
  render_video_scene "$s2" 19 6 "TREASURY" "Execution stays attached to the proposal lifecycle" "Finalize, timelock, and treasury release remain connected to the same path." "Confidential operations still keep explicit execution discipline." "0xFFE48A"
  render_still_scene "$s3" "$CAPTURES_DIR/security.png" "SECURITY" "Hardening and launch boundaries stay visible" "V3 hardening, proof anchors, and trust boundaries are now exposed in-product" "instead of being treated as hidden technical baggage." "Trust is becoming part of the UX." "0x22C55E"
  render_still_scene "$s4" "$CAPTURES_DIR/dashboard.png" "OPERATIONS" "Runtime posture stays readable" "Execution visibility and diagnostics remain close to the governance surface." "Reviewer trust and operator trust stay aligned." "Runtime trust is now visible inside the product shell." "0x7E57FF"
  render_still_scene "$s5" "$CAPTURES_DIR/home.png" "NEXT" "Week 3 strengthens the buyer and operator story" "The next step is tighter evidence, stronger launch trust, and clearer mainnet" "discipline around the same live product." "privatedao.org  ·  Frontier Week 3" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s3" "$s2" "$s4" "$s5"
  copy_upload_asset "$video" "$poster" "Week 3 - PrivateDAO Frontier Hackathon - Treasury And Trust Surfaces"
}

render_week4() {
  local base="$UPDATES_DIR/live-week-4"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.png"
  local s3="$base-scene-3.mp4"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-4-live-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-4-live-update-poster.png"

  render_still_scene "$s1" "$CAPTURES_DIR/security.png" "WEEK 4 UPDATE" "Mainnet posture must be earned, not narrated" "The product now shows launch boundaries, trust surfaces, and proof continuity" "more explicitly inside the same operating shell." "Week 4 is about credibility." "0x00E5FF"
  render_still_scene "$s2" "$CAPTURES_DIR/dashboard.png" "RUNTIME" "Visibility stays attached to execution posture" "Diagnostics, readiness, and buyer pathways now reinforce the same operational" "surface instead of fragmenting across separate narratives." "Execution context is getting tighter." "0x22C55E"
  render_video_scene "$s3" 24 5 "ADVANCED LAYERS" "Privacy and infrastructure layers are now legible" "ZK, REFHE, MagicBlock, and fast RPC are framed as bounded product layers." "This keeps the track story stronger and more honest." "0xFFE48A"
  render_still_scene "$s4" "$CAPTURES_DIR/command-center.png" "PRODUCT" "The command center remains the core demo corridor" "The best path still begins with the live product and ends in proof, trust, and" "operational credibility." "The product shell leads the submission story." "0x7E57FF"
  render_still_scene "$s5" "$CAPTURES_DIR/home.png" "RESULT" "PrivateDAO now reads like a real company-grade product" "Live governance, treasury execution, trust surfaces, and commercial corridors" "now reinforce the same Frontier submission." "privatedao.org  ·  Frontier Week 4" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s2" "$s3" "$s4" "$s5"
  copy_upload_asset "$video" "$poster" "Week 4 - PrivateDAO Frontier Hackathon - Launch Trust And Mainnet Discipline"
}

ensure_capture "home" "https://privatedao.org/"
ensure_capture "command-center" "https://privatedao.org/command-center/"
ensure_capture "dashboard" "https://privatedao.org/dashboard/"
ensure_capture "security" "https://privatedao.org/security/"

if [[ $# -eq 0 ]]; then
  set -- 1 2 3 4
fi

for week in "$@"; do
  case "$week" in
    1) render_week1 ;;
    2) render_week2 ;;
    3) render_week3 ;;
    4) render_week4 ;;
    *) echo "Unknown week: $week" >&2; exit 1 ;;
  esac
done

echo "Rendered live weekly update videos into:"
echo "  $UPDATES_DIR"
echo "Copied upload-ready live assets into:"
echo "  $DESKTOP_DIR"
