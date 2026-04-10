#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT_DIR/docs/assets"
PUBLIC_ASSETS_DIR="$ROOT_DIR/apps/web/public/assets"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Frontier-Overview"
FONT_BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REG="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

mkdir -p "$ASSETS_DIR" "$PUBLIC_ASSETS_DIR" "$DESKTOP_DIR"

SCENE1="$ASSETS_DIR/frontier-video-scene-01.png"
SCENE2="$ASSETS_DIR/frontier-video-scene-02.png"
SCENE3="$ASSETS_DIR/frontier-video-scene-03.png"
SCENE4="$ASSETS_DIR/frontier-video-scene-04.png"
SCENE5="$ASSETS_DIR/frontier-video-scene-05.png"
SCENE6="$ASSETS_DIR/frontier-video-scene-06.png"
SCENE7="$ASSETS_DIR/frontier-video-scene-07.png"
POSTER="$ASSETS_DIR/private-dao-frontier-overview-poster.png"
OUTPUT="$ASSETS_DIR/private-dao-frontier-overview.mp4"
PUBLIC_POSTER="$PUBLIC_ASSETS_DIR/private-dao-frontier-overview-poster.png"
PUBLIC_OUTPUT="$PUBLIC_ASSETS_DIR/private-dao-frontier-overview.mp4"
DESKTOP_MP4="$DESKTOP_DIR/PrivateDAO - Frontier Overview - Everything We Offer and Why Us.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/PrivateDAO - Frontier Overview - Poster.png"

ffmpeg -y -i "$ASSETS_DIR/frontend-hero.png" \
  -vf "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,boxblur=4:1,eq=brightness=-0.16:saturation=1.12,drawbox=x=0:y=0:w=1280:h=720:color=0x060A16@0.60:t=fill,drawbox=x=70:y=78:w=784:h=224:color=0x06111A@0.46:t=fill,drawbox=x=70:y=492:w=570:h=132:color=0x14F195@0.08:t=fill,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=58:fontcolor=white:x=76:y=94,drawtext=fontfile=$FONT_BOLD:text='Everything we offer.':fontsize=68:fontcolor=0xFFF1B0:x=76:y=176,drawtext=fontfile=$FONT_BOLD:text='And why we win.':fontsize=64:fontcolor=0x00E5FF:x=76:y=256,drawtext=fontfile=$FONT_REG:text='Private governance, confidential operations, RPC productization, Android access, and reviewer-grade proof on Solana.':fontsize=28:fontcolor=0xDCE8F6:x=78:y=348,drawtext=fontfile=$FONT_BOLD:text='LIVE AT PRIVATEDAO.ORG':fontsize=24:fontcolor=0xA9F5FF:x=92:y=526,drawtext=fontfile=$FONT_REG:text='Professional Next.js product shell + wallet UX + track workspaces':fontsize=24:fontcolor=white:x=92:y=570" \
  -frames:v 1 -update 1 "$SCENE1"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=66:y=82:w=1148:h=556:color=0x0A1722@0.90:t=fill,drawtext=fontfile=$FONT_BOLD:text='What we ship right now':fontsize=56:fontcolor=white:x=94:y=144,drawtext=fontfile=$FONT_REG:text='PrivateDAO is not a concept deck. It already ships the governance lifecycle, confidential treasury paths, and reviewer-visible proof surfaces.':fontsize=28:fontcolor=0xDCE8F6:x=96:y=214,drawbox=x=96:y=304:w=516:h=84:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Private governance':fontsize=30:fontcolor=0x00E5FF:x=118:y=334,drawtext=fontfile=$FONT_REG:text='commit -> reveal -> finalize -> timelock -> execute':fontsize=22:fontcolor=white:x=118:y=372,drawbox=x=96:y=408:w=516:h=84:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Confidential treasury operations':fontsize=30:fontcolor=0xFFE48A:x=118:y=438,drawtext=fontfile=$FONT_REG:text='payroll, bonus, and reward corridors with evidence gates':fontsize=22:fontcolor=white:x=118:y=476,drawbox=x=96:y=512:w=516:h=84:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Reviewer and buyer surfaces':fontsize=30:fontcolor=0xA9F5FF:x=118:y=542,drawtext=fontfile=$FONT_REG:text='proof center, diagnostics, services, documents, and tracks':fontsize=22:fontcolor=white:x=118:y=580,drawbox=x=712:y=320:w=396:h=220:color=0x07111D@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Why it matters':fontsize=28:fontcolor=0xFFF1B0:x=734:y=350,drawtext=fontfile=$FONT_REG:text='A real dApp beats a static pitch.':fontsize=24:fontcolor=white:x=734:y=406,drawtext=fontfile=$FONT_REG:text='PrivateDAO already behaves like':fontsize=24:fontcolor=white:x=734:y=446,drawtext=fontfile=$FONT_REG:text='a serious product and a serious':fontsize=24:fontcolor=white:x=734:y=486,drawtext=fontfile=$FONT_REG:text='governance system at the same time.':fontsize=24:fontcolor=white:x=734:y=526" \
  -frames:v 1 -update 1 "$SCENE2"

