from pathlib import Path
import sys

site = Path(sys.argv[1])
stamp = sys.argv[2]
marker = 'data-privatedao-commercial-video="20260815"'
cards = {
    "products/index.html": [("blind-verification", "Verify without exposing the input.", "For teams that need a trusted answer while sensitive source data stays private."), ("record-verification", "Make every critical record checkable.", "Turn structured records into receipts that reviewers can check."), ("private-governance", "Private decisions with a clear result.", "Review, vote, and keep the final outcome accountable."), ("sealed-auctions", "Private auctions, clear outcomes.", "Keep live offers private and share the final result."), ("treasury-coordination", "Treasury work people can review.", "Move from request to approval with evidence.")],
    "govern/index.html": [("private-governance", "Private decisions with a clear result.", "Review together, vote without public pressure, and keep the result accountable.")],
    "treasury/index.html": [("treasury-coordination", "Treasury work people can review.", "Review requests, approve policy, and keep an evidence trail.")],
    "auctions/index.html": [("sealed-auctions", "Private auctions, clear outcomes.", "Keep live offers private while the final result stays shareable and verifiable.")],
    "proof-workflows/blind-policy/index.html": [("blind-verification", "Prove the rule. Keep the input private.", "Produce a trusted answer without putting sensitive source data on display.")],
}

for relative, items in cards.items():
    path = site / relative
    if not path.is_file():
        raise SystemExit(f"missing live page: {path}")
    html = path.read_text(encoding="utf-8")
    if marker in html:
        continue
    blocks = []
    for slug, title, copy in items:
        blocks.append(
            f'<article style="border:1px solid rgba(255,255,255,.12);border-radius:24px;overflow:hidden;background:#07101f;margin:28px 0;" {marker}>'
            f'<video controls playsinline preload="metadata" poster="/assets/product-videos/{slug}-poster.png" style="display:block;width:100%;aspect-ratio:16/9;background:#000" aria-label="{title}">'
            f'<source src="/assets/product-videos/{slug}.mp4" type="video/mp4"></video>'
            f'<div style="padding:20px 22px"><div style="color:#67e8f9;font-size:11px;letter-spacing:.2em;text-transform:uppercase">Product overview</div>'
            f'<h2 style="margin:10px 0 6px;color:#fff">{title}</h2><p style="margin:0;color:#b9c7d9;line-height:1.6">{copy}</p></div></article>'
        )
    section = '<section aria-label="Commercial product overview" style="width:min(1120px,calc(100% - 36px));margin:36px auto">' + "".join(blocks) + "</section>"
    path.write_text(html.replace("</main>", section + "</main>", 1), encoding="utf-8")
print(f"published {len(cards)} live product pages at {stamp}")
