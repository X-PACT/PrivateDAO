#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
UPDATES_DIR="$ASSETS_DIR/weekly-updates"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Weekly-Updates"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$UPDATES_DIR" "$DESKTOP_DIR"

scene() {
  local out="$1"
  local bg="$2"
  local header="$3"
  local title="$4"
  local line1="$5"
  local line2="$6"
  local footer="$7"
  local accent="$8"

  ffmpeg -y -i "$bg" \
    -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=4:1,eq=brightness=-0.20:saturation=1.10,drawbox=x=0:y=0:w=1280:h=720:color=0x07111D@0.68:t=fill,drawbox=x=76:y=84:w=1128:h=552:color=0x08141F@0.58:t=fill,drawbox=x=100:y=110:w=360:h=42:color=${accent}@0.28:t=fill,drawbox=x=100:y=205:w=1040:h=120:color=0x040A12@0.32:t=fill,drawbox=x=100:y=370:w=1040:h=136:color=0x0B1722@0.34:t=fill,drawbox=x=100:y=544:w=1040:h=46:color=0x040A12@0.32:t=fill,drawtext=fontfile=$FONT_BOLD:text='${header}':fontsize=24:fontcolor=white:x=118:y=118,drawtext=fontfile=$FONT_BOLD:text='${title}':fontsize=56:fontcolor=white:x=108:y=225,drawtext=fontfile=$FONT_REG:text='${line1}':fontsize=28:fontcolor=0xDCE8F6:x=112:y=392,drawtext=fontfile=$FONT_REG:text='${line2}':fontsize=28:fontcolor=0xDCE8F6:x=112:y=438,drawtext=fontfile=$FONT_BOLD:text='${footer}':fontsize=24:fontcolor=${accent}:x=114:y=554" \
    -frames:v 1 -update 1 "$out"
}

compose_video() {
  local output="$1"
  local poster="$2"
  shift 2
  local scenes=("$@")

  ffmpeg -y \
    -loop 1 -t 8 -i "${scenes[0]}" \
    -loop 1 -t 8 -i "${scenes[1]}" \
    -loop 1 -t 8 -i "${scenes[2]}" \
    -loop 1 -t 8 -i "${scenes[3]}" \
    -loop 1 -t 8 -i "${scenes[4]}" \
    -filter_complex "[0:v]fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p[v1];[2:v]fps=30,format=yuv420p[v2];[3:v]fps=30,format=yuv420p[v3];[4:v]fps=30,format=yuv420p[v4];[v0][v1]xfade=transition=fade:duration=1:offset=7[x1];[x1][v2]xfade=transition=fade:duration=1:offset=14[x2];[x2][v3]xfade=transition=fade:duration=1:offset=21[x3];[x3][v4]xfade=transition=fade:duration=1:offset=28,fade=t=in:st=0:d=0.3,fade=t=out:st=35.5:d=0.5[v]" \
    -map "[v]" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$output"

  cp "${scenes[4]}" "$poster"
}

render_week2() {
  local base="$UPDATES_DIR/week-2"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.png"
  local s3="$base-scene-3.png"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-2-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-2-update-poster.png"

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 2 UPDATE" "Core governance is live" "Wallet-connected Devnet flows are active across DAO creation, treasury funding," "proposal creation, commit, reveal, finalize, and execute." "PrivateDAO ships a real governance surface, not a static demo." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "PRIVATE VOTING" "Commit-reveal is the core" "Votes stay hidden during the live window, then reveal later for deterministic" "finalization and timelocked treasury execution." "Private voting without giving up execution safety." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "ZK HARDENING" "Review path to enforcement" "Proposal-level zk_enforced flows now expose stronger receipts for vote," "delegation, and tally readiness inside the product itself." "Cryptography is part of the lifecycle, not a side note." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "RUNTIME + BACKEND" "Operators can inspect live state" "Diagnostics, runtime evidence, and the backend read node reduce direct browser" "RPC dependence and make review paths easier to verify." "Operational visibility is shipping alongside protocol logic." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "NEXT TARGET" "From Devnet proof to mainnet discipline" "Week 2 proves the core governance product, the wallet UX, and the first" "cryptographic hardening layer are already live together." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s2" "$s3" "$s4" "$s5"
  cp "$video" "$DESKTOP_DIR/"
  cp "$poster" "$DESKTOP_DIR/"
  rm -f "$s1" "$s2" "$s3" "$s4" "$s5"
}