ffmpeg -y -f lavfi -i "color=c=#120C02:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x120C02:t=fill,drawbox=x=66:y=82:w=1148:h=556:color=0x22110A@0.88:t=fill,drawtext=fontfile=$FONT_BOLD:text='The cryptographic stack':fontsize=56:fontcolor=white:x=94:y=144,drawtext=fontfile=$FONT_REG:text='We do not hide the hard parts. We explain how each layer strengthens a specific operational boundary.':fontsize=28:fontcolor=0xF6E7D1:x=96:y=214,drawbox=x=96:y=300:w=504:h=84:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='ZK':fontsize=30:fontcolor=0x00E5FF:x=118:y=330,drawtext=fontfile=$FONT_REG:text='proof anchors, review rails, and deterministic confidence scoring':fontsize=22:fontcolor=white:x=180:y=368,drawbox=x=96:y=404:w=504:h=84:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='REFHE':fontsize=30:fontcolor=0xFFE48A:x=118:y=434,drawtext=fontfile=$FONT_REG:text='encrypted payroll and bonus evaluation before treasury release':fontsize=22:fontcolor=white:x=214:y=472,drawbox=x=96:y=508:w=504:h=84:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='MagicBlock + Fast RPC':fontsize=30:fontcolor=0xA9F5FF:x=118:y=538,drawtext=fontfile=$FONT_REG:text='responsive corridors, diagnostics, and reviewer-facing runtime clarity':fontsize=22:fontcolor=white:x=382:y=576,drawbox=x=704:y=294:w=408:h=264:color=0x0B1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Hardening that ships':fontsize=28:fontcolor=0xFFF1B0:x=726:y=324,drawtext=fontfile=$FONT_REG:text='Governance V3':fontsize=24:fontcolor=white:x=726:y=382,drawtext=fontfile=$FONT_REG:text='Settlement V3':fontsize=24:fontcolor=white:x=726:y=422,drawtext=fontfile=$FONT_REG:text='ZK matrix + confidence engine':fontsize=24:fontcolor=white:x=726:y=462,drawtext=fontfile=$FONT_REG:text='Frontier integrations packet':fontsize=24:fontcolor=white:x=726:y=502" \
  -frames:v 1 -update 1 "$SCENE3"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=66:y=82:w=1148:h=556:color=0x0B1722@0.90:t=fill,drawtext=fontfile=$FONT_BOLD:text='Why the frontend now matters':fontsize=56:fontcolor=white:x=94:y=144,drawtext=fontfile=$FONT_REG:text='The new multi-page Next.js shell turns the protocol into a product people can actually navigate, judge, buy, and operate.':fontsize=28:fontcolor=0xDCE8F6:x=96:y=214,drawbox=x=96:y=312:w=492:h=76:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Operational shell':fontsize=28:fontcolor=0x00E5FF:x=118:y=340,drawtext=fontfile=$FONT_REG:text='dashboard, command center, proof, security, diagnostics':fontsize=22:fontcolor=white:x=118:y=378,drawbox=x=96:y=408:w=492:h=76:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Wallet UX':fontsize=28:fontcolor=0xA9F5FF:x=118:y=436,drawtext=fontfile=$FONT_REG:text='Solana wallet adapter, cleaner nav, natural connect flow':fontsize=22:fontcolor=white:x=118:y=474,drawbox=x=96:y=504:w=492:h=76:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Product corridors':fontsize=28:fontcolor=0xFFE48A:x=118:y=532,drawtext=fontfile=$FONT_REG:text='PrivateDAO Core, Realms, Android, Gaming DAO, Read API + RPC':fontsize=22:fontcolor=white:x=118:y=570,drawbox=x=700:y=302:w=420:h=236:color=0x07111D@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='This is why judges convert':fontsize=28:fontcolor=0xFFF1B0:x=724:y=332,drawtext=fontfile=$FONT_REG:text='They can see the product fast,':fontsize=24:fontcolor=white:x=724:y=392,drawtext=fontfile=$FONT_REG:text='then inspect proof and launch':fontsize=24:fontcolor=white:x=724:y=432,drawtext=fontfile=$FONT_REG:text='boundaries without leaving the':fontsize=24:fontcolor=white:x=724:y=472,drawtext=fontfile=$FONT_REG:text='same app.':fontsize=24:fontcolor=white:x=724:y=512" \
  -frames:v 1 -update 1 "$SCENE4"

