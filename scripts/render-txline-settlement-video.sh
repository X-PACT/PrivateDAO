#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="$ROOT_DIR/apps/web/public/videos"
ASSETS_DIR="$ROOT_DIR/docs/assets/txline-settlement-video"
DESKTOP_DIR="/home/x-pact/Desktop/TxLINE-Match-Settlement-Video"
PYTHON_BIN="${PYTHON_BIN:-python3}"
EDGE_TTS_BIN="${EDGE_TTS_BIN:-/tmp/pdao-media-venv/bin/edge-tts}"
VOICE="${PRIVATE_DAO_VIDEO_VOICE:-en-US-GuyNeural}"
OUTPUT="$PUBLIC_DIR/txline-settlement-demo-3min.mp4"
POSTER="$PUBLIC_DIR/txline-settlement-demo-poster.png"
VOICE_SCRIPT="$PUBLIC_DIR/txline-settlement-demo-3min-voiceover.txt"
DESKTOP_OUTPUT="$DESKTOP_DIR/TxLINE Match Settlement - 3 Minute Demo.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/TxLINE Match Settlement - Poster.png"
DESKTOP_SCRIPT="$DESKTOP_DIR/TxLINE Match Settlement - Voiceover.txt"
LOGO="$ROOT_DIR/apps/web/public/assets/token/pdao-token-fullscreen-cover.jpg"
STADIUM="$ROOT_DIR/apps/web/public/assets/txline/world-cup-stadium-trophy-celebration.png"

mkdir -p "$PUBLIC_DIR" "$ASSETS_DIR" "$DESKTOP_DIR"

VOICE_TEXT="$ASSETS_DIR/voiceover.txt"
VOICE_MP3="$ASSETS_DIR/voiceover.mp3"
VOICE_WAV="$ASSETS_DIR/voiceover.wav"
CLIPS="$ASSETS_DIR/clips.txt"
VIDEO_ONLY="$ASSETS_DIR/video-only.mp4"

cat >"$VOICE_TEXT" <<'EOF'
Every prediction market has one critical moment: settlement.

Everyone can place bets. The hard part is proving the outcome without trusting the operator.

That is what PrivateDAO built on top of TxLINE.

TxLINE proves the match result.
PrivateDAO proves everything that happens after the match.

Imagine a simple product.

Predict Brazil versus Japan.
Pay zero point one SOL.
When the match ends, TxLINE publishes the official result.

PrivateDAO verifies the result, executes the private settlement policy, coordinates the reward treasury, generates proof, and publishes a Solana receipt.

For the user, it feels simple.
Predict. Pay. Settle. Verify.

For the operator, it becomes infrastructure.
Official result. Validation. Settlement policy. Blind Verification. Settlement hash. Solana receipt.

Why not just use TxLINE directly?

Because trusted sports data is only the first half.

Applications also need private payout rules, treasury coordination, Merkle proof packets, Groth16 or ZK policy verification, public receipts, and auditability.

TxLINE is the trusted data layer.
PrivateDAO is the confidential execution and proof layer.

Together, they make sports settlement understandable to users and verifiable to builders, judges, and auditors.

This starts with World Cup-style applications.
But the pattern goes beyond sports: prediction markets, community competitions, fantasy rewards, insurance triggers, and enterprise settlement workflows.

TxLINE Match Settlement is powered by TxLINE data and extended by PrivateDAO settlement infrastructure.

The match ends.
The result is verified.
The policy executes privately.
The treasury moves rewards.
The proof is public.
The receipt is on Solana.
EOF

cp "$VOICE_TEXT" "$VOICE_SCRIPT"
cp "$VOICE_TEXT" "$DESKTOP_SCRIPT"

if [[ -x "$EDGE_TTS_BIN" ]]; then
  "$EDGE_TTS_BIN" --voice "$VOICE" --file "$VOICE_TEXT" --write-media "$VOICE_MP3" >/dev/null
  ffmpeg -y -i "$VOICE_MP3" -af "volume=1.55,highpass=f=85,lowpass=f=7800" "$VOICE_WAV" >/dev/null 2>&1
