# Web Next Document Viewer Parity Plan

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-09T23:56:46.806Z`
- status: `doc-viewer-parity-staged`
- current canonical viewer: `docs/index.html?page=docs&doc=...`
- next app root: `apps/web`

## Document Classes

### reviewer-core

- next surface: `/proof/`
- strategy: `surface-as-links`
- rationale: These documents already appear as proof and reviewer links in apps/web, but the full interactive docs-viewer behavior is not yet ported.

Documents:

- `reviewer-fast-path.md`
- `reviewer-surface-map.md`
- `audit-packet.generated.md`
- `mainnet-readiness.generated.md`
- `test-wallet-live-proof-v3.generated.md`

### ops-and-readiness

- next surface: `/diagnostics/`
- strategy: `surface-as-links`
- rationale: These operator and launch artifacts belong in diagnostics and trust surfaces as direct links before a dedicated embedded viewer exists.

Documents:

- `mainnet-blockers.md`
- `launch-trust-packet.generated.md`
- `go-live-attestation.generated.json`
- `release-drill.generated.md`
- `launch-ops-checklist.md`

### commercial-and-pilot

- next surface: `/services/`
- strategy: `surface-as-links`
- rationale: The commercial journey already exists in apps/web and can continue using direct document links without recreating the docs viewer first.

Documents:

- `service-catalog.md`
- `pilot-program.md`
- `pricing-model.md`
- `trust-package.md`
- `service-level-agreement.md`

### deep-reference

- next surface: `/security/`
- strategy: `candidate-for-future-viewer`
- rationale: These are long-form technical references better served by a future document browser or MDX content layer.

Documents:

- `zk-layer.md`
- `rpc-architecture.md`
- `backend-operator-flow.md`
- `zk-verifier-strategy.md`
- `read-node/indexer.md`

### current-docs-viewer-only

- next surface: `docs/index.html`
- strategy: `keep-in-docs-viewer`
- rationale: Query-driven document-viewer entrypoints remain canonical in docs until apps/web gets explicit viewer parity.

Documents:

- `?page=docs&doc=reviewer-fast-path.md`
- `?page=docs&doc=service-catalog.md`
- `?page=docs&doc=mainnet-blockers.md`

## Next Step Phases

- phase 1: keep docs viewer canonical and link documents from apps/web surfaces
- phase 2: add a dedicated apps/web document route with curated proof, trust, and ops packets
- phase 3: decide whether long-form technical docs should move into MDX or remain raw-doc references

## Commands

- `npm run build:web-next-doc-viewer-plan`
- `npm run verify:web-next-doc-viewer-plan`
- `npm run build:web-next-query-strategy`
- `npm run verify:web-next-query-strategy`

## Boundary

- do not claim docs-viewer parity today
- keep ?page=docs&doc=... canonical until an explicit Next document route exists
- prefer reviewer-safe raw links over partial embedded viewer behavior