ffmpeg -y -f lavfi -i "color=c=#07111D:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x07111D:t=fill,drawbox=x=66:y=82:w=1148:h=556:color=0x091520@0.92:t=fill,drawtext=fontfile=$FONT_BOLD:text='Why we win across tracks':fontsize=56:fontcolor=white:x=94:y=144,drawtext=fontfile=$FONT_REG:text='PrivateDAO now has dedicated workspaces for privacy, live dApp UX, RPC productization, consumer clarity, and investor-grade trust.':fontsize=28:fontcolor=0xDCE8F6:x=96:y=214,drawbox=x=96:y=308:w=504:h=74:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Privacy and Encrypt':fontsize=28:fontcolor=0x00E5FF:x=118:y=336,drawtext=fontfile=$FONT_REG:text='strongest natural fit for the current cryptographic stack':fontsize=22:fontcolor=white:x=118:y=374,drawbox=x=96:y=402:w=504:h=74:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='RPC and infrastructure':fontsize=28:fontcolor=0xA9F5FF:x=118:y=430,drawtext=fontfile=$FONT_REG:text='hosted reads, diagnostics, runtime evidence, and API packaging':fontsize=22:fontcolor=white:x=118:y=468,drawbox=x=96:y=496:w=504:h=74:color=0x101B28@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Consumer and 100xDevs':fontsize=28:fontcolor=0xFFE48A:x=118:y=524,drawtext=fontfile=$FONT_REG:text='better UX, progressive migration, reusable frontend, real shell':fontsize=22:fontcolor=white:x=118:y=562,drawbox=x=706:y=306:w=408:h=232:color=0x0A1722@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Proof that builds trust':fontsize=28:fontcolor=0xFFF1B0:x=728:y=336,drawtext=fontfile=$FONT_REG:text='1st Place Superteam Poland':fontsize=24:fontcolor=white:x=728:y=396,drawtext=fontfile=$FONT_REG:text='Judge proof view and V3 packets':fontsize=24:fontcolor=white:x=728:y=436,drawtext=fontfile=$FONT_REG:text='Launch truth kept explicit':fontsize=24:fontcolor=white:x=728:y=476,drawtext=fontfile=$FONT_REG:text='privatedao.org/tracks/':fontsize=24:fontcolor=white:x=728:y=516" \
  -frames:v 1 -update 1 "$SCENE5"

ffmpeg -y -f lavfi -i "color=c=#120C02:s=1280x720" \
  -vf "drawbox=x=0:y=0:w=1280:h=720:color=0x120C02:t=fill,drawbox=x=66:y=82:w=1148:h=556:color=0x22110A@0.88:t=fill,drawtext=fontfile=$FONT_BOLD:text='What makes PrivateDAO different':fontsize=56:fontcolor=white:x=94:y=144,drawtext=fontfile=$FONT_REG:text='We do not pick between protocol depth and product quality. We ship both, with honest evidence and buyer-facing packaging.':fontsize=28:fontcolor=0xF6E7D1:x=96:y=214,drawbox=x=96:y=304:w=992:h=88:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='Protocol depth + operational clarity + commercial packaging':fontsize=34:fontcolor=0xFFE48A:x=122:y=336,drawtext=fontfile=$FONT_REG:text='That combination is why the same repo can speak to judges, buyers, operators, and infrastructure partners.':fontsize=24:fontcolor=white:x=122:y=378,drawbox=x=96:y=430:w=992:h=118:color=0x141E30@0.96:t=fill,drawtext=fontfile=$FONT_BOLD:text='And we keep the launch boundary honest:':fontsize=30:fontcolor=0xA9F5FF:x=122:y=462,drawtext=fontfile=$FONT_REG:text='Devnet live now, proof live now, services and trust live now, pending-external launch work still marked as pending.':fontsize=24:fontcolor=white:x=122:y=506" \
  -frames:v 1 -update 1 "$SCENE6"

