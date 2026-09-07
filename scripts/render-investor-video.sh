#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

SCENE1="$ASSETS_DIR/scene-01-intro.png"
SCENE2="$ASSETS_DIR/scene-02-problem.png"
SCENE3="$ASSETS_DIR/scene-03-onchain.png"
SCENE4="$ASSETS_DIR/scene-04-zk-refhe.png"
SCENE5="$ASSETS_DIR/scene-05-award.png"
SCENE6="$ASSETS_DIR/scene-06-mainnet.png"
POSTER="$ASSETS_DIR/private-dao-investor-pitch-poster.png"
OUTPUT="$ASSETS_DIR/private-dao-investor-pitch.mp4"

ffmpeg -y -i "$ASSETS_DIR/frontend-hero.png" \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=4:1,eq=brightness=-0.18:saturation=1.15,drawbox=x=0:y=0:w=1280:h=720:color=0x07111D@0.54:t=fill,drawbox=x=70:y=74:w=720:h=190:color=0x040A12@0.38:t=fill,drawbox=x=70:y=430:w=460:h=136:color=0x00E5FF@0.10:t=fill,drawbox=x=860:y=70:w=320:h=112:color=0xFFD86C@0.12:t=fill,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=54:fontcolor=white:x=72:y=92,drawtext=fontfile=$FONT_BOLD:text='Private voting.':fontsize=66:fontcolor=0xFFF1B0:x=72:y=184,drawtext=fontfile=$FONT_BOLD:text='Confidential payouts.':fontsize=64:fontcolor=0x00E5FF:x=72:y=260,drawtext=fontfile=$FONT_REG:text='Solana governance with commit-reveal privacy, zk hardening, and encrypted payroll or bonus approvals.':fontsize=28:fontcolor=0xDCE8F6:x=74:y=346:box=0,drawtext=fontfile=$FONT_BOLD:text='PRODUCT SURFACE':fontsize=24:fontcolor=0xA9F5FF:x=92:y=462,drawtext=fontfile=$FONT_REG:text='govern  ->  approve  ->  timelock  ->  settle':fontsize=24:fontcolor=white:x=92:y=505,drawtext=fontfile=$FONT_BOLD:text='1st Place - Superteam Poland':fontsize=28:fontcolor=0xFFE48A:x=874:y=106" \
  -frames:v 1 -update 1 "$SCENE1"

ffmpeg -y -f lavfi -i "color=c=#070D15:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x09111A:t=fill,drawbox=x=70:y=90:w=1140:h=540:color=0x101720@0.88:t=fill,drawbox=x=86:y=110:w=350:h=44:color=0x431018@0.92:t=fill,drawbox=x=86:y=220:w=430:h=76:color=0x1C0D12@0.96:t=fill,drawbox=x=86:y=320:w=430:h=76:color=0x1C0D12@0.96:t=fill,drawbox=x=86:y=420:w=430:h=76:color=0x1C0D12@0.96:t=fill,drawbox=x=680:y=210:w=430:h=26:color=0x00E5FF@0.15:t=fill,drawbox=x=680:y=280:w=360:h=26:color=0xFF4D6D@0.30:t=fill,drawbox=x=680:y=350:w=510:h=26:color=0xFFB84D@0.24:t=fill,drawbox=x=680:y=420:w=360:h=26:color=0x7E57FF@0.24:t=fill,drawtext=fontfile=$FONT_BOLD:text='Why open operations leak too much':fontsize=52:fontcolor=white:x=84:y=122,drawtext=fontfile=$FONT_REG:text='Visible tallies and public payroll sheets both create pressure before the decision boundary closes.':fontsize=26:fontcolor=0xCAD7E5:x=86:y=182,drawtext=fontfile=$FONT_BOLD:text='Whale pressure':fontsize=32:fontcolor=0xFFD9DE:x=110:y=240,drawtext=fontfile=$FONT_BOLD:text='Vote buying':fontsize=32:fontcolor=0xFFD9DE:x=110:y=340,drawtext=fontfile=$FONT_BOLD:text='Payroll leakage':fontsize=32:fontcolor=0xFFD9DE:x=110:y=440,drawtext=fontfile=$FONT_BOLD:text='LIVE SIGNALS':fontsize=26:fontcolor=0x99F6FF:x=680:y=166,drawtext=fontfile=$FONT_REG:text='YES   62\\%':fontsize=24:fontcolor=0xCDEFFC:x=680:y=244,drawtext=fontfile=$FONT_REG:text='NO    38\\%':fontsize=24:fontcolor=0xFFD6DC:x=680:y=314,drawtext=fontfile=$FONT_REG:text='Treasury action signaled early':fontsize=24:fontcolor=0xFFE8C5:x=680:y=384,drawtext=fontfile=$FONT_REG:text='Comp sheet leaked before approval':fontsize=24:fontcolor=0xD9CCFF:x=680:y=454,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO seals the tally and the payroll manifest boundary.':fontsize=28:fontcolor=0xFFE48A:x=680:y=514" \
  -frames:v 1 -update 1 "$SCENE2"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x06111A@1:t=fill,drawbox=x=74:y=84:w=1132:h=160:color=0x0A1722@0.88:t=fill,drawbox=x=74:y=280:w=1132:h=320:color=0x091520@0.92:t=fill,drawbox=x=100:y=430:w=1080:h=2:color=0x00E5FF@0.35:t=fill,drawtext=fontfile=$FONT_BOLD:text='A new product line: confidential payouts':fontsize=52:fontcolor=white:x=96:y=118,drawtext=fontfile=$FONT_REG:text='Encrypted salary and bonus batches now live beside the private voting lifecycle.':fontsize=28:fontcolor=0xDDEAF7:x=98:y=180,drawtext=fontfile=$FONT_BOLD:text='1. Create proposal + payout plan':fontsize=32:fontcolor=0x00E5FF:x=108:y=328,drawtext=fontfile=$FONT_REG:text='Bind settlement wallet, total amount, recipient count, and immutable manifest hashes.':fontsize=22:fontcolor=white:x=108:y=368,drawtext=fontfile=$FONT_BOLD:text='2. Approve through governance':fontsize=32:fontcolor=0xA9F5FF:x=108:y=454,drawtext=fontfile=$FONT_REG:text='Commit, reveal, finalize, and timelock remain the same safety boundary.':fontsize=22:fontcolor=0xDCE8F6:x=108:y=494,drawtext=fontfile=$FONT_BOLD:text='3. Settle the aggregate batch':fontsize=32:fontcolor=0xFFE48A:x=108:y=548,drawtext=fontfile=$FONT_REG:text='Treasury releases only the approved aggregate amount. The detailed sheet stays encrypted off-chain.':fontsize=22:fontcolor=0xDCE8F6:x=108:y=588" \
  -frames:v 1 -update 1 "$SCENE3"

