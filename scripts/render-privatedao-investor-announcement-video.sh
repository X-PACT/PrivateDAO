#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$ROOT_DIR/docs/assets/privatedao-investor-announcement-video"
PUBLIC_DIR="$ROOT_DIR/apps/web/public/videos"
DESKTOP_DIR="/home/x-pact/Desktop/PrivateDAO-Investor-Announcement-Video"
PYTHON_BIN="${PYTHON_BIN:-python3}"
EDGE_TTS_BIN="${EDGE_TTS_BIN:-/tmp/pdao-media-venv/bin/edge-tts}"
VOICE="${PRIVATE_DAO_VIDEO_VOICE:-en-US-GuyNeural}"

FINAL="$PUBLIC_DIR/privatedao-investor-announcement-3min.mp4"
POSTER="$PUBLIC_DIR/privatedao-investor-announcement-3min-poster.png"
SCRIPT_TXT="$PUBLIC_DIR/privatedao-investor-announcement-3min-voiceover.txt"
DESKTOP_FINAL="$DESKTOP_DIR/PrivateDAO - Investor Announcement - 3 Minutes.mp4"
DESKTOP_POSTER="$DESKTOP_DIR/PrivateDAO - Investor Announcement - Poster.png"
DESKTOP_SCRIPT="$DESKTOP_DIR/PrivateDAO - Investor Announcement - Voiceover.txt"
LOGO="$ROOT_DIR/apps/web/public/assets/token/pdao-token-fullscreen-cover.jpg"

mkdir -p "$WORK_DIR" "$PUBLIC_DIR" "$DESKTOP_DIR"

VOICE_TEXT="$WORK_DIR/voiceover.txt"
VOICE_MP3="$WORK_DIR/voiceover.mp3"
VOICE_WAV="$WORK_DIR/voiceover.wav"
CLIP_CONCAT_FILE="$WORK_DIR/clips.txt"
VIDEO_ONLY="$WORK_DIR/video-only.mp4"

cat >"$VOICE_TEXT" <<'EOF'
Most blockchain projects talk about privacy as if it only means encryption.

PrivateDAO starts from a different idea.

Privacy is operational infrastructure.

Inside every serious organization, the real work happens before the public decision.

Teams coordinate. They review budgets. They approve vendors. They manage treasury. They verify results.

Every one of those steps can leak strategy, pressure a vote, expose a counterparty, or reveal information too early.

PrivateDAO protects the operational lifecycle while keeping outcomes verifiable.

Product one is Blind Verification: prove that a private rule was satisfied without exposing the sensitive data behind it.

Product two is Proof Workflows: prove the process happened correctly without exposing documents, notes, or internal scoring.

Product three is Private Rooms and Governance: coordinate proposals, protect vote intent, reveal at the right time, and keep proof visible.

Product four is Treasury Coordination: move budgets, vendors, payroll, payouts, and receipts through a verifiable approval path.

Product five is Sealed Auctions: keep bids and participant intent sealed until reveal, while the final outcome remains auditable.

Product six is TxLINE Match Settlement: TxLINE proves the match result; PrivateDAO proves everything that happens after the match.

The product builds the mission. The community protects the mission. The token aligns the community.

PrivateDAO is inviting users, builders, institutions, and ecosystem partners who believe organizations need private coordination, selective disclosure, verifiable execution, and cryptographic accountability.

Learn more at privatedao.org.
EOF

cp "$VOICE_TEXT" "$SCRIPT_TXT"
cp "$VOICE_TEXT" "$DESKTOP_SCRIPT"

if [[ -x "$EDGE_TTS_BIN" ]]; then
  "$EDGE_TTS_BIN" --voice "$VOICE" --file "$VOICE_TEXT" --write-media "$VOICE_MP3" >/dev/null
  ffmpeg -y -i "$VOICE_MP3" -af "volume=1.55,highpass=f=85,lowpass=f=7800" "$VOICE_WAV" >/dev/null 2>&1
else
  ffmpeg -y -f lavfi -i "flite=textfile=${VOICE_TEXT}:voice=rms" -af "volume=1.45,highpass=f=85,lowpass=f=5000" "$VOICE_WAV" >/dev/null 2>&1
fi

"$PYTHON_BIN" - "$LOGO" <<'PY'
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from pathlib import Path
import math
import sys

