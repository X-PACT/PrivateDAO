# Web Next Document Viewer Parity Plan

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-10T00:48:51.064Z`
- status: `doc-viewer-parity-next-ready`
- current canonical viewer: `docs/index.html?page=docs&doc=...`
- next app root: `apps/web`

## Document Classes

### reviewer-core

- next surface: `/proof/`
- strategy: `surface-as-links`
- rationale: These documents already appear as proof and reviewer links in apps/web, and key reviewer packets now have curated in-app routes.

Documents:

- `reviewer-fast-path.md`
- `reviewer-surface-map.md`
- `audit-packet.generated.md`
- `mainnet-readiness.generated.md`
- `test-wallet-live-proof-v3.generated.md`

### ops-and-readiness

- next surface: `/diagnostics/`
- strategy: `surface-as-links`
- rationale: These operator and launch artifacts belong in diagnostics and trust surfaces, with curated packets available directly in apps/web.

Documents:

- `mainnet-blockers.md`
- `launch-trust-packet.generated.md`
- `go-live-attestation.generated.json`
- `release-drill.generated.md`
- `launch-ops-checklist.md`

### commercial-and-pilot

- next surface: `/services/`
- strategy: `surface-as-links`
- rationale: The commercial journey already exists in apps/web and now links into curated in-app documents for the highest-value commercial packets.

Documents:

- `service-catalog.md`
- `pilot-program.md`
- `pricing-model.md`
- `trust-package.md`
- `service-level-agreement.md`

### deep-reference

- next surface: `/security/`
- strategy: `candidate-for-future-viewer`
- rationale: These are long-form technical references now supported by the generic /viewer/ route, while curated routes remain preferred for the highest-signal packets.

Documents:

- `zk-layer.md`
- `rpc-architecture.md`
- `backend-operator-flow.md`
- `zk-verifier-strategy.md`
- `read-node/indexer.md`

### legacy-query-entrypoints

- next surface: `apps/web /documents + /viewer`
- strategy: `surface-as-links`
- rationale: Legacy query entrypoints now have explicit Next routes, using curated documents when available and /viewer/ for broader markdown parity.

Documents:

- `?page=docs&doc=reviewer-fast-path.md`
- `?page=docs&doc=service-catalog.md`
- `?page=docs&doc=mainnet-blockers.md`

## Next Step Phases

- phase 1: preserve high-signal reviewer and trust packets in curated /documents routes
- phase 2: preserve broader markdown parity through /viewer/[...slug]
- phase 3: decide whether the remaining long-form docs should move into MDX or stay repository-driven

## Commands

- `npm run build:web-next-doc-viewer-plan`
- `npm run verify:web-next-doc-viewer-plan`
- `npm run build:web-next-query-strategy`
- `npm run verify:web-next-query-strategy`

## Boundary

- docs remains the canonical live surface until cutover is explicit
- legacy docs queries now have Next destinations through curated /documents routes or the generic /viewer route
- raw repository files remain authoritative even when rendered in-app
