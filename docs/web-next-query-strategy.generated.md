# Web Next Query Preservation Strategy

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-09T23:54:08.836Z`
- status: `query-strategy-staged`
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
- next target: `/proof/`
- strategy: `preserve-on-docs`
- note: Keep the query-driven judge entrypoint on docs until apps/web reproduces the same review-specific behavior.

### ?page=migrate

- current behavior: opens migration-specific surface in docs
- next target: `/services/`
- strategy: `preserve-on-docs`
- note: The closest Next surface is services, but exact migration parity is not yet complete.

### ?page=protocol

- current behavior: opens protocol-centric narrative in docs
- next target: `/security/`
- strategy: `preserve-on-docs`
- note: Protocol detail is distributed across security and proof routes in apps/web.

### ?page=docs&doc=reviewer-fast-path.md

- current behavior: opens the docs viewer directly on reviewer-fast-path.md
- next target: `/proof/`
- strategy: `defer-until-doc-viewer`
- note: Do not redirect this until a dedicated document viewer exists in apps/web.

## Commands

- `npm run build:web-next-query-strategy`
- `npm run verify:web-next-query-strategy`
- `npm run build:web-next-cutover-map`
- `npm run verify:web-next-cutover-map`

## Routing Boundary

- do not rewrite docs query entrypoints in-place while docs remains canonical
- only map low-risk page routes to apps/web during mirror staging
- leave judge-mode and docs-viewer flows on docs until route-specific parity is explicit