logo_path = Path(sys.argv[1])
root = Path("docs/assets/privatedao-investor-announcement-video")
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
    return ImageFont.truetype(font_bold if bold else font_reg, size)

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
    img = Image.new("RGBA", (W, H), rgb(DARK) + (255,))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        col = tuple(int(rgb(DARK)[i] * (1 - t) + rgb(NAVY)[i] * t) for i in range(3))
        d.line((0, y, W, y), fill=col + (255,))
    for cx, cy, color in [(1600, 180, CYAN), (260, 850, GREEN), (1250, 860, CYAN)]:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glow)
        for r in range(520, 0, -26):
            gd.ellipse((cx-r, cy-r, cx+r, cy+r), fill=rgb(color) + (int(70 * (r/520)**2),))
        img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(32)))
    d = ImageDraw.Draw(img)
    for x in range(-300, W + 300, 140):
        d.line((x, 0, x + 560, H), fill=(255, 255, 255, 10), width=1)
    return img

def brand(d):
    d.text((90, 66), "PrivateDAO", font=f(44, True), fill=rgb(TEXT))
    d.text((90, 124), "Private coordination. Public proof.", font=f(25), fill=rgb(MUTED))
    d.rounded_rectangle((1475, 70, 1815, 130), radius=30, fill=rgb(PANEL)+(230,), outline=rgb(GREEN)+(210,), width=2)
    d.text((1506, 88), "privatedao.org", font=f(25, True), fill=rgb(GREEN))

def draw_diagram(d, kind, accent):
    x0, y0 = 1160, 320
    if kind == "pipeline":
        labels = ["coordinate", "approve", "execute", "verify"]
        for i, label in enumerate(labels):
            y = y0 + i * 118
            d.rounded_rectangle((x0, y, x0+560, y+78), radius=24, fill=(2,8,18,245), outline=rgb(accent)+(230,), width=3)
            d.text((x0+34, y+21), label, font=f(30, True), fill=rgb(accent))
            if i < 3:
                d.line((x0+280, y+86, x0+280, y+112), fill=rgb(accent)+(230,), width=5)
    elif kind == "rings":
        cx, cy = 1420, 570
        for r, label, c in [(260, "private data", CYAN), (178, "rule check", GREEN), (102, "proof", CYAN)]:
            d.ellipse((cx-r, cy-r, cx+r, cy+r), outline=rgb(c)+(230,), width=5)
            d.rounded_rectangle((cx-r+26, cy-r+20, cx-r+286, cy-r+62), radius=18, fill=(2,8,18,245))
            d.text((cx-r+44, cy-r+27), label, font=f(22, True), fill=rgb(c))
    elif kind == "cards":
        rows = ["documents", "policy", "review", "receipt"]
        for i, label in enumerate(rows):
            y = y0 + i * 112
            d.rounded_rectangle((x0+i*38, y, x0+540+i*38, y+76), radius=22, fill=(2,8,18,245), outline=rgb(accent)+(210,), width=3)
            d.text((x0+34+i*38, y+22), label, font=f(28, True), fill=rgb(accent))
    elif kind == "bars":
        for i, h in enumerate([240, 370, 290, 430, 330]):
            x = x0 + i * 120
            d.rounded_rectangle((x, 780-h, x+78, 780), radius=18, fill=rgb(accent)+(150,), outline=rgb(CYAN)+(180,), width=2)
            d.text((x+17, 805), f"B{i+1}", font=f(24, True), fill=rgb(TEXT))
    else:
        boxes = [("TxLINE", 1130, 330), ("policy", 1390, 480), ("proof", 1130, 630), ("receipt", 1420, 760)]
        for label, x, y in boxes:
            d.rounded_rectangle((x, y, x+340, y+84), radius=24, fill=(2,8,18,245), outline=rgb(accent)+(220,), width=3)
            d.text((x+32, y+24), label, font=f(28, True), fill=rgb(accent))

def scene(name, kicker, title, body, bullets, accent, diagram):
    img = base()
    d = ImageDraw.Draw(img)
    brand(d)
    d.rounded_rectangle((80, 180, 1840, 985), radius=44, fill=(4,11,24,226), outline=rgb(accent)+(150,), width=2)
    d.rounded_rectangle((124, 230, 620, 288), radius=24, fill=(2,8,18,245), outline=rgb(accent)+(220,), width=2)
    d.text((154, 246), kicker.upper(), font=f(22, True), fill=rgb(accent))
    y = text_block(d, title, 132, 335, f(70, True), rgb(TEXT), 960, 14)
    y = text_block(d, body, 136, y+30, f(34), rgb("#BFD4E8"), 960, 14)
    by = y + 44
    for b in bullets:
        d.rounded_rectangle((140, by, 1040, by+74), radius=22, fill=(2,8,18,245), outline=rgb(accent)+(130,), width=2)
        d.ellipse((168, by+24, 194, by+50), fill=rgb(accent))
        d.text((220, by+19), b, font=f(28, True), fill=rgb(TEXT))
        by += 92
    draw_diagram(d, diagram, accent)
    img.save(root / name)

