# Read-Node Backend Cutover Packet

- Generated at: `2026-04-11T18:24:15.123Z`
- Activation state: Indexed governance reads and runtime evidence are live in the product, but same-domain backend serving is still pending a dedicated host and reverse proxy outside GitHub Pages.
- Exact boundary: Do not claim `/api/v1` as live on the current public site until the read node is hosted behind a real domain or subdomain with health, metrics, and reverse-proxy evidence.

## Deployment Target

- frontend host: `https://app.privatedao.xyz/`
- read API path: `/api/v1`
- health path: `/healthz`
- metrics path: `/api/v1/metrics`
- same-domain recommended: `true`

## Public Proof

- indexed proposals: `41`
- unique DAOs: `21`
- confidential payouts: `8`
- REFHE settled: `4`
- MagicBlock settled: `3`
- telemetry packet generated at: `2026-04-11T14:20:29.957Z`

## Route Binding Strategy

- Serve the static frontend from a dedicated application host instead of GitHub Pages-only origin.
- Reverse-proxy `/api/v1/*` to the read-node process while keeping writes wallet-signed on the client.
- Expose `/healthz` and `/api/v1/metrics` publicly for reviewer and operator verification.
- Keep all existing reviewer packets and `/documents/*` routes bound to the same truth sources after host cutover.

## UI Fallback Policy

- Until backend cutover is live, keep read-node evidence available through in-app packets and snapshots.
- Use static reviewer telemetry, diagnostics, and proof routes as the public truth surfaces on GitHub Pages.
- Do not hide the backend hosting gap from buyers, judges, or operators.
- After cutover, keep the static routes readable as fallback documentation rather than the primary service rail.

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