else
  ffmpeg -y -f lavfi -i "flite=textfile=${VOICE_TEXT}:voice=rms" -af "volume=1.45,highpass=f=85,lowpass=f=5000" "$VOICE_WAV" >/dev/null 2>&1
fi

"$PYTHON_BIN" - "$LOGO" "$STADIUM" <<'PY'
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import sys

logo_path = Path(sys.argv[1])
stadium_path = Path(sys.argv[2])
root = Path("docs/assets/txline-settlement-video")
root.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080
font_dir = Path("/usr/share/fonts/truetype/dejavu")
font_bold = str(font_dir / "DejaVuSans-Bold.ttf")
font_reg = str(font_dir / "DejaVuSans.ttf")

DARK = "#030510"
NAVY = "#07111D"
PANEL = "#081525"
GREEN = "#14F195"
CYAN = "#00E5FF"
TEXT = "#EAF7FF"
MUTED = "#93AFC4"

def f(size, bold=False):
    return ImageFont.truetype(str(font_dir / ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf")), size)

def rgb(h):
    h = h.strip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def wrap(draw, text, font, width):
    lines, current = [], ""
    for word in text.split():
        trial = (current + " " + word).strip()
        if draw.textbbox((0, 0), trial, font=font)[2] <= width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def text_block(draw, text, x, y, font, fill, width, gap=12):
    for line in wrap(draw, text, font, width):
        draw.text((x, y), line, font=font, fill=fill)
        y += font.size + gap
    return y

def base():
    img = Image.new("RGBA", (W, H), rgb(DARK)+(255,))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        col = tuple(int(rgb(DARK)[i]*(1-t)+rgb(NAVY)[i]*t) for i in range(3))
        d.line((0, y, W, y), fill=col+(255,))
    for cx, cy, color in [(1580, 160, CYAN), (260, 860, GREEN), (1180, 850, CYAN)]:
        glow = Image.new("RGBA", (W, H), (0,0,0,0))
        gd = ImageDraw.Draw(glow)
        for r in range(500, 0, -28):
            gd.ellipse((cx-r, cy-r, cx+r, cy+r), fill=rgb(color)+(int(68*(r/500)**2),))
        img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(34)))
    return img

def label_box(d, box, label, accent=CYAN):
    d.rounded_rectangle(box, radius=24, fill=(2,8,18,246), outline=rgb(accent)+(230,), width=3)
    d.text((box[0]+28, box[1]+22), label, font=f(30, True), fill=rgb(accent))

def brand(d):
    d.text((90, 68), "TxLINE Match Settlement", font=f(42, True), fill=rgb(TEXT))
    d.text((90, 123), "Powered by TxLINE. Extended by PrivateDAO.", font=f(25), fill=rgb(MUTED))
    d.rounded_rectangle((1460, 70, 1810, 130), radius=30, fill=rgb(PANEL)+(230,), outline=rgb(GREEN)+(220,), width=2)
    d.text((1490, 88), "privatedao.org", font=f(25, True), fill=rgb(GREEN))

def scene(name, kicker, title, body, bullets, accent, diagram):
    img = base()
    d = ImageDraw.Draw(img)
    brand(d)
    d.rounded_rectangle((80, 180, 1840, 985), radius=44, fill=(4,11,24,226), outline=rgb(accent)+(150,), width=2)
    d.rounded_rectangle((124, 230, 690, 288), radius=24, fill=(2,8,18,245), outline=rgb(accent)+(220,), width=2)
    d.text((154, 246), kicker.upper(), font=f(22, True), fill=rgb(accent))
    y = text_block(d, title, 132, 335, f(68, True), rgb(TEXT), 960, 14)
    y = text_block(d, body, 136, y+30, f(34), rgb("#BFD4E8"), 960, 14)
    by = y + 44
    for b in bullets:
        d.rounded_rectangle((140, by, 1040, by+74), radius=22, fill=(2,8,18,245), outline=rgb(accent)+(130,), width=2)
        d.ellipse((168, by+24, 194, by+50), fill=rgb(accent))
        d.text((220, by+19), b, font=f(28, True), fill=rgb(TEXT))
        by += 92
    diagram(d, accent)
    img.save(root / name)

