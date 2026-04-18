# Reviewer Telemetry Packet

## Overview

- project: `PrivateDAO`
- generated at: `2026-04-18T02:52:05.953Z`
- reviewer intent: Show the shortest truth-synced route into runtime maturity, hosted reads, indexed governance, and infrastructure-facing reviewer value without claiming unsupported partnerships or mainnet readiness.

## Truth Sources

- Runtime evidence: `2026-04-18T02:51:20.278Z` via `docs/runtime-evidence.generated.md`
- Frontier integrations: `2026-04-10T05:21:06.356Z` via `docs/frontier-integrations.generated.md`
- Read-node snapshot: `2026-04-18T00:09:33.941Z` via `docs/read-node/snapshot.generated.md`
- Devnet service metrics: `2026-04-18T02:51:20.278Z` via `apps/web/src/lib/devnet-service-metrics.ts`

## What Works Now

- Hosted reads expose 43 indexed proposals across 23 DAOs through the backend-indexer path.
- Diagnostics, analytics, and services remain live reviewer-visible routes starting from https://privatedao.org/diagnostics/.
- 7/7 canonical governance lifecycle transactions are finalized in the current integrations package.
- 5/5 confidential settlement corridor transactions are finalized in the current integrations package.
- 4 REFHE-settled and 3 MagicBlock-settled proposal paths are already reflected in the indexed source.

## What Is Externally Or Operationally Proven Now

- Runtime evidence package generated at 2026-04-18T02:51:20.278Z and published as docs/runtime-evidence.generated.md.
- Frontier integrations package generated at 2026-04-10T05:21:06.356Z with reviewer entry https://privatedao.org/proof/?judge=1.
- Read-node snapshot generated at 2026-04-18T00:09:33.941Z on slot 456264549 against https://api.devnet.solana.com.
- Proposal flow health, wallet readiness, and proof freshness summaries are taken from the same devnet service metrics module used by the live app.
- Unexpected runtime failures remain 0 and unexpected adversarial successes remain 0.

## Hosted-Read Proof

- read path: `backend-indexer`
- rpc endpoint: `https://api.devnet.solana.com`
- slot: `456264549`
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- commitment: `confirmed`
- indexed proposals: `43`
- indexed DAOs: `23`

## Runtime Snapshot

- diagnostics page: `https://privatedao.org/diagnostics/`
- wallet count: `5`
- unexpected failures: `0`
- fallback recovered: `true`
- stale blockhash recovered: `true`
- pending real-device targets: `5`

## Integrations Snapshot

- governance status: `verified-devnet-governance-path`
- confidential status: `verified-devnet-confidential-path`
- governance finalized: `7/7`
- confidential finalized: `5/5`
- zk anchors confirmed: `3/3`

## Export-Ready Summaries

- Proposal flow health: 37.5% — 7/7 governance proof steps are finalized. 0 proposal is already executed on devnet, 0 proposal is still in commit mode, and 5 proposal is still waiting on settlement evidence. (Open proof and execution: /proof/?judge=1)
- Wallet-by-wallet readiness: 25% — 1/4 browser wallet targets have completed connect + sign + submit on Devnet. Diagnostics are visible for 5/5 support-matrix entries, and pending real-device targets remain explicit in runtime evidence. (Open wallet diagnostics: /diagnostics)
- Proof freshness: fresh this hour — Runtime evidence fresh this hour, Devnet canary 3h old, and integration evidence 8d old remain published together. (Open trust documents: /documents/live-proof-v3)
- Hosted read coverage: 41 — The backend-indexer read path currently exposes 41 indexed proposals across 21 DAOs. (Open services: /services)
- MagicBlock settlement completion: 100% — 5/5 confidential corridor transactions finalized in the current integration evidence package. (Open diagnostics: /diagnostics)
- Primary RPC latency: 289 ms — Current blockhash latency from the primary Devnet endpoint. Version latency is 2364 ms. (Open analytics: /analytics)

## Reviewer-First Path

1. Open telemetry packet: Start from the generated truth-synced packet instead of inferring readiness from multiple pages. (/documents/reviewer-telemetry-packet)
2. Open diagnostics: Validate runtime health and reviewer-visible operational signals. (/diagnostics)
3. Open analytics: Inspect export-ready summaries sourced from the same metrics module. (/analytics)
4. Open services: Confirm the hosted-read and buyer-facing infrastructure route. (/services)

## Best Demo Route

- start: `/services`
- sequence: `/services` -> `/diagnostics` -> `/analytics` -> `/documents/reviewer-telemetry-packet`
- explanation: Lead with the buyer-visible infrastructure surface, then validate runtime health, then show export-ready analytics summaries, and finally land on the reviewer packet that binds the same truth sources together.

## Exact Boundary

- This packet does not claim live third-party analytics partnerships.
- It does not claim production mainnet custody or launch approval.
- It does not replace canonical custody proof, launch trust packet, or mainnet blockers.
- Pending real-device captures remain explicit and are not hidden behind aggregate metrics.

## Linked Docs

- `docs/reviewer-telemetry-packet.generated.md`
- `docs/runtime-evidence.generated.md`
- `docs/frontier-integrations.generated.md`
- `docs/read-node/snapshot.generated.md`
- `docs/launch-trust-packet.generated.md`
- `docs/canonical-custody-proof.generated.md`

## Live Routes

- https://privatedao.org/services/
- https://privatedao.org/diagnostics/
- https://privatedao.org/analytics/
- https://privatedao.org/documents/reviewer-telemetry-packet/

## Canonical Commands

- `npm run build:reviewer-telemetry-packet`
- `npm run verify:reviewer-telemetry-packet`
- `npm run build:runtime-evidence`
- `npm run verify:runtime-evidence`
- `npm run build:frontier-integrations`
- `npm run verify:frontier-integrations`
- `npm run build:read-node-snapshot`
- `npm run verify:read-node-snapshot`
