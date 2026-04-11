#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="/home/x-pact/Desktop/PrivateDAO-Colosseum-Weekly-Live"
CAPTURES_DIR="$ROOT_DIR/docs/assets/weekly-live-captures"
OUT_DIR="$ROOT_DIR/docs/assets/weekly-youtube-ready"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Colosseum-Weekly-YouTube"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$OUT_DIR" "$DESKTOP_DIR"

SELECTED_WEEKS=("$@")

should_render_week() {
  local week="$1"
  if [ "${#SELECTED_WEEKS[@]}" -eq 0 ]; then
    return 0
  fi

  for selected in "${SELECTED_WEEKS[@]}"; do
    if [ "$selected" = "$week" ]; then
      return 0
    fi
  done

  return 1
}

render_card_clip() {
  local output="$1"
  local bg="$2"
  local header="$3"
  local title="$4"
  local line1="$5"
  local line2="$6"
  local footer="$7"
  local accent="$8"
  local duration="$9"

  ffmpeg -y -loop 1 -t "$duration" -i "$bg" \
    -vf "fps=30,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=1:1,drawbox=x=0:y=0:w=1280:h=720:color=0x06101A@0.30:t=fill,drawbox=x=64:y=72:w=1152:h=576:color=0x050B14@0.44:t=fill,drawbox=x=94:y=96:w=320:h=38:color=${accent}@0.24:t=fill,drawbox=x=94:y=176:w=1094:h=112:color=0x07111A@0.38:t=fill,drawbox=x=94:y=360:w=1094:h=112:color=0x08131E@0.38:t=fill,drawbox=x=94:y=548:w=1094:h=44:color=0x03070D@0.28:t=fill,drawtext=fontfile=$FONT_BOLD:text='${header}':fontsize=22:fontcolor=white:x=114:y=103,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=48:fontcolor=white:x=104:y=194,drawtext=fontfile=$FONT_REG:text='${line1}':fontsize=25:fontcolor=0xE7EEF8:x=108:y=382,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=25:fontcolor=0xE7EEF8:x=108:y=422,drawtext=fontfile=$FONT_BOLD:text='${footer}':fontsize=22:fontcolor=${accent}:x=110:y=554" \
    -an -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p -movflags +faststart "$output"
}

render_voiceover() {
  local textfile="$1"
  local output="$2"
  ffmpeg -y -f lavfi -i "flite=textfile=${textfile}:voice=slt" \
    -af "volume=2.0,highpass=f=120,lowpass=f=3600,atempo=0.94" \
    "$output"
}

render_final_video() {
  local name="$1"
  local base_video="$2"
  local intro_bg="$3"
  local mid_bg="$4"
  local outro_bg="$5"
  local intro_header="$6"
  local intro_title="$7"
  local intro_l1="$8"
  local intro_l2="$9"
  local mid_header="${10}"
  local mid_title="${11}"
  local mid_l1="${12}"
  local mid_l2="${13}"
  local outro_header="${14}"
  local outro_title="${15}"
  local outro_l1="${16}"
  local outro_l2="${17}"
  local accent="${18}"
  local voice_text="${19}"
  local srt_body="${20}"

  local base="$OUT_DIR/${name// /-}"
  local intro_clip="$base-intro.mp4"
  local mid_clip="$base-mid.mp4"
  local outro_clip="$base-outro.mp4"
  local sequence="$base-sequence.mp4"
  local voice_txt="$base-voice.txt"
  local voice_wav="$base-voice.wav"
  local srt="$base.srt"
  local final="$OUT_DIR/$name.mp4"
  local poster="$OUT_DIR/$name-poster.png"

  render_card_clip "$intro_clip" "$intro_bg" "$intro_header" "$intro_title" "$intro_l1" "$intro_l2" "PrivateDAO weekly build update" "$accent" "8"
  render_card_clip "$mid_clip" "$mid_bg" "$mid_header" "$mid_title" "$mid_l1" "$mid_l2" "Live product footage and evidence stay aligned" "$accent" "10"
  render_card_clip "$outro_clip" "$outro_bg" "$outro_header" "$outro_title" "$outro_l1" "$outro_l2" "privatedao.org  ·  Solana Devnet  ·  Frontier 2026" "$accent" "10"

  ffmpeg -y \
    -i "$intro_clip" \
    -i "$base_video" \
    -i "$mid_clip" \
    -i "$outro_clip" \
    -filter_complex "[0:v][1:v][2:v][3:v]concat=n=4:v=1:a=0[v]" \
    -map "[v]" -an -c:v libx264 -preset ultrafast -crf 28 -pix_fmt yuv420p -movflags +faststart "$sequence"

  cat >"$voice_txt" <<EOF
$voice_text
EOF

  cat >"$srt" <<EOF
$srt_body
EOF

  render_voiceover "$voice_txt" "$voice_wav"

  ffmpeg -y -i "$sequence" -i "$voice_wav" \
    -vf "subtitles='${srt}':force_style='FontName=DejaVu Sans,FontSize=22,PrimaryColour=&H00F7F7F7,BackColour=&H70000000,OutlineColour=&H00000000,BorderStyle=3,Outline=0,Shadow=0,MarginV=24'" \
    -af "apad=pad_dur=60" \
    -map 0:v -map 1:a -c:v libx264 -preset ultrafast -crf 28 -c:a aac -b:a 160k -shortest -movflags +faststart "$final"

  ffmpeg -y -ss 00:00:04 -i "$final" -frames:v 1 "$poster"
  cp "$final" "$DESKTOP_DIR/$name.mp4"
  cp "$poster" "$DESKTOP_DIR/$name - Poster.png"
}