ffmpeg -y -f lavfi -i "color=c=#06111A:s=1280x720" -i "$ASSETS_DIR/logo.png" \
  -filter_complex "[1:v]scale=210:210[logo];[0:v]drawbox=x=0:y=0:w=1280:h=720:color=0x06111A:t=fill,drawbox=x=68:y=86:w=1144:h=548:color=0x0B1722@0.90:t=fill,drawtext=fontfile=$FONT_BOLD:text='PrivateDAO':fontsize=84:fontcolor=white:x=100:y=170,drawtext=fontfile=$FONT_REG:text='The privacy-first governance product with the strongest full-stack submission posture.':fontsize=30:fontcolor=0xDCE8F6:x=104:y=258,drawtext=fontfile=$FONT_BOLD:text='Watch live:':fontsize=28:fontcolor=0xA9F5FF:x=104:y=384,drawtext=fontfile=$FONT_REG:text='privatedao.org/story/':fontsize=28:fontcolor=white:x=264:y=384,drawtext=fontfile=$FONT_BOLD:text='Judge proof:':fontsize=28:fontcolor=0xFFE48A:x=104:y=442,drawtext=fontfile=$FONT_REG:text='privatedao.org/proof/?judge=1':fontsize=28:fontcolor=white:x=282:y=442,drawtext=fontfile=$FONT_BOLD:text='Repository:':fontsize=28:fontcolor=0x14F195:x=104:y=500,drawtext=fontfile=$FONT_REG:text='github.com/X-PACT/PrivateDAO':fontsize=28:fontcolor=white:x=286:y=500,drawtext=fontfile=$FONT_REG:text='Private governance. Confidential operations. Professional product execution.':fontsize=30:fontcolor=0xFFF1B0:x=104:y=590[base];[base][logo]overlay=934:124" \
  -frames:v 1 -update 1 "$SCENE7"

ffmpeg -y \
  -loop 1 -t 7 -i "$SCENE1" \
  -loop 1 -t 7 -i "$SCENE2" \
  -loop 1 -t 8 -i "$SCENE3" \
  -loop 1 -t 8 -i "$SCENE4" \
  -loop 1 -t 8 -i "$SCENE5" \
  -loop 1 -t 8 -i "$SCENE6" \
  -loop 1 -t 7 -i "$SCENE7" \
  -filter_complex "[0:v]fps=30,format=yuv420p[v0];[1:v]fps=30,format=yuv420p[v1];[2:v]fps=30,format=yuv420p[v2];[3:v]fps=30,format=yuv420p[v3];[4:v]fps=30,format=yuv420p[v4];[5:v]fps=30,format=yuv420p[v5];[6:v]fps=30,format=yuv420p[v6];[v0][v1]xfade=transition=fade:duration=0.8:offset=6.2[x1];[x1][v2]xfade=transition=fade:duration=0.8:offset=12.4[x2];[x2][v3]xfade=transition=fade:duration=0.8:offset=19.6[x3];[x3][v4]xfade=transition=fade:duration=0.8:offset=26.8[x4];[x4][v5]xfade=transition=fade:duration=0.8:offset=34.0[x5];[x5][v6]xfade=transition=fade:duration=0.8:offset=41.2,fade=t=in:st=0:d=0.4,fade=t=out:st=47.6:d=0.4[v]" \
  -map "[v]" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUTPUT"

cp "$SCENE7" "$POSTER"
cp "$OUTPUT" "$DESKTOP_MP4"
cp "$POSTER" "$DESKTOP_POSTER"
cp "$OUTPUT" "$PUBLIC_OUTPUT"
cp "$POSTER" "$PUBLIC_POSTER"
rm -f "$SCENE1" "$SCENE2" "$SCENE3" "$SCENE4" "$SCENE5" "$SCENE6" "$SCENE7"

echo "Rendered frontier overview video:"
echo "  $OUTPUT"
echo "Public copies:"
echo "  $PUBLIC_OUTPUT"
echo "  $PUBLIC_POSTER"
echo "Desktop copies:"
echo "  $DESKTOP_MP4"
echo "  $DESKTOP_POSTER"
