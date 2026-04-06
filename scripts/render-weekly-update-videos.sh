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

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 2 UPDATE" "Private governance is already live" "DAO bootstrap, proposal creation, commit, reveal, finalize, and execute now run" "through the same wallet-connected Devnet product surface." "Week 2 proves the governance core is not a mockup." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "PRIVATE VOTING" "Commit-reveal stays proposal-bound" "Votes stay hidden during commit, reveal later with salt, and only then reach" "deterministic finalization plus timelocked treasury execution." "Hidden intent, explicit lifecycle, real signatures." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "ZK HARDENING" "zk_enforced is now visible in-product" "Proposal-level stronger receipts for vote, delegation, and tally are surfaced" "directly in the UI and operator flows." "The proof path now changes review posture, not just docs." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "READ PATH" "Backend-indexed runtime trust" "Diagnostics, backend reads, and runtime evidence reduce direct browser RPC stress" "without moving write authority away from the wallet." "Read infrastructure now supports the governance product itself." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "WEEK 2 RESULT" "A real governance operating surface" "Week 2 closes the private governance core, zk hardening surface, and backend" "runtime path into one coherent Solana product." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

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

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 3 UPDATE" "Confidential treasury is now productized" "PrivateDAO moved beyond private voting into encrypted payroll and bonus" "approvals tied directly to proposal execution." "Week 3 is where treasury privacy became real product surface." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "CONFIDENTIAL PAYROLL" "Encrypted payout plans are live" "Each proposal can now bind settlement wallet, recipient count, total amount," "ciphertext hash, and immutable manifest hashes." "Sensitive compensation data stays off-chain while governance stays on-chain." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "MAGICBLOCK + REFHE" "Two gated payout routes" "MagicBlock corridors harden confidential token payouts, while REFHE envelopes" "gate encrypted evaluation before treasury release." "Sensitive flows now have explicit settlement boundaries." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "OPS VISIBILITY" "Runtime evidence grows with the feature set" "Backend snapshots, MagicBlock runtime intake, and operator docs now track" "confidential operations as first-class review surfaces." "Product polish and reviewer trust now advance together." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "WEEK 3 RESULT" "Private voting became private operations" "Week 3 closes confidential payroll, bonus approval, MagicBlock corridor, and" "REFHE-gated settlement into one treasury workflow." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

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

  scene "$s1" "$ASSETS_DIR/frontend-hero.png" "WEEK 4 UPDATE" "Hardening for scale and launch discipline" "The final week focuses on operational scale, evidence surfaces, and the exact" "blockers that remain outside the repo before mainnet." "Week 4 is about credibility under pressure." "0x00E5FF"
  scene "$s2" "$ASSETS_DIR/frontend-hero.png" "350-WALLET PROFILE" "Wave testing is structured, not improvised" "Fifty wallets per wave across seven waves mix happy paths with invalid reveals," "late reveals, replay attempts, and authority mismatch attempts." "Success is measured by clean rejection and recovery under load." "0xFFE48A"
  scene "$s3" "$ASSETS_DIR/frontend-hero.png" "RUNTIME + REVIEW" "Evidence is now a first-class feature" "Runtime attestations, audit packets, read-node snapshots, MagicBlock runtime" "packages, and go-live surfaces all stay machine-verifiable." "Inspection is built into the repo, not deferred to slides." "0x7E57FF"
  scene "$s4" "$ASSETS_DIR/frontend-hero.png" "HONEST BOUNDARY" "External steps are explicit" "Real-device captures, external audit closure, and the final canonical verifier" "boundary decision still sit outside the codebase." "What remains is operational execution, not missing architecture." "0x22C55E"
  scene "$s5" "$ASSETS_DIR/frontend-hero.png" "WEEK 4 RESULT" "A credible mainnet-path product" "Week 4 shows private governance, confidential treasury operations, reviewer" "artifacts, and scale discipline living in one Solana product." "x-pact.github.io/PrivateDAO  ·  github.com/X-PACT/PrivateDAO" "0xA9F5FF"

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