render_week3() {
  local base="$UPDATES_DIR/week-3"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.png"
  local s3="$base-scene-3.png"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-3-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-3-update-poster.png"

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 3 UPDATE" "Confidential operations are now visible" "PrivateDAO moved beyond private voting into confidential payroll and bonus" "approvals tied directly to proposal execution." "Week 3 is about product expansion, not just UI polish." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "CONFIDENTIAL PAYROLL" "Encrypted payout plans" "A proposal can now carry a confidential payout plan with settlement wallet," "recipient count, total amount, and immutable manifest hashes." "Sensitive compensation data stays off-chain while approval stays on-chain." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "REFHE SETTLEMENT" "Envelope gating before release" "Confidential payout execution can require REFHE settlement before treasury" "release, adding a stronger control boundary for sensitive operations." "Aggregate treasury movement now respects a stricter settlement path." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "BACKEND READ NODE" "Product + ops now scale together" "Indexed reads, ops snapshots, and metrics give the frontend a safer read path" "while keeping wallet-signed writes and trust boundaries intact." "The backend is there to read and verify, not to take control." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "NEXT TARGET" "Toward large-scale validation" "Week 3 closes the confidential operations layer and prepares the product for" "audit prep, wave testing, and stronger production review." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s2" "$s3" "$s4" "$s5"
  cp "$video" "$DESKTOP_DIR/"
  cp "$poster" "$DESKTOP_DIR/"
  rm -f "$s1" "$s2" "$s3" "$s4" "$s5"
}

render_week4() {
  local base="$UPDATES_DIR/week-4"
  local s1="$base-scene-1.png"
  local s2="$base-scene-2.png"
  local s3="$base-scene-3.png"
  local s4="$base-scene-4.png"
  local s5="$base-scene-5.png"
  local video="$UPDATES_DIR/private-dao-week-4-update.mp4"
  local poster="$UPDATES_DIR/private-dao-week-4-update-poster.png"

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 4 UPDATE" "Hardening for mainnet readiness" "The final week focuses on operational scale, review surfaces, and the exact" "blockers that still sit outside the repo before a mainnet cutover." "Week 4 is about credibility under pressure." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "350-WALLET PLAN" "Scale testing is designed, not improvised" "The load profile is organized as fifty wallets across seven waves, with happy" "and negative paths mixed into the same saturation run." "The real test is measured rejection and recovery, not vanity throughput." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "REVIEW SURFACES" "Evidence is part of the product" "Runtime attestations, audit packets, cryptographic manifests, and go-live" "snapshots now track the system in reviewer-visible form." "Inspection is built into the repo, not left for later." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "WHAT STILL REMAINS" "External execution, not missing architecture" "The remaining gaps are real-device captures, external audit closure, and the" "final canonical verifier boundary decision for the strongest path." "The product is ready for scrutiny, not pretending to be finished." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "MAINNET DIRECTION" "Private governance with real operations" "Week 4 shows a product that already unifies private voting, confidential" "treasury actions, runtime evidence, and a credible mainnet discipline." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

  compose_video "$video" "$poster" "$s1" "$s2" "$s3" "$s4" "$s5"
  cp "$video" "$DESKTOP_DIR/"
  cp "$poster" "$DESKTOP_DIR/"
  rm -f "$s1" "$s2" "$s3" "$s4" "$s5"
}

render_week2
render_week3
render_week4

echo "Rendered weekly update videos into:"
echo "  $UPDATES_DIR"
echo "Copied upload-ready assets into:"
echo "  $DESKTOP_DIR"
