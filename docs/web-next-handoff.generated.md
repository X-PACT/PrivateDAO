# Web Next Handoff Manifest

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-09T23:47:22.243Z`
- current status: `staged-not-live`
- current live surface: `docs/index.html`
- next app root: `apps/web`

Boundary:

- docs remains the canonical live reviewer-facing surface until explicit cutover.

## Mirror Modes

### github

- base path: `/PrivateDAO`
- bundle directory: `dist/web-mirror-github`
- archive: `dist/web-mirror-github.tar.gz`
- status: `built-and-verified`
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
- `/security/` -> `security/index.html` (governance and settlement hardening surfaces)
- `/diagnostics/` -> `diagnostics/index.html` (artifact health, runtime checks, and launch blockers)
- `/analytics/` -> `analytics/index.html` (votes, treasury actions, and readiness analytics)
- `/services/` -> `services/index.html` (commercial packs, pilot, and SLA journey)
- `/awards/` -> `awards/index.html` (awards, trust links, and reviewer credibility path)

## Parity Documents

- `docs/web-next-cutover.md`
- `docs/web-next-route-parity.md`
- `docs/domain-mirror.md`
- `docs/xyz-mirror-cutover-checklist.md`

## Commands

- `npm run web:build:github`
- `npm run web:bundle:github`
- `npm run web:verify:bundle:github`
- `npm run build:web-next-handoff`
- `npm run verify:web-next-handoff`

## Cutover Rule

- do not replace docs/index.html silently
- do not call apps/web canonical until reviewer links and judge links resolve under the mirror origin
- preserve current GitHub Pages reviewer paths while the mirror is staged
