# `.xyz` Mirror Cutover Checklist

This checklist is for adding `app.privatedao.xyz` as a mirror of the current review surface without breaking the existing GitHub Pages entrypoint.

Current review URL:

- `https://x-pact.github.io/PrivateDAO/`

Planned mirror:

- `https://app.privatedao.xyz/`

## What Is Already Ready In-Repo

- the root Next.js export is already the live surface
- the live frontend derives canonical and social URL metadata from the active origin
- self-links inside the app no longer hardcode only the review host
- copied evidence packets can reference the active frontend origin
- review artifacts still keep the GitHub Pages URL as the canonical review surface during active judging

## External Steps Still Required

1. Create the DNS record for `app.privatedao.xyz`
2. Point the mirror domain at the same static bundle host used for the review surface
3. Ensure HTTPS is active and valid
4. Confirm the mirror serves the same root Next.js export bundle and assets
5. Verify that reviewer links remain unchanged in public submissions until mirror validation is complete

## Cutover Validation

Validate both URLs manually:

- `https://x-pact.github.io/PrivateDAO/`
- `https://app.privatedao.xyz/`

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

When the mirror is live, capture:

- screenshot of home page on `.xyz`
- screenshot of `/proof/?judge=1` on `.xyz`
- screenshot of `/diagnostics/` on `.xyz`
- browser metadata inspection showing canonical/OG URL on `.xyz`
- one note confirming GitHub Pages still serves the same surface

## Success Condition

The mirror is considered ready when:

- both domains serve the same UI and same asset set
- query-based entrypoints still work
- metadata follows the active origin
- no reviewer-facing link is broken
- no production claims are changed by the mirror itself