scenes = [
    ("scene-01.png", "philosophy", "Privacy is operational infrastructure.", "PrivateDAO protects the work that happens before a public decision, while keeping the outcome verifiable.", ["protect the lifecycle", "prove the outcome", "keep strategy intact"], GREEN, "pipeline"),
    ("scene-02.png", "blind verification", "Verify correctness without exposing the secret.", "A reviewer can prove a private rule was satisfied without seeing sensitive inputs.", ["grants", "audits", "compliance reviews"], CYAN, "rings"),
    ("scene-03.png", "proof workflows", "Prove the process, not the private file.", "Organizations can show that a workflow happened correctly while documents and scoring stay protected.", ["underwriting", "internal reviews", "procurement"], GREEN, "cards"),
    ("scene-04.png", "private governance", "Coordinate and vote with protected intent.", "Rooms let teams propose, commit, reveal, execute, and verify without leaking momentum too early.", ["proposal rooms", "protected votes", "visible proof"], CYAN, "pipeline"),
    ("scene-05.png", "treasury", "Sensitive treasury work needs private coordination.", "Budgets, vendors, payroll, payouts, and receipts move through verifiable approval.", ["policy before signing", "wallet execution", "receipt trails"], GREEN, "pipeline"),
    ("scene-06.png", "sealed auctions", "Markets work better when intent stays sealed.", "Bids and participant intent stay protected until reveal, while the final outcome remains auditable.", ["sealed bids", "fair reveal", "auditable outcome"], CYAN, "bars"),
    ("scene-07.png", "txline settlement", "TxLINE proves the match. PrivateDAO proves the settlement.", "Official result becomes validation, private policy, proof, and public Solana receipt.", ["official match data", "private payout logic", "settlement receipt"], GREEN, "txline"),
    ("scene-08.png", "community", "The token aligns the community.", "The product builds the mission. The community protects the mission. The token aligns the community.", ["users", "builders", "institutions"], CYAN, "pipeline"),
    ("scene-09.png", "partners", "Private coordination. Public proof.", "PrivateDAO invites users, builders, institutions, and ecosystem partners building the next generation of organizations.", ["privatedao.org", "builders and partners", "privacy-first operations"], GREEN, "pipeline"),
]
for s in scenes:
    scene(*s)

if logo_path.exists():
    logo = Image.open(logo_path).convert("RGBA")
    scale = max(W / logo.width, H / logo.height)
    logo = logo.resize((int(logo.width * scale), int(logo.height * scale)))
    img = Image.new("RGBA", (W, H), (3,5,16,255))
    img.alpha_composite(logo, ((W-logo.width)//2, (H-logo.height)//2))
else:
    img = base()
img.save(root / "scene-10.png")
(root / "poster.png").write_bytes((root / "scene-01.png").read_bytes())
PY

duration="$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VOICE_WAV")"
scene_count=10
scene_duration="$("$PYTHON_BIN" - <<PY
duration = float("$duration")
print(f"{duration / $scene_count:.3f}")
PY
)"

rm -f "$CLIP_CONCAT_FILE" "$WORK_DIR"/clip-*.mp4
for i in $(seq 1 "$scene_count"); do
  scene_id="$(printf "%02d" "$i")"
  ffmpeg -y -loop 1 -t "$scene_duration" -i "$WORK_DIR/scene-${scene_id}.png" \
    -vf "scale=1920:1080,format=yuv420p" \
    -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p "$WORK_DIR/clip-${scene_id}.mp4" >/dev/null 2>&1
  echo "file '$WORK_DIR/clip-${scene_id}.mp4'" >>"$CLIP_CONCAT_FILE"
done

ffmpeg -y -f concat -safe 0 -i "$CLIP_CONCAT_FILE" -c copy "$VIDEO_ONLY" >/dev/null 2>&1
ffmpeg -y -i "$VIDEO_ONLY" -i "$VOICE_WAV" \
  -filter_complex "[1:a]volume=1.0[a];sine=frequency=72:duration=${duration}:sample_rate=44100,volume=0.014[bed];[a][bed]amix=inputs=2:duration=shortest:dropout_transition=0[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$FINAL" >/dev/null 2>&1

cp "$WORK_DIR/poster.png" "$POSTER"
cp "$FINAL" "$DESKTOP_FINAL"
cp "$POSTER" "$DESKTOP_POSTER"

echo "Rendered PrivateDAO investor announcement video:"
echo "  $FINAL"
echo "  $POSTER"
echo "  $SCRIPT_TXT"
echo "Desktop copies:"
echo "  $DESKTOP_FINAL"
echo "  $DESKTOP_POSTER"
echo "  $DESKTOP_SCRIPT"
