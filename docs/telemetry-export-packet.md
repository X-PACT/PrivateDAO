# Telemetry Export Packet

## Purpose

This packet exists for the Dune Analytics and RPC infrastructure corridors.

It answers one practical reviewer question:

**Can PrivateDAO already expose governance activity, runtime health, and buyer-meaningful telemetry as analyzable infrastructure?**

## Short answer

Yes, on Devnet.

PrivateDAO already exposes:

- runtime evidence
- diagnostics
- indexed proposal and DAO coverage
- hosted-read positioning
- reviewer-safe telemetry summaries

It does **not** yet claim:

- a published Dune-native dashboard
- a production mainnet data plane
- same-domain read-node cutover already live on `privatedao.org`

## What works now

### Runtime evidence

- canonical packet: `/documents/runtime-evidence`
- browser-wallet capture registry exists
- real-device capture corridor exists
- reviewer-ready integration packet already binds governance proof and telemetry evidence together

### Diagnostics and analytics

- diagnostics route: `/diagnostics`
- analytics route: `/analytics`
- reviewer telemetry packet: `/documents/reviewer-telemetry-packet`

### Hosted read narrative

- services route: `/services`
- read-node documentation:
  - `/documents/read-node-snapshot`
  - `/documents/read-node-ops`
  - `/documents/read-node-indexer`
  - `/documents/read-node-backend-cutover`

## Why this matters commercially

Telemetry is not a vanity layer for PrivateDAO.

It is part of the commercial product:

- buyers need confidence that governance actions are inspectable
- operators need a readable state surface, not raw RPC friction
- infrastructure sponsors need evidence that fast reads support a real user workflow
- analysts need summary-grade outputs that map directly to live proposal state and runtime health

## Strongest reviewer path

1. Open `/services`
2. Open `/diagnostics`
3. Open `/analytics`
4. Open `/documents/reviewer-telemetry-packet`
5. Open `/documents/frontier-integrations`

## Export-ready story

The export story should stay bounded to these claims:

- governance actions generate inspectable runtime evidence
- the hosted-read corridor can summarize indexed DAO and proposal state
- telemetry is already presented in reviewer-safe form
- the current product can be extended into Dune-native or partner-native exports later

## Best fit tracks

- Dune Analytics Frontier Data Sidetrack
- RPC Infrastructure Credits
- Startup Accelerator Grant

## Honest boundary

This packet proves that telemetry and hosted-read value are already part of the product surface.

It does not prove:

- Dune-native publication
- partner-native analytics deployment
- production mainnet data infrastructure

## Canonical linked docs

- `docs/reviewer-telemetry-packet.generated.md`
- `docs/runtime-evidence.generated.md`
- `docs/frontier-integrations.generated.md`
- `docs/read-node/snapshot.generated.md`
- `docs/read-node/ops.generated.md`
- `docs/read-node/indexer.md`
- `docs/read-node/backend-cutover-packet.generated.md`