if should_render_week 1; then
render_final_video \
  "Week 1 - PrivateDAO Frontier Hackathon - YouTube Ready" \
  "$SRC_DIR/Week 1 - PrivateDAO Frontier Hackathon - Live Devnet Governance Progress.mp4" \
  "$CAPTURES_DIR/home.png" \
  "$CAPTURES_DIR/command-center.png" \
  "$CAPTURES_DIR/dashboard.png" \
  "WEEK 1" \
  "Live Devnet governance progress" \
  "PrivateDAO is already a wallet-first governance product on Solana." \
  "Week one proves the foundation is live, not theoretical." \
  "WHAT WORKS NOW" \
  "Guided command center plus private voting flow" \
  "The product already shows command center, dashboard, and runtime posture." \
  "This gives judges a real operating surface from the first week." \
  "NEXT BUILD" \
  "Trust, buyer flow, and track packaging" \
  "The next step is sharpening trust surfaces and commercial routes." \
  "The live product remains the center of the story." \
  "0x00E5FF" \
  "PrivateDAO is already live on Solana Devnet as a wallet-first governance product. In week one, the important proof is simple. The command center is real, the governance path is visible, and the product already reads like infrastructure instead of a mockup. This week is about showing product momentum clearly. Next, we keep building trust surfaces, buyer routes, and sharper competition packaging on top of the same live core." \
  "1
00:00:00,000 --> 00:00:08,000
PrivateDAO is already live on Solana Devnet.

2
00:00:08,000 --> 00:00:18,500
Week one shows a real product shell, not a mockup.

3
00:00:18,500 --> 00:00:28,500
The command center and private voting flow are already visible.

4
00:00:28,500 --> 00:00:38,500
Dashboard and runtime posture stay attached to the product itself.

5
00:00:38,500 --> 00:00:46,500
Next we sharpen trust, buyer flow, and track packaging."
fi

if should_render_week 2; then
render_final_video \
  "Week 2 - PrivateDAO Frontier Hackathon - YouTube Ready" \
  "$SRC_DIR/Week 2 - PrivateDAO Frontier Hackathon - Guided Governance And Private Voting.mp4" \
  "$CAPTURES_DIR/command-center.png" \
  "$CAPTURES_DIR/dashboard.png" \
  "$CAPTURES_DIR/security.png" \
  "WEEK 2" \
  "Guided governance and private voting" \
  "Week two focuses on usability and the commit-reveal path." \
  "The product is becoming easier to trust and easier to review." \
  "WHAT IMPROVED" \
  "Proposal flow, dashboard clarity, and private vote posture" \
  "PrivateDAO now makes governance actions feel more guided and coherent." \
  "The privacy wedge stays readable inside the same live app." \
  "NEXT BUILD" \
  "Commercial routing plus stronger trust surfaces" \
  "The next layer is buyer motion, service packaging, and clearer trust." \
  "The live product keeps carrying the full story." \
  "0x7E57FF" \
  "Week two is about making guided governance easier to understand and easier to trust. Proposal flow, private voting, dashboard clarity, and the surrounding product shell are now more coherent inside one live app. PrivateDAO still keeps the same core wedge: commit now, reveal later, and execute with clearer operational boundaries. From here, the next step is stronger commercial routing and stronger trust packaging on top of the same working product." \
  "1