ffmpeg -y -f lavfi -i "color=c=#120C02:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x120C02:t=fill,drawbox=x=70:y=80:w=1140:h=560:color=0x22110A@0.82:t=fill,drawbox=x=96:y=112:w=340:h=42:color=0x3C1E0D@0.94:t=fill,drawbox=x=96:y=220:w=470:h=82:color=0x141E30@0.96:t=fill,drawbox=x=96:y=334:w=470:h=82:color=0x141E30@0.96:t=fill,drawbox=x=96:y=448:w=470:h=82:color=0x141E30@0.96:t=fill,drawbox=x=670:y=220:w=450:h=300:color=0x0B1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='ZK + REFHE + OPERATIONS':fontsize=24:fontcolor=0xFFE48A:x=114:y=120,drawtext=fontfile=$FONT_BOLD:text='Proposal-level hardening':fontsize=34:fontcolor=white:x=116:y=244,drawtext=fontfile=$FONT_REG:text='zk_enforced receipts can raise the execution boundary for sensitive proposals.':fontsize=22:fontcolor=0xDCE8F6:x=116:y=286,drawtext=fontfile=$FONT_BOLD:text='REFHE-gated settlement':fontsize=34:fontcolor=0xA9F5FF:x=116:y=358,drawtext=fontfile=$FONT_REG:text='Confidential payout plans can require envelope settlement before treasury release.':fontsize=22:fontcolor=0xDCE8F6:x=116:y=400,drawtext=fontfile=$FONT_BOLD:text='Read node + runtime evidence':fontsize=34:fontcolor=0xFFE48A:x=116:y=472,drawtext=fontfile=$FONT_REG:text='Operators get indexed reads, metrics, snapshots, and reviewer-facing runtime surfaces.':fontsize=22:fontcolor=0xDCE8F6:x=116:y=514,drawtext=fontfile=$FONT_BOLD:text='SHIPS TODAY':fontsize=26:fontcolor=0x99F6FF:x=694:y=246,drawtext=fontfile=$FONT_REG:text='- zk review and enforced paths':fontsize=24:fontcolor=white:x=694:y=292,drawtext=fontfile=$FONT_REG:text='- confidential payroll and bonus flows':fontsize=24:fontcolor=white:x=694:y=336,drawtext=fontfile=$FONT_REG:text='- REFHE envelope gating':fontsize=24:fontcolor=white:x=694:y=380,drawtext=fontfile=$FONT_REG:text='- backend read node and ops snapshots':fontsize=24:fontcolor=white:x=694:y=424,drawtext=fontfile=$FONT_REG:text='- Android and browser wallet surfaces':fontsize=24:fontcolor=white:x=694:y=468" \
  -frames:v 1 -update 1 "$SCENE4"

