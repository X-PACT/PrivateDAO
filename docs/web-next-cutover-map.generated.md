# Web Next Cutover Map

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T00:20:20.743Z`
- status: `staged-cutover-map`
- current live surface: `docs/index.html`
- next surface root: `apps/web`

## Staged Route Mapping

### /?page=proposals

- purpose: current live home, packs, proposal lifecycle, and product narrative
- next route: `/`
- parity status: `ready-for-mirror`
- note: Use `/command-center/` for the deeper operator workflow after landing.

### /?page=proof

- purpose: proof center and reviewer flow
- next route: `/proof/`
- parity status: `ready-for-mirror`
- note: Judge links still need mirror-origin validation before canonical cutover.

### /?page=proof&judge=1

- purpose: judge-focused review surface
- next route: `/proof/`
- parity status: `staged-partial`
- note: The route exists, but the exact judge query-mode behavior remains anchored to the current docs surface until mirror validation is complete.

### /?page=security

- purpose: security, V3 hardening, and launch boundary surface
- next route: `/security/`
- parity status: `ready-for-mirror`
- note: Security narrative is present in apps/web and exportable today.

### /?page=diagnostics

- purpose: runtime, artifact, and launch-blocker diagnostics
- next route: `/diagnostics/`
- parity status: `ready-for-mirror`
- note: Diagnostics parity is UI-level; keep docs surface as the reviewer anchor until cutover.

### /?page=awards

- purpose: awards and trust surface
- next route: `/awards/`
- parity status: `ready-for-mirror`
- note: Awards, pitch, trust packet, and proof links exist in apps/web.

### /?page=migrate

- purpose: migration and Realms-adjacent transition surface inside the current docs app
- next route: `/services/`
- parity status: `staged-partial`
- note: Commercial and migration-adjacent story exists, but the exact docs migration screen is not yet a dedicated Next route.

### /?page=protocol

- purpose: protocol reference and system explanation
- next route: `/security/`
- parity status: `staged-partial`
- note: Protocol explanation is distributed across security and proof surfaces rather than a dedicated route.

### /?page=docs&doc=reviewer-fast-path.md

- purpose: document viewer entrypoint for reviewer packets
- next route: `/documents/reviewer-fast-path/`
- parity status: `staged-partial`
- note: A curated in-app document route now exists, but the full query-driven docs-viewer behavior remains canonical in docs.

## Commands

- `npm run build:web-next-cutover-map`
- `npm run verify:web-next-cutover-map`
- `npm run web:verify:bundle:github`
- `npm run verify:web-next-handoff`

## Cutover Boundary

- preserve current docs query-entrypoints during staged mirror rollout
- treat apps/web as route-parity candidate, not canonical replacement yet
- keep docs document-viewer flows canonical until curated document routes expand into full viewer parity
