# Web Next Cutover Map

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T01:11:33.994Z`
- status: `live-cutover-map`
- current live surface: `repo root Next.js export`
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
- next route: `/proof/?judge=1`
- parity status: `ready-for-mirror`
- note: Judge-mode query is preserved inside the Next proof surface; mirror-origin validation still remains part of cutover execution.

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
- parity status: `ready-for-mirror`
- note: Services is the canonical migration and commercial landing surface in apps/web.

### /?page=protocol

- purpose: protocol reference and system explanation
- next route: `/security/`
- parity status: `ready-for-mirror`
- note: Security is now the canonical protocol and hardening surface in apps/web.

### /?page=docs&doc=reviewer-fast-path.md

- purpose: document viewer entrypoint for reviewer packets
- next route: `/documents/reviewer-fast-path/`
- parity status: `ready-for-mirror`
- note: Curated reviewer packets route to /documents and broader markdown parity is preserved through /viewer/.

## Commands

- `npm run build:web-next-cutover-map`
- `npm run verify:web-next-cutover-map`
- `npm run web:verify:bundle:github`
- `npm run web:verify:live:github`
- `npm run verify:web-next-handoff`

## Cutover Boundary

- apps/web export at the repo root is the canonical live surface
- preserve docs as the archive and raw-reference surface under /docs/
- use /documents for curated packets and /viewer for broader repository markdown parity
