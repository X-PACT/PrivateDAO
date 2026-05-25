#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Judge-Readiness-Video"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
OUTPUT="$ASSETS_DIR/private-dao-judge-readiness-3min.mp4"
POSTER="$ASSETS_DIR/private-dao-judge-readiness-3min-poster.png"
VOICE_TEXT="$ASSETS_DIR/private-dao-judge-readiness-3min-voice.txt"
VOICE_WAV="$ASSETS_DIR/private-dao-judge-readiness-3min-voice.wav"
SILENT_OUTPUT="$ASSETS_DIR/private-dao-judge-readiness-3min-silent.mp4"
PUBLIC_ASSETS_DIR="$ROOT_DIR/apps/web/public/assets"
PUBLIC_OUTPUT="$PUBLIC_ASSETS_DIR/private-dao-judge-readiness-3min.mp4"
PUBLIC_POSTER="$PUBLIC_ASSETS_DIR/private-dao-judge-readiness-3min-poster.png"
DESKTOP_OUTPUT="$DESKTOP_DIR/PrivateDAO - Judge Readiness 3 Minute Demo.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/PrivateDAO - Judge Readiness 3 Minute Demo - Poster.png"
EDGE_TTS_BIN="${EDGE_TTS_BIN:-/tmp/pdao-media-venv/bin/edge-tts}"
EDGE_TTS_VOICE="${EDGE_TTS_VOICE:-en-US-JennyNeural}"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Missing dependency: ffmpeg" >&2
  echo "Install on Ubuntu/Debian: sudo apt-get update && sudo apt-get install -y ffmpeg fonts-dejavu-core" >&2
  echo "Fallback: use docs/judge-readiness-video.md as the shot list and record the live app manually." >&2
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
    -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x040712:t=fill,drawbox=x=34:y=32:w=1212:h=656:color=0x0A1220@0.96:t=fill,drawbox=x=34:y=32:w=1212:h=10:color=${accent}@0.95:t=fill,drawbox=x=82:y=82:w=320:h=44:color=${accent}@0.18:t=fill,drawtext=fontfile=$FONT_BOLD:text='${kicker}':fontsize=24:fontcolor=${accent}:x=98:y=92,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=54:fontcolor=white:x=82:y=166,drawtext=fontfile=$FONT_REG:text='${subtitle}':fontsize=27:fontcolor=0xCFE8FF:x=86:y=240,drawbox=x=86:y=336:w=1098:h=214:color=0x111827@0.98:t=fill,drawtext=fontfile=$FONT_BOLD:text='${line1}':fontsize=33:fontcolor=${accent}:x=118:y=372,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=27:fontcolor=white:x=118:y=434,drawtext=fontfile=$FONT_REG:text='${line3}':fontsize=27:fontcolor=white:x=118:y=492,drawtext=fontfile=$FONT_REG:text='${footer}':fontsize=23:fontcolor=0xB8C7D9:x=86:y=628" \
    -frames:v 1 -update 1 "$scene"
}

render_voiceover() {
  local textfile="$1"
  local output="$2"

  if [ -x "$EDGE_TTS_BIN" ]; then
    local temp_mp3
    temp_mp3="$(mktemp --suffix=.mp3)"
    "$EDGE_TTS_BIN" --voice "$EDGE_TTS_VOICE" --file "$textfile" --write-media "$temp_mp3" >/dev/null
    ffmpeg -y -i "$temp_mp3" -af "volume=1.55,highpass=f=120,lowpass=f=3800,atempo=0.97" "$output" >/dev/null 2>&1
    rm -f "$temp_mp3"
    return
  fi

  ffmpeg -y -f lavfi -i "flite=textfile=${textfile}:voice=slt" \
    -af "volume=1.9,highpass=f=120,lowpass=f=3600,atempo=0.94" \
    "$output"
}

