#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Judge-Readiness-Video"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
OUTPUT="$ASSETS_DIR/private-dao-judge-readiness-3min.mp4"
POSTER="$ASSETS_DIR/private-dao-judge-readiness-3min-poster.png"
VIDEO_ONLY="$ASSETS_DIR/private-dao-judge-readiness-3min-video-only.mp4"
MUSIC_WAV="$ASSETS_DIR/private-dao-judge-readiness-3min-music.wav"
PUBLIC_ASSETS_DIR="$ROOT_DIR/apps/web/public/assets"
PUBLIC_OUTPUT="$PUBLIC_ASSETS_DIR/private-dao-judge-readiness-3min.mp4"
PUBLIC_POSTER="$PUBLIC_ASSETS_DIR/private-dao-judge-readiness-3min-poster.png"
DESKTOP_OUTPUT="$DESKTOP_DIR/PrivateDAO - Judge Readiness 3 Minute Demo.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/PrivateDAO - Judge Readiness 3 Minute Demo - Poster.png"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Missing dependency: ffmpeg" >&2
  echo "Install on Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y ffmpeg fonts-dejavu-core" >&2
  exit 1
fi

if [[ ! -f "$FONT_BOLD" || ! -f "$FONT_REG" ]]; then
  echo "Missing dependency: DejaVu fonts" >&2
  echo "Install on Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y fonts-dejavu-core" >&2
  exit 1
fi

mkdir -p "$ASSETS_DIR" "$DESKTOP_DIR" "$PUBLIC_ASSETS_DIR"

create_scene() {
  local index="$1"
  local kicker="$2"
  local title="$3"
  local subtitle="$4"
  local line1="$5"
  local line2="$6"
  local line3="$7"
  local footer="$8"
  local accent="$9"
  local scene="$ASSETS_DIR/judge-readiness-scene-${index}.png"

  ffmpeg -y -f lavfi -i "color=c=#040712:s=1280x720" \
    -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x040712:t=fill,drawbox=x=40:y=34:w=1200:h=652:color=0x0A1220@0.96:t=fill,drawbox=x=40:y=34:w=1200:h=10:color=${accent}@0.95:t=fill,drawbox=x=86:y=82:w=430:h=44:color=${accent}@0.16:t=fill,drawtext=fontfile=$FONT_BOLD:text='${kicker}':fontsize=22:fontcolor=${accent}:x=104:y=93,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=45:fontcolor=white:x=86:y=160,drawtext=fontfile=$FONT_REG:text='${subtitle}':fontsize=23:fontcolor=0xCFE8FF:x=90:y=226,drawbox=x=86:y=318:w=1108:h=224:color=0x111827@0.98:t=fill,drawtext=fontfile=$FONT_BOLD:text='${line1}':fontsize=28:fontcolor=${accent}:x=118:y=356,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=24:fontcolor=white:x=118:y=424,drawtext=fontfile=$FONT_REG:text='${line3}':fontsize=24:fontcolor=white:x=118:y=482,drawtext=fontfile=$FONT_REG:text='${footer}':fontsize=21:fontcolor=0xB8C7D9:x=86:y=628" \
    -frames:v 1 -update 1 "$scene"
}

create_music() {
  ffmpeg -y \
    -f lavfi -i "sine=frequency=110:duration=180" \
    -f lavfi -i "sine=frequency=220:duration=180" \
    -f lavfi -i "sine=frequency=330:duration=180" \
    -f lavfi -i "sine=frequency=440:duration=180" \
    -filter_complex "[0:a]volume=0.13[a0];[1:a]volume=0.055[a1];[2:a]volume=0.03[a2];[3:a]volume=0.018[a3];[a0][a1][a2][a3]amix=inputs=4:duration=longest,highpass=f=70,lowpass=f=5800,afade=t=in:st=0:d=3,afade=t=out:st=176:d=4[a]" \
    -map "[a]" "$MUSIC_WAV"
}