ffmpeg -y -f lavfi -i "color=c=#120C02:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x120C02:t=fill,drawbox=x=50:y=48:w=1180:h=624:color=0x2A1A03@0.55:t=fill,drawbox=x=68:y=66:w=1144:h=588:color=0xFFD86C@0.06:t=fill,drawbox=x=92:y=98:w=390:h=44:color=0x433108@0.88:t=fill,drawbox=x=92:y=455:w=640:h=130:color=0x2A1A03@0.76:t=fill,drawtext=fontfile=$FONT_BOLD:text='VERIFIED 1ST PLACE ACHIEVEMENT':fontsize=24:fontcolor=0xFFE48A:x=112:y=106,drawtext=fontfile=$FONT_BOLD:text='1st Place':fontsize=92:fontcolor=0xFFF0AF:x=104:y=205,drawtext=fontfile=$FONT_BOLD:text='Superteam Poland':fontsize=78:fontcolor=0xFFD86C:x=104:y=298,drawtext=fontfile=$FONT_REG:text='Recognition for rebuilding production backend systems as on-chain Rust programs':fontsize=28:fontcolor=white:x=106:y=388,drawtext=fontfile=$FONT_BOLD:text='Governance, zk hardening, and confidential operations':fontsize=30:fontcolor=0xFFF0AF:x=106:y=492,drawtext=fontfile=$FONT_REG:text='A real repo, a live program surface, and a credible infrastructure thesis.':fontsize=24:fontcolor=0xF8EED5:x=106:y=548" \
  -frames:v 1 -update 1 "$SCENE5"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" -i "$ASSETS_DIR/logo.png" \
  -filter_complex "[1:v]scale=220:220[logo];[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=68:y=86:w=1144:h=548:color=0x0B1722@0.90:t=fill,drawbox=x=92:y=108:w=430:h=44:color=0x0E2733@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='BUILD THE NEXT TRUST LAYER':fontsize=24:fontcolor=0xA9F5FF:x=112:y=116,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=78:fontcolor=white:x=104:y=216,drawtext=fontfile=$FONT_REG:text='From private voting to confidential organizational operations on Solana.':fontsize=28:fontcolor=0xDCE8F6:x=106:y=286,drawtext=fontfile=$FONT_REG:text='The repo already proves governance, payouts, runtime evidence, and a credible release path.':fontsize=28:fontcolor=0xDCE8F6:x=106:y=332,drawtext=fontfile=$FONT_BOLD:text='Why it matters:':fontsize=30:fontcolor=0xFFE48A:x=106:y=420,drawtext=fontfile=$FONT_REG:text='- private governance with real execution':fontsize=26:fontcolor=white:x=132:y=470,drawtext=fontfile=$FONT_REG:text='- confidential payroll, bonus, and REFHE flows':fontsize=26:fontcolor=white:x=132:y=512,drawtext=fontfile=$FONT_REG:text='- a credible infrastructure layer worth backing':fontsize=26:fontcolor=white:x=132:y=554,drawtext=fontfile=$FONT_REG:text='privatedao.org   ·   github.com/X-PACT/PrivateDAO':fontsize=24:fontcolor=0xA9F5FF:x=106:y=618[base];[base][logo]overlay=960:120" \
  -frames:v 1 -update 1 "$SCENE6"

ffmpeg -y \
  -loop 1 -t 6 -i "$SCENE1" \
  -loop 1 -t 6 -i "$SCENE2" \
  -loop 1 -t 7 -i "$SCENE3" \
  -loop 1 -t 7 -i "$SCENE4" \
  -loop 1 -t 6 -i "$SCENE5" \
  -loop 1 -t 7 -i "$SCENE6" \
  -filter_complex "[0:v]fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p[v1];[2:v]fps=30,format=yuv420p[v2];[3:v]fps=30,format=yuv420p[v3];[4:v]fps=30,format=yuv420p[v4];[5:v]fps=30,format=yuv420p[v5];[v0][v1]xfade=transition=fade:duration=1:offset=5[x1];[x1][v2]xfade=transition=fade:duration=1:offset=10[x2];[x2][v3]xfade=transition=fade:duration=1:offset=16[x3];[x3][v4]xfade=transition=fade:duration=1:offset=22[x4];[x4][v5]xfade=transition=fade:duration=1:offset=27,fade=t=in:st=0:d=0.4,fade=t=out:st=32.6:d=0.4[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUTPUT"

cp "$SCENE6" "$POSTER"
rm -f "$SCENE1" "$SCENE2" "$SCENE3" "$SCENE4" "$SCENE5" "$SCENE6"

echo "Rendered investor pitch video:"
echo "  $OUTPUT"
echo "Poster:"
echo "  $POSTER"
