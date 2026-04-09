# PrivateDAO Web

This app is the new Next.js surface for `PrivateDAO`.

It is being built as an isolated migration target under `apps/web` so the current live surface in `docs/index.html` stays intact while the React version is developed and verified.

## Scope

The goal is not a generic DAO dashboard. This app needs to preserve the real product story already present in the repository:

- private governance on Solana
- proposal lifecycle: create -> commit -> reveal -> execute
- additive hardening paths including V3 governance and settlement
- ZK, REFHE, MagicBlock, and Fast RPC surfaces
- buyer-facing service and pilot surfaces

## Current Routes

- `/` overview and product landing page
- `/command-center` guided buyer / operator / reviewer workflow
- `/dashboard` governance dashboard shell
- `/analytics` analytics and treasury activity views
- `/proof` reviewer and proof surface
- `/security` additive hardening and launch boundary surface
- `/diagnostics` runtime, readiness, and verification surface
- `/services` commercial comparison and pilot surface
- `/awards` recognition and credibility surface

## Local Development

Run from the repo root:

```bash
npm run web:dev
```

Or directly:

```bash
cd apps/web
npm run dev
```

## Static Export Modes

This app is now configured for static export so it can become a mirror-safe deployment target before cutover.

From the repo root:

```bash
npm run web:build
npm run web:build:github
npm run web:build:root
```

Meaning:

- `web:build` uses the default environment and current base-path assumptions
- `web:build:github` builds for `https://x-pact.github.io/PrivateDAO/`
- `web:build:root` builds for a root domain such as `https://PrivateDAO.xyz/`

The app uses `NEXT_PUBLIC_BASE_PATH` and `NEXT_PUBLIC_LIVE_SITE_URL` to keep routes, assets, metadata, and reviewer links consistent across both deployment targets.

Mirror bundle helpers from the repo root:

```bash
npm run web:bundle:github
npm run web:bundle:root
npm run web:verify:bundle:github
npm run web:verify:bundle:root
npm run build:web-next-handoff
npm run verify:web-next-handoff
```

These produce export-ready directories and archives under `dist/`.

Route parity reference:

- `docs/web-next-route-parity.md`
- `docs/web-next-handoff.generated.md`

## Important Constraint

This app does not replace the published static site yet. The `docs/` surface remains the live reviewer-facing interface until the Next.js build reaches parity and deployment cutover is explicitly handled.