00:00:00,000 --> 00:00:08,000
Week two focuses on guided governance and private voting.

2
00:00:08,000 --> 00:00:18,500
Proposal flow and command center coherence are stronger.

3
00:00:18,500 --> 00:00:28,500
Dashboard and private voting remain part of one live product shell.

4
00:00:28,500 --> 00:00:38,500
The core wedge stays commit now, reveal later, execute safely.

5
00:00:38,500 --> 00:00:46,500
Next comes commercial routing and stronger trust packaging."
fi

if should_render_week 3; then
render_final_video \
  "Week 3 - PrivateDAO Frontier Hackathon - YouTube Ready" \
  "$SRC_DIR/Week 3 - PrivateDAO Frontier Hackathon - Treasury And Trust Surfaces.mp4" \
  "$CAPTURES_DIR/home.png" \
  "$CAPTURES_DIR/security.png" \
  "$CAPTURES_DIR/command-center.png" \
  "WEEK 3" \
  "Treasury and trust surfaces" \
  "Week three pushes the product beyond protocol-only framing." \
  "Governance, treasury, and trust are now easier to read together." \
  "WHAT EXPANDS" \
  "Security posture plus treasury execution narrative" \
  "PrivateDAO now shows hardening and trust boundaries inside the product shell." \
  "The buyer and operator story is getting stronger." \
  "NEXT BUILD" \
  "Launch trust and clearer mainnet discipline" \
  "The next step is more explicit readiness and launch credibility." \
  "PrivateDAO should read like a serious company-grade product." \
  "0x22C55E" \
  "Week three pushes PrivateDAO beyond protocol-only framing. Governance, treasury execution, security posture, and trust boundaries now read together as one product. The point is not to narrate complexity. The point is to make sensitive governance and treasury behavior easier to trust for judges, buyers, and operators. From here, the next step is sharper launch trust and clearer mainnet discipline around the same live Solana Devnet product." \
  "1
00:00:00,000 --> 00:00:08,000
Week three connects treasury and trust more clearly.

2
00:00:08,000 --> 00:00:18,500
Governance, treasury execution, and security posture read together.

3
00:00:18,500 --> 00:00:28,500
Trust boundaries are now visible inside the live product shell.

4
00:00:28,500 --> 00:00:38,500
This strengthens both the buyer story and the operator story.

5
00:00:38,500 --> 00:00:46,500
Next comes launch trust and clearer mainnet discipline."
fi

if should_render_week 4; then
render_final_video \
  "Week 4 - PrivateDAO Frontier Hackathon - YouTube Ready" \
  "$SRC_DIR/Week 4 - PrivateDAO Frontier Hackathon - Launch Trust And Mainnet Discipline.mp4" \
  "$CAPTURES_DIR/security.png" \
  "$CAPTURES_DIR/dashboard.png" \
  "$CAPTURES_DIR/home.png" \
  "WEEK 4" \
  "Launch trust and mainnet discipline" \
  "Week four is about credibility, not empty hype." \
  "The product now frames readiness and boundaries more explicitly." \
  "WHAT MATTERS" \
  "Runtime visibility, trust surfaces, and bounded advanced layers" \
  "PrivateDAO keeps proof, execution posture, and launch discipline connected." \
  "This is how the product should be judged going into final review." \
  "FINAL POSITION" \
  "A serious governance infrastructure product on Solana" \
  "PrivateDAO now reads like a company-grade product with a clear path." \
  "That is the posture required for a first-place submission." \
  "0xFFE48A" \
  "Week four is about credibility. PrivateDAO now shows launch trust, runtime visibility, advanced layers, and explicit operational boundaries inside the same product shell. That matters because final review should not depend on hype. It should depend on whether the product reads like serious infrastructure. The goal is simple: private governance, treasury execution, trust, and product coherence should all point to the same conclusion that this deserves first-place consideration." \
  "1
00:00:00,000 --> 00:00:08,000
Week four is about launch trust and real credibility.

2
00:00:08,000 --> 00:00:18,500
Readiness, runtime visibility, and trust surfaces stay connected.

3
00:00:18,500 --> 00:00:28,500
Advanced layers are framed as bounded product capabilities.

4
00:00:28,500 --> 00:00:38,500
The product should now read like serious infrastructure, not hype.

5
00:00:38,500 --> 00:00:46,500
That is the posture required for a first-place submission."
fi

echo "Rendered YouTube-ready weekly videos into:"
echo "  $OUT_DIR"
echo "Copied upload-ready assets into:"
echo "  $DESKTOP_DIR"
