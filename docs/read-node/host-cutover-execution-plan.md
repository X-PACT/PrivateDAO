# Read-Node Host Cutover And Reverse-Proxy Execution Plan

Last updated: 2026-04-14
Status: planned, not yet cut over

## Purpose

This plan exists to separate the public product shell from backend read infrastructure without breaking trust, reviewer proof, or user-facing routes.

It does not claim that the cutover is already live.

## Target Outcome

PrivateDAO should expose:

- a public application host for the web product
- a dedicated read-node runtime
- stable health and metrics endpoints
- a reverse-proxied `/api/v1` path that feels native to the product

The target experience is:

- users see one coherent app domain
- reads come from a real hosted backend
- writes remain wallet-signed from the client
- proof and diagnostics remain available even if the backend is degraded

## Recommended Topology

### Public Hosts

- `privatedao.org`
  - public product surface
  - marketing, onboarding, governance UI, proof links, docs viewer
- `api.privatedao.org` or same-origin backend behind reverse proxy
  - read-node service
  - health and metrics

### Preferred Production Pattern

Use a dedicated frontend host plus a reverse proxy that binds:

- `/api/v1/*` -> read-node runtime
- `/healthz` -> backend health
- `/api/v1/metrics` -> metrics exporter

This preserves a simple public mental model while keeping backend isolation explicit at the infrastructure layer.

## Edge And Proxy Responsibilities

The reverse proxy layer should:

- terminate TLS
- forward `/api/v1/*` to the backend runtime
- expose `/healthz`
- expose `/api/v1/metrics`
- apply rate limiting and caching only to safe read routes
- avoid caching wallet-specific or rapidly stale governance reads incorrectly

It should not:

- proxy wallet signing
- hold private keys
- mutate on-chain state directly
- pretend static reviewer artifacts are backend proof

## Cutover Stages

### Stage 1: Host Separation

- keep the current static product surface live
- deploy the read-node to a dedicated backend host
- verify internal health and metrics before exposing public paths

### Stage 2: Public Proof

- expose:
  - `/healthz`
  - `/api/v1/metrics`
- verify:
  - route binding
  - latency
  - proposal and DAO read correctness
  - fallback behavior when backend is unavailable

### Stage 3: Same-Origin Product Binding

- bind `/api/v1` through the reverse proxy
- keep existing static routes and `/documents/*` intact
- verify that public routes still work when backend reads are slow

### Stage 4: Operational Hardening

- add access logs
- add upstream timeout policy
- add restart policy
- add alerting on health and stale reads
- add explicit fallback copy in UI when backend reads degrade

## Suggested Reverse-Proxy Rules

### Required

- `GET /healthz`
- `GET /api/v1/*`
- `GET /api/v1/metrics`

### Optional

- cache very short-lived list reads where safe
- add bot and abuse filtering
- add origin restrictions for internal-only ops routes if later needed

## UI Rules During Cutover

- the public site must not present the backend as live until the proxy, health, and metrics are externally verifiable
- the product should continue to show proof and static reviewer surfaces even if the backend is unavailable
- user copy should say:
  - reads are live from hosted infrastructure
  - wallet signing still happens client-side

It should not say:

- backend complete
- production-grade API live
- hosted runtime fully closed

unless those claims are separately verified

## Verification Checklist

1. backend process starts and serves proposal/DAO reads
2. reverse proxy forwards `/api/v1/*` correctly
3. `/healthz` is public and reliable
4. `/api/v1/metrics` is public and reliable
5. product routes still work when backend is slow
6. proof and docs routes remain available without backend dependence
7. logs show correct upstream status for read failures

## Linked Sources

- [backend-cutover-packet.generated.md](/home/x-pact/PrivateDAO/docs/read-node/backend-cutover-packet.generated.md)
- [same-domain-deploy.md](/home/x-pact/PrivateDAO/docs/read-node/same-domain-deploy.md)
- [reviewer-telemetry-packet.generated.md](/home/x-pact/PrivateDAO/docs/reviewer-telemetry-packet.generated.md)
