#!/usr/bin/env python3
"""Generate the legacy GIF demo reel for archival use.

The canonical product video is rendered by `scripts/render-investor-video.sh`
to `docs/assets/private-dao-investor-pitch.mp4`.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "docs" / "assets"
BASE_IMAGE = ASSETS / "frontend-hero.png"
OUTPUT_GIF = ASSETS / "demo-reel.gif"
OUTPUT_POSTER = ASSETS / "demo-reel-poster.png"

WIDTH = 1280
HEIGHT = 720
BACKGROUND = (6, 14, 24)
ACCENT = (20, 241, 149)
ACCENT_2 = (0, 229, 255)
TEXT = (245, 249, 255)
MUTED = (182, 196, 212)
CARD = (9, 24, 38, 210)

PROGRAM_ID = "5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx"

SLIDES = [
    {
        "eyebrow": "PRIVATE GOVERNANCE ON SOLANA",
        "title": "PrivateDAO",
        "body": [
            "Commit-reveal voting with timelocked treasury execution.",
            "Built as a real devnet beta product with a live program,",
            "frontend, SDK, CLI flows, and migration-aware tooling.",
        ],
        "footer": "Repo: github.com/X-PACT/PrivateDAO",
    },
    {
        "eyebrow": "THE PROBLEM",
        "title": "Public live voting leaks power",
        "body": [
            "Visible in-progress tallies create whale pressure,",
            "vote buying, and treasury signaling before governance settles.",
        ],
        "footer": "PrivateDAO hides the tally until reveal.",
    },
    {
        "eyebrow": "THE LIFECYCLE",
        "title": "Commit. Reveal. Finalize. Execute.",
        "body": [
            "1. Commit a hidden vote hash.",
            "2. Reveal vote plus salt after voting closes.",
            "3. Finalize only after the reveal window ends.",
            "4. Execute only after the treasury timelock unlocks.",
        ],
        "footer": "No reveal before commit. No execute before timelock.",
    },
    {
        "eyebrow": "TREASURY SAFETY",
        "title": "Execution stays disciplined",
        "body": [
            "SendSol validates the configured recipient.",
            "SendToken validates mint matching plus token-account",
            "ownership and authority assumptions before transfer.",
        ],
        "footer": "No double execute. No delegation double-use.",
    },
    {
        "eyebrow": "WHAT IS LIVE",
        "title": "A working Solana devnet beta",
        "body": [
            "Live frontend, deployed devnet program, operator CLI,",
            "proposal listing, RPC health tooling, and Realms-oriented",
            "migration helpers for DAO workflows.",
        ],
        "footer": f"Program ID: {PROGRAM_ID[:16]}...",
    },
    {
        "eyebrow": "LINKS",
        "title": "Review the product",
        "body": [
            "Frontend: privatedao.org/",
            "Repo: github.com/X-PACT/PrivateDAO",
            f"Program: {PROGRAM_ID}",
        ],
        "footer": "PrivateDAO is devnet-beta today and production-minded by design.",
    },
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
            ]
        )
    candidates.extend(
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
        ]
    )
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


TITLE_FONT = load_font(62, bold=True)
BODY_FONT = load_font(28)
EYEBROW_FONT = load_font(24, bold=True)
FOOTER_FONT = load_font(24)
PROGRAM_FONT = load_font(22)


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = word if not current else f"{current} {word}"
        if draw.textlength(trial, font=font) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def make_base() -> Image.Image:
    base = Image.new("RGBA", (WIDTH, HEIGHT), BACKGROUND)
    hero = Image.open(BASE_IMAGE).convert("RGBA")
    hero = hero.resize((WIDTH, HEIGHT))
    hero = Image.blend(hero, Image.new("RGBA", hero.size, BACKGROUND + (255,)), 0.35)
    base.alpha_composite(hero)

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rounded_rectangle((58, 58, WIDTH - 58, HEIGHT - 58), radius=32, fill=CARD)
    draw.rounded_rectangle((78, 84, 360, 122), radius=18, fill=(14, 39, 58, 230))
    draw.rounded_rectangle((880, 540, WIDTH - 84, HEIGHT - 88), radius=28, fill=(8, 30, 26, 220))
    draw.text((902, 565), "DEVNET", font=EYEBROW_FONT, fill=ACCENT)
    draw.text((902, 603), "Commit-reveal", font=BODY_FONT, fill=TEXT)
    draw.text((902, 641), "Timelock + treasury checks", font=BODY_FONT, fill=MUTED)
    base.alpha_composite(overlay)
    return base


def draw_slide(slide: dict) -> Image.Image:
    image = make_base()
    draw = ImageDraw.Draw(image)

    draw.text((96, 92), slide["eyebrow"], font=EYEBROW_FONT, fill=ACCENT_2)
    draw.text((96, 152), slide["title"], font=TITLE_FONT, fill=TEXT)

    body_y = 268
    max_width = 720
    for paragraph in slide["body"]:
        lines = wrap_text(draw, paragraph, BODY_FONT, max_width)
        for line in lines:
            draw.text((96, body_y), line, font=BODY_FONT, fill=MUTED)
            body_y += 40
        body_y += 12

    draw.line((96, HEIGHT - 128, 356, HEIGHT - 128), fill=ACCENT, width=5)
    footer_font = PROGRAM_FONT if len(slide["footer"]) > 60 else FOOTER_FONT
    draw.text((96, HEIGHT - 108), slide["footer"], font=footer_font, fill=TEXT)
    return image


def main() -> None:
    frames = [draw_slide(slide) for slide in SLIDES]
    frames[0].save(
        OUTPUT_GIF,
        save_all=True,
        append_images=frames[1:],
        duration=[1800, 1800, 2000, 1800, 1800, 2200],
        loop=0,
        disposal=2,
    )
    frames[-1].save(OUTPUT_POSTER)
    print(f"Generated {OUTPUT_GIF}")
    print(f"Generated {OUTPUT_POSTER}")


if __name__ == "__main__":
    main()
