#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Demo-Video"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$ASSETS_DIR" "$DESKTOP_DIR"

SCENE1="$ASSETS_DIR/demo-scene-01.png"
SCENE2="$ASSETS_DIR/demo-scene-02.png"
SCENE3="$ASSETS_DIR/demo-scene-03.png"
SCENE4="$ASSETS_DIR/demo-scene-04.png"
SCENE5="$ASSETS_DIR/demo-scene-05.png"
SCENE6="$ASSETS_DIR/demo-scene-06.png"
SCENE7="$ASSETS_DIR/demo-scene-07.png"
POSTER="$ASSETS_DIR/private-dao-demo-flow-poster.png"
OUTPUT="$ASSETS_DIR/private-dao-demo-flow.mp4"
DESKTOP_MP4="$DESKTOP_DIR/PrivateDAO - Real Demo Flow - Create DAO Submit Proposal Private Vote Execute Treasury.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/PrivateDAO - Real Demo Flow - Poster.png"

ffmpeg -y -i "$ASSETS_DIR/frontend-hero.png" \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=5:1,eq=brightness=-0.22:saturation=1.12,drawbox=x=0:y=0:w=1280:h=720:color=0x07111D@0.62:t=fill,drawbox=x=64:y=72:w=760:h=208:color=0x051019@0.46:t=fill,drawbox=x=64:y=476:w=540:h=142:color=0x00E5FF@0.10:t=fill,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=58:fontcolor=white:x=72:y=92,drawtext=fontfile=$FONT_BOLD:text='Real product demo':fontsize=62:fontcolor=0xFFF1B0:x=72:y=176,drawtext=fontfile=$FONT_REG:text='Create DAO. Submit proposal. Private vote. Execute treasury.':fontsize=30:fontcolor=0xDCE8F6:x=74:y=264,drawtext=fontfile=$FONT_BOLD:text='FRONTIER READY':fontsize=24:fontcolor=0xA9F5FF:x=88:y=504,drawtext=fontfile=$FONT_REG:text='Governance + confidential treasury + runtime evidence':fontsize=24:fontcolor=white:x=88:y=548" \
  -frames:v 1 -update 1 "$SCENE1"

ffmpeg -y -f lavfi -i "color=c=#07111D:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x07111D:t=fill,drawbox=x=70:y=78:w=1140:h=564:color=0x0B1722@0.88:t=fill,drawbox=x=94:y=104:w=300:h=42:color=0x0F2733@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='STEP 1':fontsize=24:fontcolor=0xA9F5FF:x=110:y=112,drawtext=fontfile=$FONT_BOLD:text='Create DAO':fontsize=64:fontcolor=white:x=104:y=198,drawtext=fontfile=$FONT_REG:text='A wallet-connected operator creates a DAO, mints governance power, and starts from a clean treasury boundary.':fontsize=28:fontcolor=0xDCE8F6:x=106:y=270,drawbox=x=106:y=356:w=460:h=86:color=0x122432@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='DAO bootstrap console':fontsize=32:fontcolor=0xFFF1B0:x=126:y=382,drawtext=fontfile=$FONT_REG:text='name  quorum  reveal window  execution delay':fontsize=22:fontcolor=white:x=126:y=424,drawbox=x=680:y=220:w=430:h=260:color=0x07111D@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='What matters':fontsize=28:fontcolor=0x00E5FF:x=704:y=244,drawtext=fontfile=$FONT_REG:text='- real wallet signature':fontsize=24:fontcolor=white:x=704:y=298,drawtext=fontfile=$FONT_REG:text='- real governance mint':fontsize=24:fontcolor=white:x=704:y=340,drawtext=fontfile=$FONT_REG:text='- real treasury path':fontsize=24:fontcolor=white:x=704:y=382,drawtext=fontfile=$FONT_REG:text='- no disconnected setup state':fontsize=24:fontcolor=white:x=704:y=424" \
  -frames:v 1 -update 1 "$SCENE2"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=68:y=84:w=1144:h=548:color=0x091520@0.90:t=fill,drawbox=x=94:y=110:w=300:h=42:color=0x122432@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='STEP 2':fontsize=24:fontcolor=0xA9F5FF:x=110:y=118,drawtext=fontfile=$FONT_BOLD:text='Submit proposal':fontsize=64:fontcolor=white:x=104:y=204,drawtext=fontfile=$FONT_REG:text='A governance-token holder creates a proposal with a standard treasury action or a confidential payout path.':fontsize=28:fontcolor=0xDCE8F6:x=106:y=276,drawbox=x=104:y=344:w=508:h=192:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Builder presets':fontsize=30:fontcolor=0xFFF1B0:x=126:y=374,drawtext=fontfile=$FONT_REG:text='standard grant':fontsize=24:fontcolor=white:x=126:y=422,drawtext=fontfile=$FONT_REG:text='confidential payroll':fontsize=24:fontcolor=white:x=126:y=460,drawtext=fontfile=$FONT_REG:text='confidential bonus':fontsize=24:fontcolor=white:x=126:y=498,drawtext=fontfile=$FONT_REG:text='private token distribution':fontsize=24:fontcolor=white:x=126:y=536,drawbox=x=700:y=320:w=420:h=210:color=0x0A1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Advanced layers stay visible':fontsize=28:fontcolor=0x00E5FF:x=724:y=348,drawtext=fontfile=$FONT_REG:text='ZK, REFHE, MagicBlock, and':fontsize=24:fontcolor=white:x=724:y=398,drawtext=fontfile=$FONT_REG:text='backend-indexed RPC are':fontsize=24:fontcolor=white:x=724:y=438,drawtext=fontfile=$FONT_REG:text='explained before signing.':fontsize=24:fontcolor=white:x=724:y=478" \
  -frames:v 1 -update 1 "$SCENE3"

