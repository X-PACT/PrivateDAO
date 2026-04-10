# Web Next Query Preservation Strategy

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T00:48:14.161Z`
- status: `query-strategy-next-ready`
- current live surface: `docs/index.html`
- next surface root: `apps/web`

## Query Rules

### ?page=proposals

- current behavior: opens the current docs home surface
- next target: `/`
- strategy: `map-to-next-route`
- note: This becomes the primary landing route in apps/web during staged mirror rollout.

### ?page=proof

- current behavior: opens the proof center in docs
- next target: `/proof/`
- strategy: `map-to-next-route`
- note: The route exists in apps/web and is already exportable.

### ?page=security

- current behavior: opens the security surface in docs
- next target: `/security/`
- strategy: `map-to-next-route`
- note: Governance V3 and settlement V3 surfaces are available in apps/web.

### ?page=diagnostics

- current behavior: opens diagnostics and runtime panels in docs
- next target: `/diagnostics/`
- strategy: `map-to-next-route`
- note: Use apps/web once mirror routing is validated end-to-end.

### ?page=awards

- current behavior: opens awards and trust material in docs
- next target: `/awards/`
- strategy: `map-to-next-route`
- note: Awards and trust surfaces exist in apps/web.

### ?page=proof&judge=1

- current behavior: forces judge-mode proof entry in docs
- next target: `/proof/?judge=1`
- strategy: `map-to-next-route`
- note: The legacy entrypoint is now preserved in apps/web and keeps the reviewer intent visible inside the proof surface.

### ?page=migrate

- current behavior: opens migration-specific surface in docs
- next target: `/services/`
- strategy: `map-to-next-route`
- note: Services is now the canonical migration and commercial landing surface in apps/web.

### ?page=protocol

- current behavior: opens protocol-centric narrative in docs
- next target: `/security/`
- strategy: `map-to-next-route`
- note: Security is now the canonical protocol and hardening route in apps/web.

### ?page=docs&doc=reviewer-fast-path.md

- current behavior: opens the docs viewer directly on reviewer-fast-path.md
- next target: `/documents/reviewer-fast-path/`
- strategy: `map-to-next-route`
- note: Curated reviewer docs now have in-app routes, and the broader markdown corpus is available through /viewer/.

## Commands

- `npm run build:web-next-query-strategy`
- `npm run verify:web-next-query-strategy`
- `npm run build:web-next-cutover-map`
- `npm run verify:web-next-cutover-map`

## Routing Boundary

- do not rewrite docs query entrypoints in-place while docs remains canonical
- map legacy query entrypoints to apps/web routes while docs remains the canonical live surface
- keep docs available as the authoritative archive until the mirror replaces it explicitly
- prefer curated document routes first and fall back to /viewer/ for broader markdown parity
