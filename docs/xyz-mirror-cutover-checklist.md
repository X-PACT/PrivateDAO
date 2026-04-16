# `.xyz` Mirror Cutover Checklist

This checklist is for preserving the canonical production domain during any future hosting change without breaking the current reviewer surface.

Current canonical review URL:

- `https://privatedao.org/`

## What Is Already Ready In-Repo

- the root Next.js export is already the live surface
- the live frontend derives canonical and social URL metadata from the active origin
- self-links inside the app no longer hardcode only the review host
- copied evidence packets can reference the active frontend origin
- review artifacts now keep `https://privatedao.org/` as the canonical review surface during active judging

## External Steps Still Required

1. keep the canonical product domain serving the same root bundle and assets
2. ensure HTTPS remains active and valid
3. confirm any alternate host serves the same interface only if needed
4. verify that reviewer links remain unchanged in public submissions

## Cutover Validation

Validate the canonical domain manually:

- `https://privatedao.org/`

Check the following at both URLs:

1. Home page loads without console-breaking errors
2. `/proof/?judge=1` still opens the proof view
3. `/diagnostics/` still opens diagnostics
4. top navigation works
5. `Connect Wallet` remains visible and usable
6. live proof links open correctly
7. copied judge / pilot / evidence packets use the active origin where appropriate
8. Open Graph / canonical metadata reflects the active domain

## Do Not Do This Yet

Do not replace the canonical review links in:

- `README.md`
- submission answers
- reviewer packets
- generated attestations

until the mirror has been verified end-to-end.

## Evidence To Capture

Capture:

- screenshot of home page on `https://privatedao.org/`
- screenshot of `/proof/?judge=1`
- screenshot of `/diagnostics/`
- browser metadata inspection showing canonical/OG URL on `https://privatedao.org/`

## Success Condition

The production domain is considered stable when:

- the canonical domain serves the same UI and asset set consistently
- query-based entrypoints still work
- metadata follows the active origin
- no reviewer-facing link is broken