ffmpeg -y -f lavfi -i "color=c=#120C02:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x120C02:t=fill,drawbox=x=68:y=84:w=1144:h=548:color=0x22110A@0.88:t=fill,drawbox=x=94:y=110:w=320:h=42:color=0x3C1E0D@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='STEP 3':fontsize=24:fontcolor=0xFFE48A:x=110:y=118,drawtext=fontfile=$FONT_BOLD:text='Private vote':fontsize=64:fontcolor=white:x=104:y=204,drawtext=fontfile=$FONT_REG:text='The vote is committed privately, then revealed only in the valid phase. The tally becomes meaningful only after the reveal boundary.':fontsize=28:fontcolor=0xF6E7D1:x=106:y=276,drawbox=x=106:y=350:w=500:h=182:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Commit':fontsize=30:fontcolor=0x00E5FF:x=126:y=382,drawtext=fontfile=$FONT_REG:text='vote hash + salt + proposal binding':fontsize=22:fontcolor=white:x=126:y=422,drawtext=fontfile=$FONT_BOLD:text='Reveal':fontsize=30:fontcolor=0xFFE48A:x=126:y=470,drawtext=fontfile=$FONT_REG:text='vote + salt in the correct window':fontsize=22:fontcolor=white:x=126:y=510,drawbox=x=696:y=336:w=420:h=226:color=0x0B1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='What stays disciplined':fontsize=28:fontcolor=0xA9F5FF:x=720:y=364,drawtext=fontfile=$FONT_REG:text='- no reveal before commit':fontsize=24:fontcolor=white:x=720:y=416,drawtext=fontfile=$FONT_REG:text='- no execution before finalize':fontsize=24:fontcolor=white:x=720:y=456,drawtext=fontfile=$FONT_REG:text='- no treasury release before delay':fontsize=24:fontcolor=white:x=720:y=496" \
  -frames:v 1 -update 1 "$SCENE4"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=68:y=84:w=1144:h=548:color=0x0B1722@0.90:t=fill,drawbox=x=94:y=110:w=320:h=42:color=0x0F2733@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='STEP 4':fontsize=24:fontcolor=0xA9F5FF:x=110:y=118,drawtext=fontfile=$FONT_BOLD:text='Execute treasury':fontsize=64:fontcolor=white:x=104:y=204,drawtext=fontfile=$FONT_REG:text='Once the proposal is finalized and the treasury path is unlocked, execution becomes a real on-chain treasury action, not a disconnected UI transition.':fontsize=28:fontcolor=0xDCE8F6:x=106:y=276,drawbox=x=108:y=356:w=460:h=170:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Execution gate':fontsize=30:fontcolor=0xFFF1B0:x=128:y=388,drawtext=fontfile=$FONT_REG:text='finalize -> timelock -> execute':fontsize=24:fontcolor=white:x=128:y=432,drawtext=fontfile=$FONT_REG:text='recipient and treasury checks stay on-chain':fontsize=22:fontcolor=white:x=128:y=476,drawbox=x=704:y=336:w=404:h=222:color=0x07111D@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Evidence stays attached':fontsize=28:fontcolor=0x00E5FF:x=726:y=364,drawtext=fontfile=$FONT_REG:text='Explorer links, proof anchors, and':fontsize=24:fontcolor=white:x=726:y=418,drawtext=fontfile=$FONT_REG:text='runtime artifacts remain connected':fontsize=24:fontcolor=white:x=726:y=458,drawtext=fontfile=$FONT_REG:text='to the same proposal lifecycle.':fontsize=24:fontcolor=white:x=726:y=498" \
  -frames:v 1 -update 1 "$SCENE5"