def diagram_problem(d, accent):
    for i, txt in enumerate(["who won?", "who gets paid?", "who verifies?"]):
        label_box(d, (1160, 350+i*135, 1710, 430+i*135), txt, GREEN if i == 2 else CYAN)

def diagram_pipeline(d, accent):
    steps = ["Official Result", "Validation", "Settlement Policy", "Proof", "Receipt"]
    for i, step in enumerate(steps):
        y = 300 + i*110
        label_box(d, (1135, y, 1740, y+74), step, GREEN if i % 2 else CYAN)
        if i < len(steps)-1:
            d.line((1438, y+80, 1438, y+104), fill=rgb(GREEN)+(230,), width=5)

def diagram_match(d, accent):
    d.rounded_rectangle((1130, 330, 1740, 820), radius=34, fill=(2,8,18,245), outline=rgb(CYAN)+(220,), width=3)
    d.text((1190, 370), "Brazil vs Japan", font=f(48, True), fill=rgb(TEXT))
    d.rounded_rectangle((1190, 470, 1680, 540), radius=24, fill=rgb(PANEL)+(255,), outline=rgb(GREEN)+(220,), width=2)
    d.text((1238, 489), "0.1 SOL entry", font=f(31, True), fill=rgb(GREEN))
    for i, label in enumerate(["Brazil", "Draw", "Japan"]):
        d.rounded_rectangle((1188+i*165, 620, 1338+i*165, 700), radius=22, fill=(0,229,255,28), outline=rgb(CYAN)+(150,), width=2)
        d.text((1218+i*165, 646), label, font=f(25, True), fill=rgb(TEXT))

def diagram_compare(d, accent):
    rows = [("TxLINE", "match result"), ("PrivateDAO", "settlement proof"), ("Solana", "public receipt")]
    for i, (a, b) in enumerate(rows):
        y = 360 + i*145
        label_box(d, (1130, y, 1420, y+82), a, CYAN)
        label_box(d, (1460, y, 1765, y+82), b, GREEN)

def diagram_proof(d, accent):
    for i, txt in enumerate(["Blind Verification", "Settlement Hash", "Solana Receipt"]):
        label_box(d, (1140, 360+i*135, 1750, 446+i*135), txt, GREEN if i == 1 else CYAN)

scenes = [
    ("scene-01.png", "problem first", "Every prediction market has one critical moment: settlement.", "Everyone can place bets. The hard part is proving the outcome without trusting the operator.", ["not just odds", "not just a scoreboard", "trusted settlement"], GREEN, diagram_problem),
    ("scene-02.png", "privateDAO extends txline", "TxLINE proves the match result. PrivateDAO proves the settlement.", "TxLINE is the trusted sports data layer. PrivateDAO is the confidential execution and proof layer built above it.", ["match result", "private policy", "proof after the match"], CYAN, diagram_compare),
    ("scene-03.png", "consumer product", "Predict Brazil vs Japan. Pay 0.1 SOL. Verify the payout.", "The front door feels like a match app. The engine underneath handles validation, policy, treasury, and receipt proof.", ["Predict", "Pay", "Settle", "Verify"], GREEN, diagram_match),
    ("scene-04.png", "pipeline", "Official Result → Validation → Settlement Policy → Proof → Receipt", "This shows PrivateDAO is not consuming an API. It is building a complete settlement system around trusted sports data.", ["official result", "private settlement", "public receipt"], CYAN, diagram_pipeline),
    ("scene-05.png", "proof packet", "Blind Verification. Settlement Hash. Solana Receipt.", "Merkle-compatible commitments, Groth16 or ZK posture, and public receipts make settlement auditable without leaking private policy.", ["Merkle proof", "Groth16 / ZK", "Solana receipt"], GREEN, diagram_proof),
    ("scene-06.png", "use cases", "World Cup is the first use case. The settlement layer goes further.", "Prediction markets, fantasy rewards, community competitions, insurance triggers, and enterprise workflows all need trusted settlement.", ["sports apps", "reward pools", "audit-ready payouts"], CYAN, diagram_pipeline),
]
for s in scenes:
    scene(*s)

