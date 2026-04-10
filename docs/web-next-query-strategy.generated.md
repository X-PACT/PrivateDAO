# Web Next Query Preservation Strategy

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T01:38:19.552Z`
- status: `query-strategy-live`
- current live surface: `repo root Next.js export`
- next surface root: `apps/web`

## Query Rules

### ?page=proposals

- current behavior: legacy query entry preserved by the root Next.js surface
- next target: `/`
- strategy: `map-to-next-route`
- note: This becomes the primary landing route in apps/web during staged mirror rollout.

### ?page=proof

- current behavior: legacy proof query preserved by the root Next.js surface
- next target: `/proof/`
- strategy: `map-to-next-route`
- note: The route exists in apps/web and is already exportable.

### ?page=security

- current behavior: legacy security query preserved by the root Next.js surface
- next target: `/security/`
- strategy: `map-to-next-route`
- note: Governance V3 and settlement V3 surfaces are available in apps/web.

### ?page=diagnostics

- current behavior: legacy diagnostics query preserved by the root Next.js surface
- next target: `/diagnostics/`
- strategy: `map-to-next-route`
- note: Use apps/web once mirror routing is validated end-to-end.

### ?page=awards

- current behavior: legacy awards query preserved by the root Next.js surface
- next target: `/awards/`
- strategy: `map-to-next-route`
- note: Awards and trust surfaces exist in apps/web.

### ?page=proof&judge=1

- current behavior: forces judge-mode proof entry through the root Next.js surface
- next target: `/proof/?judge=1`
- strategy: `map-to-next-route`
- note: The legacy entrypoint is now preserved in apps/web and keeps the reviewer intent visible inside the proof surface.

### ?page=migrate

- current behavior: legacy migration query preserved by the root Next.js surface
- next target: `/services/`
- strategy: `map-to-next-route`
- note: Services is now the canonical migration and commercial landing surface in apps/web.

### ?page=protocol

- current behavior: legacy protocol query preserved by the root Next.js surface
- next target: `/security/`
- strategy: `map-to-next-route`
- note: Security is now the canonical protocol and hardening route in apps/web.

### ?page=docs&doc=reviewer-fast-path.md

- current behavior: legacy docs-viewer query preserved by the root Next.js surface
- next target: `/documents/reviewer-fast-path/`
- strategy: `map-to-next-route`
- note: Curated reviewer docs now have in-app routes, and the broader markdown corpus is available through /viewer/.

## Commands

- `npm run build:web-next-query-strategy`
- `npm run verify:web-next-query-strategy`
- `npm run build:web-next-cutover-map`
- `npm run verify:web-next-cutover-map`
- `npm run web:verify:live:github`

## Routing Boundary

- preserve legacy query entrypoints through the apps/web root route
- keep docs available only as the archive and raw-reference surface under /docs/
- prefer curated document routes first and fall back to /viewer/ for broader markdown parity