ffmpeg -y -f lavfi -i "color=c=#07111D:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x07111D:t=fill,drawbox=x=68:y=84:w=1144:h=548:color=0x091520@0.92:t=fill,drawtext=fontfile=$FONT_BOLD:text='Advanced layer activation':fontsize=56:fontcolor=white:x=94:y=148,drawtext=fontfile=$FONT_REG:text='PrivateDAO does not hide the advanced stack. It explains when each layer matters.':fontsize=28:fontcolor=0xDCE8F6:x=96:y=214,drawbox=x=96:y=294:w=510:h=82:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='ZK':fontsize=28:fontcolor=0x00E5FF:x=120:y=322,drawtext=fontfile=$FONT_REG:text='stronger proof and review path':fontsize=24:fontcolor=white:x=190:y=324,drawbox=x=96:y=398:w=510:h=82:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='REFHE':fontsize=28:fontcolor=0xFFE48A:x=120:y=426,drawtext=fontfile=$FONT_REG:text='encrypted evaluation before execution':fontsize=24:fontcolor=white:x=220:y=428,drawbox=x=96:y=502:w=510:h=82:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='MagicBlock':fontsize=28:fontcolor=0xA9F5FF:x=120:y=530,drawtext=fontfile=$FONT_REG:text='confidential token settlement corridor':fontsize=24:fontcolor=white:x=286:y=532,drawbox=x=706:y=344:w=394:h=180:color=0x0A1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='RPC Fast path':fontsize=28:fontcolor=0xFFF1B0:x=728:y=372,drawtext=fontfile=$FONT_REG:text='backend-indexed reads improve':fontsize=24:fontcolor=white:x=728:y=424,drawtext=fontfile=$FONT_REG:text='operator clarity and reviewer confidence.':fontsize=24:fontcolor=white:x=728:y=464" \
  -frames:v 1 -update 1 "$SCENE6"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" -i "$ASSETS_DIR/logo.png" \
  -filter_complex "[1:v]scale=200:200[logo];[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=68:y=86:w=1144:h=548:color=0x0B1722@0.90:t=fill,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=84:fontcolor=white:x=100:y=170,drawtext=fontfile=$FONT_REG:text='Create DAO. Submit proposal. Private vote. Execute treasury.':fontsize=32:fontcolor=0xDCE8F6:x=104:y=264,drawtext=fontfile=$FONT_BOLD:text='Live product:':fontsize=28:fontcolor=0xA9F5FF:x=104:y=386,drawtext=fontfile=$FONT_REG:text='privatedao.org/':fontsize=28:fontcolor=white:x=304:y=386,drawtext=fontfile=$FONT_BOLD:text='Repository:':fontsize=28:fontcolor=0xFFE48A:x=104:y=444,drawtext=fontfile=$FONT_REG:text='github.com/X-PACT/PrivateDAO':fontsize=28:fontcolor=white:x=286:y=444,drawtext=fontfile=$FONT_REG:text='Frontier-ready, evidence-rich, and ready for production backing.':fontsize=30:fontcolor=0xFFF1B0:x=104:y=548[base];[base][logo]overlay=938:124" \
  -frames:v 1 -update 1 "$SCENE7"

ffmpeg -y \
  -loop 1 -t 5 -i "$SCENE1" \
  -loop 1 -t 5 -i "$SCENE2" \
  -loop 1 -t 6 -i "$SCENE3" \
  -loop 1 -t 6 -i "$SCENE4" \
  -loop 1 -t 6 -i "$SCENE5" \
  -loop 1 -t 6 -i "$SCENE6" \
  -loop 1 -t 5 -i "$SCENE7" \
  -filter_complex "[0:v]fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p[v1];[2:v]fps=30,format=yuv420p[v2];[3:v]fps=30,format=yuv420p[v3];[4:v]fps=30,format=yuv420p[v4];[5:v]fps=30,format=yuv420p[v5];[6:v]fps=30,format=yuv420p[v6];[v0][v1]xfade=transition=fade:duration=0.8:offset=4.2[x1];[x1][v2]xfade=transition=fade:duration=0.8:offset=8.4[x2];[x2][v3]xfade=transition=fade:duration=0.8:offset=13.6[x3];[x3][v4]xfade=transition=fade:duration=0.8:offset=18.8[x4];[x4][v5]xfade=transition=fade:duration=0.8:offset=24.0[x5];[x5][v6]xfade=transition=fade:duration=0.8:offset=29.2,fade=t=in:st=0:d=0.4,fade=t=out:st=33.6:d=0.4[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUTPUT"

cp "$SCENE7" "$POSTER"
cp "$OUTPUT" "$DESKTOP_MP4"
cp "$POSTER" "$DESKTOP_POSTER"
rm -f "$SCENE1" "$SCENE2" "$SCENE3" "$SCENE4" "$SCENE5" "$SCENE6" "$SCENE7"

echo "Rendered demo video:"
echo "  $OUTPUT"
echo "Poster:"
echo "  $POSTER"
echo "Desktop copies:"
echo "  $DESKTOP_MP4"
echo "  $DESKTOP_POSTER"