if stadium_path.exists():
    st = Image.open(stadium_path).convert("RGBA")
    st = st.resize((W, int(st.height * W / st.width)))
    if st.height < H:
        st = st.resize((int(st.width * H / st.height), H))
    st = st.crop(((st.width-W)//2, (st.height-H)//2, (st.width+W)//2, (st.height+H)//2))
    overlay = Image.new("RGBA", (W,H), (3,5,16,120))
    img = Image.alpha_composite(st, overlay)
else:
    img = base()
d = ImageDraw.Draw(img)
d.rounded_rectangle((90, 720, 1830, 990), radius=44, fill=(2,8,18,210), outline=rgb(GREEN)+(220,), width=3)
d.text((132, 760), "The match ends. The result is verified. The proof is public.", font=f(54, True), fill=rgb(TEXT))
d.text((136, 850), "Powered by TxLINE data. Extended by PrivateDAO settlement infrastructure.", font=f(34), fill=rgb(GREEN))
img.save(root / "scene-07.png")

if logo_path.exists():
    logo = Image.open(logo_path).convert("RGBA")
    scale = max(W / logo.width, H / logo.height)
    logo = logo.resize((int(logo.width * scale), int(logo.height * scale)))
    img = Image.new("RGBA", (W, H), (3,5,16,255))
    img.alpha_composite(logo, ((W-logo.width)//2, (H-logo.height)//2))
else:
    img = base()
img.save(root / "scene-08.png")
(root / "poster.png").write_bytes((root / "scene-01.png").read_bytes())
PY

duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VOICE_WAV")"
scene_count=8
scene_duration="$("$PYTHON_BIN" - <<PY
duration = float("$duration")
print(f"{duration / $scene_count:.3f}")
PY
)"

rm -f "$CLIPS" "$ASSETS_DIR"/clip-*.mp4
for i in $(seq 1 "$scene_count"); do
  scene_id="$(printf "%02d" "$i")"
  ffmpeg -y -loop 1 -t "$scene_duration" -i "$ASSETS_DIR/scene-${scene_id}.png" \
    -vf "scale=1920:1080,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$ASSETS_DIR/clip-${scene_id}.mp4" >/dev/null 2>&1
  echo "file '$ASSETS_DIR/clip-${scene_id}.mp4'" >>"$CLIPS"
done

ffmpeg -y -f concat -safe 0 -i "$CLIPS" -c copy "$VIDEO_ONLY" >/dev/null 2>&1
ffmpeg -y -i "$VIDEO_ONLY" -i "$VOICE_WAV" \
  -filter_complex "[1:a]volume=1.0[a];sine=frequency=74:duration=${duration}:sample_rate=44100,volume=0.014[bed];[a][bed]amix=inputs=2:duration=shortest:dropout_transition=0[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$OUTPUT" >/dev/null 2>&1

cp "$ASSETS_DIR/poster.png" "$POSTER"
cp "$OUTPUT" "$DESKTOP_OUTPUT"
cp "$POSTER" "$DESKTOP_POSTER"

echo "Rendered TxLINE settlement video:"
echo "  $OUTPUT"
echo "  $POSTER"
echo "  $VOICE_SCRIPT"
echo "Desktop copies:"
echo "  $DESKTOP_OUTPUT"
echo "  $DESKTOP_POSTER"
echo "  $DESKTOP_SCRIPT"
