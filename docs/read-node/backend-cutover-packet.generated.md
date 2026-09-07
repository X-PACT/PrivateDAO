# Read-Node Backend Cutover Packet

- Generated at: `2026-05-26T07:20:17.742Z`
- Activation state: Indexed governance reads, runtime evidence, and the hosted read-node API are live. The canonical frontend remains https://privatedao.org/ while the API is served from https://api.privatedao.org/api/v1.
- Exact boundary: Use https://api.privatedao.org/api/v1 as the live read-node boundary. Same-domain `/api/v1` on the static frontend remains a future reverse-proxy consolidation step, not the current production-candidate API host.

## Deployment Target

- frontend host: `https://privatedao.org/`
- read API path: `https://api.privatedao.org/api/v1`
- health path: `https://api.privatedao.org/healthz`
- metrics path: `https://api.privatedao.org/api/v1/metrics`
- same-domain recommended: `true`

## Public Proof

- indexed proposals: `17`
- unique DAOs: `16`
- confidential payouts: `3`
- REFHE settled: `2`
- MagicBlock settled: `1`
- telemetry packet generated at: `2026-05-26T03:09:35.774Z`

## Route Binding Strategy

- Keep the canonical frontend at `https://privatedao.org/` while judges are actively using the submitted links.
- Serve read-node traffic from `https://api.privatedao.org/api/v1` until a same-domain reverse proxy is intentionally cut over.
- Expose `https://api.privatedao.org/healthz` and `https://api.privatedao.org/api/v1/metrics` publicly for reviewer and operator verification.
- Keep all existing reviewer packets and `/documents/*` routes bound to the same truth sources after host cutover.

## UI Fallback Policy

- If the API host is unreachable, keep read-node evidence available through in-app packets and snapshots.
- Use static reviewer telemetry, diagnostics, and proof routes as fallback truth surfaces on GitHub Pages.
- Do not send judges to any alternate mirror until TLS and serving are verified end-to-end.
- After any future same-domain cutover, keep the static routes readable as fallback documentation rather than the primary service rail.

## Buyer Path

- `/services`
- `/documents/reviewer-telemetry-packet`
- `/documents/read-node-backend-cutover`

## Operator Path

- `/command-center`
- `/documents/read-node-ops`
- `/documents/read-node-backend-cutover`

## Judge Path

- `/proof/?judge=1`
- `/documents/read-node-snapshot`
- `/documents/read-node-backend-cutover`

## Linked Docs

- `docs/read-node/indexer.md`
- `docs/read-node/snapshot.generated.md`
- `docs/read-node/ops.generated.md`
- `docs/read-node/same-domain-deploy.md`
- `docs/reviewer-telemetry-packet.generated.md`

## Live Routes

- https://privatedao.org/services/
- https://privatedao.org/command-center/
- https://privatedao.org/proof/?judge=1
- https://privatedao.org/documents/read-node-snapshot/

## Commands

- `npm run start:read-node`
- `npm run build:read-node-backend-cutover`
- `npm run verify:read-node-backend-cutover`
- `npm run verify:read-node-snapshot`
- `npm run verify:reviewer-telemetry-packet`

