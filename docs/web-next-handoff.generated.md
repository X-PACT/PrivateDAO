# Web Next Handoff Manifest

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T01:12:03.588Z`
- current status: `live-on-root`
- current live surface: `repo root Next.js export`
- next app root: `apps/web`

Boundary:

- apps/web static export at the repo root is now the canonical live reviewer-facing surface, while docs remains the archive and raw-reference surface.

## Mirror Modes

### github

- base path: `/PrivateDAO`
- bundle directory: `dist/web-mirror-github`
- archive: `dist/web-mirror-github.tar.gz`
- status: `published-at-root`
- verification: `npm run web:verify:bundle:github`

### root

- base path: `/`
- bundle directory: `dist/web-mirror-root`
- archive: `dist/web-mirror-root.tar.gz`
- status: `planned-build`
- verification: `npm run web:verify:bundle:root`

## Required Routes

- `/` -> `index.html` (buyer, judge, and operator landing surface)
- `/command-center/` -> `command-center/index.html` (proposal workspace and execution journey)
- `/dashboard/` -> `dashboard/index.html` (DAO, proposal, treasury, and execution overview)
- `/proof/` -> `proof/index.html` (baseline proof, V3 proof, and reviewer trail)
- `/documents/` -> `documents/index.html` (curated reviewer and trust document library)
- `/viewer/` -> `viewer/index.html` (repository markdown viewer for broader docs parity and legacy query preservation)
- `/security/` -> `security/index.html` (governance and settlement hardening surfaces)
- `/diagnostics/` -> `diagnostics/index.html` (artifact health, runtime checks, and launch blockers)
- `/analytics/` -> `analytics/index.html` (votes, treasury actions, and readiness analytics)
- `/services/` -> `services/index.html` (commercial packs, pilot, and SLA journey)
- `/awards/` -> `awards/index.html` (awards, trust links, and reviewer credibility path)

## Parity Documents

- `docs/web-next-cutover.md`
- `docs/web-next-route-parity.md`
- `docs/web-next-doc-viewer-plan.generated.md`
- `docs/domain-mirror.md`
- `docs/xyz-mirror-cutover-checklist.md`

## Commands

- `npm run web:build:github`
- `npm run web:bundle:github`
- `npm run web:verify:bundle:github`
- `npm run web:publish:github`
- `npm run web:verify:live:github`
- `npm run build:web-next-handoff`
- `npm run verify:web-next-handoff`

## Cutover Rule

- treat the repo root Next.js export as the canonical live surface
- preserve docs as the archive and raw-reference surface under /docs/
- keep reviewer links, judge-mode proof, and legacy docs entrypoints resolving through apps/web compatibility routes