create_scene "01" "PRIVATEDAO READINESS" "Three minute judge demo" "Product, proof, backend, privacy, and launch discipline." "Not only a DAO interface." "Private operations now connect to proof, APIs, services, and Testnet evidence." "The reel stays honest: Testnet proof now, mainnet after gates." "PrivateDAO | confidential governance | verifiable execution" "0x14F195"
create_scene "02" "AWARDS AND SIGNAL" "External validation" "Competition signal plus active hardening." "Superteam Poland: first place." "UAE Frontier Hackathon: third place." "Arena selection: product and proof story still moving." "Awards are context. Runtime evidence remains the proof." "0xFFE48A"
create_scene "03" "PRODUCT ENTRY" "Wallet first operating shell" "The user path is connect, review, sign, verify." "Governance, payroll, rewards, and proof stay in one product." "No terminal is needed for the judge story." "Every major action points back to a proof surface." "Routes: /start /govern /services /proof /judge" "0x00E5FF"
create_scene "04" "BACKEND REBUILD" "Service spine is visible" "APIs, readiness, telemetry, and evidence now support the UI." "Hosted read routes explain what happened and where proof lives." "Freshness and diagnostics reduce reviewer ambiguity." "The backend is part of the product, not a hidden demo script." "Readiness route: /api/v1/readiness" "0x38BDF8"
create_scene "05" "ENCRYPTION ROUTE" "Run privacy from the page" "Encrypt / Ika is now a runnable operating lane." "Browser encryption and REFHE payroll receipts execute from the UI." "Ika readiness and 2PC-MPC approval prep are visible as gates." "Final Ika funded dWallet signing is named, not overclaimed." "Route: /services/encrypt-ika-operations" "0xA78BFA"
create_scene "06" "INTELLIGENCE LAYER" "Before the wallet prompt" "The signer sees risk, context, and policy before approval." "Local reasoning, wallet context, and route previews guide decisions." "Automation remains bounded by human review." "The goal is better signing, not blind fund movement." "Review first. Sign second. Verify after execution." "0x06B6D4"
create_scene "07" "TESTNET PROOF" "Evidence, not slideware" "Receipts, transactions, documents, and counters stay reachable." "ZK, REFHE, MagicBlock, Token-2022, and Squads proof routes are visible." "Judges can inspect the proof center and runtime packets." "Claims map to routes, receipts, or explicit remaining gates." "Proof route: /proof/?judge=1" "0x22C55E"
create_scene "08" "MAINNET CANDIDATE" "Ready without overclaiming" "Architecture and product are shaped for mainnet readiness." "External audit, monitoring, authority closure, and operator ownership remain gates." "That boundary protects users and reviewers." "Serious launch discipline is part of the product story." "Candidate means prepared, not unrestricted real-funds clearance." "0xF59E0B"
create_scene "09" "SERVICE CORRIDORS" "Commercial paths are clear" "Confidential payments, payroll, intelligence, and proof are packaged." "Each service explains the problem, workflow, and evidence route." "The buyer path no longer needs founder narration." "The site can sell the operating system by itself." "Routes: /services /pricing /documents" "0x60A5FA"
create_scene "10" "JUDGE STORY" "What to inspect first" "Start with the product, then run a track, then verify proof." "Open Judge, choose a service, connect wallet where needed, inspect receipts." "Close on awards, encryption, backend, and launch gates." "The page is designed for a three minute evaluation window." "Canonical route: /judge" "0xFB7185"
create_scene "11" "WHY IT MATTERS" "Private operations need public confidence" "DAOs need private decisions without losing accountability." "Operators get privacy. Reviewers get evidence." "The ecosystem gets a safer launch path." "PrivateDAO turns that tension into a product workflow." "Usable. Inspectable. Launch disciplined." "0x14F195"
create_scene "12" "CLOSE" "PrivateDAO is ready for serious review" "Awards prove signal. Testnet proof proves motion." "The rebuilt backend proves operational direction." "Encryption and intelligence now span the service story." "Inspect the live product and proof path before judging." "PrivateDAO | Arena selected | Testnet proof live" "0x00E5FF"

ffmpeg -y \
  -framerate 1/15 -start_number 1 -i "$ASSETS_DIR/judge-readiness-scene-%02d.png" \
  -vf "fps=5,format=yuv420p" \
  -c:v libx264 -preset veryfast -movflags +faststart "$VIDEO_ONLY"

create_music

ffmpeg -y -i "$VIDEO_ONLY" -i "$MUSIC_WAV" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$OUTPUT"

cp "$ASSETS_DIR/judge-readiness-scene-12.png" "$POSTER"
cp "$OUTPUT" "$PUBLIC_OUTPUT"
cp "$POSTER" "$PUBLIC_POSTER"
cp "$OUTPUT" "$DESKTOP_OUTPUT"
cp "$POSTER" "$DESKTOP_POSTER"
rm -f "$ASSETS_DIR"/judge-readiness-scene-*.png "$VIDEO_ONLY" "$MUSIC_WAV"

echo "Rendered judge readiness video:"
echo "  $OUTPUT"
echo "Poster:"
echo "  $POSTER"
echo "Desktop copies:"
echo "  $DESKTOP_OUTPUT"
echo "  $DESKTOP_POSTER"
echo "Public web assets:"
echo "  $PUBLIC_OUTPUT"
echo "  $PUBLIC_POSTER"