create_scene "01" "PRIVATEDAO READINESS" "Three minute judge demo" "A concise English readiness asset for judges, partners, and Arena reviewers." "What changed is not only UI polish." "The stack now connects awards, proof, backend rebuild, privacy services, and mainnet-candidate discipline." "This reel stays honest: Testnet proof now, real-funds launch after external gates." "PrivateDAO | private governance, confidential treasury, verifiable execution" "0x14F195"
create_scene "02" "AWARDS AND SIGNAL" "External validation" "PrivateDAO has earned real competition signal while continuing to harden the product." "Superteam Poland: 1st place." "UAE Frontier Hackathon: 3rd place." "Currently selected in Arena, with the product and proof story still moving." "Award signal is context, not a substitute for runtime evidence." "0xFFE48A"
create_scene "03" "PRODUCT ENTRY" "Wallet first operating shell" "The demo path starts where a normal operator starts: connect, review, sign, verify." "Create DAO, submit proposal, private vote, and execute treasury stay in one product path." "No terminal is required for the judge story." "The interface points users toward proof instead of asking for trust." "Route focus: /start, /govern, /proof, /story" "0x00E5FF"
create_scene "04" "BACKEND REBUILD" "From prototype to service spine" "The backend has been rebuilt around API readiness, indexed evidence, and operational telemetry." "Hosted read surfaces and service pages make PrivateDAO understandable beyond a hackathon demo." "Diagnostics, freshness, and runtime packets reduce reviewer ambiguity." "The product can now explain what happened, when, and where the proof lives." "Backend claim boundary: readiness and Testnet proof, not production SLA until monitored live." "0x38BDF8"
create_scene "05" "ENCRYPTION EVERYWHERE" "Privacy across services" "PrivateDAO frames privacy as a service boundary, not a marketing badge." "Governance, payroll, rewards, compliance, and confidential payments each get scoped disclosure." "ZK, REFHE, MagicBlock, Umbra style lanes, and viewing-key logic are kept legible." "The user sees what stays private and what becomes reviewable evidence." "Privacy posture: disclose only what the operation requires." "0xA78BFA"
create_scene "06" "INTELLIGENCE LAYER" "Before the wallet prompt" "The intelligence layer helps operators understand risk and context before they sign." "QVAC local reasoning, GoldRush style wallet context, route previews, and policy checks support the review step." "The goal is not autonomous funds movement." "The goal is clear human approval with bounded automation and visible guardrails." "Review first, sign second, verify after execution." "0x06B6D4"
create_scene "07" "TESTNET PROOF" "Evidence, not slideware" "PrivateDAO keeps the proof path visible through Testnet artifacts and reviewer packets." "DAO lifecycle, vote phases, treasury gates, and receipt continuity are documented as proof surfaces." "Judges can inspect the proof center, documents, diagnostics, and runtime evidence." "The demo should show receipts and boundaries side by side." "Proof route: /proof/?judge=1" "0x22C55E"
create_scene "08" "MAINNET CANDIDATE" "Ready without overclaiming" "The system is mainnet-candidate in architecture and product readiness." "Real-funds launch still depends on external audit, production authority transfer, monitoring, and operator ownership." "That boundary is a strength." "It shows PrivateDAO is serious enough to say what remains before unrestricted mainnet use." "Candidate does not mean externally audited or unrestricted real-funds clearance." "0xF59E0B"
create_scene "09" "SERVICE CORRIDORS" "Commercial paths are now visible" "PrivateDAO now explains how the same stack becomes usable services." "Confidential payments, hosted reads, reviewer evidence, diagnostics, and encrypted execution corridors can be inspected." "Services are connected to proof and pricing language." "The buyer route no longer depends on a founder narrating every detail." "Route focus: /services, /pricing, /documents" "0x60A5FA"
create_scene "10" "JUDGE STORY" "What to show in three minutes" "Lead with readiness, then show the product path, then prove the boundary." "Open the app, connect the Testnet wallet, review an operation, then move to proof." "Close on awards, Arena selection, backend rebuild, privacy services, and mainnet-candidate gates." "Every claim should map to a visible route or document." "Narrative rule: product first, evidence second, honest boundary always." "0xFB7185"
create_scene "11" "WHY IT MATTERS" "Private operations need public confidence" "DAOs need private voting and confidential treasury execution without losing accountability." "PrivateDAO turns that tension into a product workflow." "The operator gets privacy. The reviewer gets evidence. The ecosystem gets a safer launch path." "That is the readiness story." "Private governance should be usable, inspectable, and launch disciplined." "0x14F195"
create_scene "12" "CLOSE" "PrivateDAO is ready for serious review" "Awards prove signal. Testnet proof proves motion. The rebuilt backend proves operational direction." "Encryption and intelligence now span the service story." "The remaining launch gates are explicit, which makes the project stronger." "Watch live at privatedao.org and inspect the proof path before judging." "PrivateDAO | selected in Arena | Testnet proof live | mainnet-candidate path explicit" "0x00E5FF"

cat >"$VOICE_TEXT" <<'EOF'
PrivateDAO is ready for a serious three minute judge review.
The story is no longer just private governance. It is a product, a backend, a proof surface, and a launch discipline.

The project already has real external signal: first place at Superteam Poland, third place at the UAE Frontier Hackathon, and current Arena selection.
That signal matters, but the demo still leads with what can be inspected.

Start with the product path. A normal operator can connect a Testnet wallet, review the action, sign, and verify the result.
Create DAO, submit proposal, private vote, and execute treasury remain part of one operating shell.

The backend has been rebuilt around API readiness, indexed evidence, diagnostics, telemetry, and service corridors.
That makes PrivateDAO easier to judge, easier to operate, and easier to package for partners.

Privacy is handled as a service boundary. Governance, payroll, rewards, compliance, confidential payments, and scoped disclosure each explain what stays private and what becomes reviewable evidence.

The intelligence layer supports human approval before the wallet prompt.
Local reasoning, wallet context, route previews, and policy checks help the signer understand risk before funds or authority move.

The proof path stays visible. Testnet evidence, proof documents, runtime packets, diagnostics, and reviewer routes show where claims can be checked.

PrivateDAO is mainnet-candidate in architecture and product readiness, but it does not overclaim.
Real-funds launch still needs external audit, production authority transfer, monitoring, and operator ownership.

That is the readiness story: awards prove signal, Testnet proof proves motion, the rebuilt backend proves operating direction, and explicit launch gates prove discipline.
EOF

ffmpeg -y \
  -framerate 1/15 -start_number 1 -i "$ASSETS_DIR/judge-readiness-scene-%02d.png" \
  -vf "fps=5,format=yuv420p" \
  -c:v libx264 -preset veryfast -movflags +faststart "$SILENT_OUTPUT"

render_voiceover "$VOICE_TEXT" "$VOICE_WAV"

ffmpeg -y -i "$SILENT_OUTPUT" -i "$VOICE_WAV" \
  -af "apad=pad_dur=180" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$OUTPUT"

cp "$ASSETS_DIR/judge-readiness-scene-12.png" "$POSTER"
cp "$OUTPUT" "$PUBLIC_OUTPUT"
cp "$POSTER" "$PUBLIC_POSTER"
cp "$OUTPUT" "$DESKTOP_OUTPUT"
cp "$POSTER" "$DESKTOP_POSTER"
rm -f "$ASSETS_DIR"/judge-readiness-scene-*.png "$SILENT_OUTPUT" "$VOICE_TEXT" "$VOICE_WAV"

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
