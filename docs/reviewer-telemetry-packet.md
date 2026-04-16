# Reviewer Telemetry Packet

This packet is the shortest reviewer-first route into the data, runtime, and hosted-read story behind PrivateDAO.

It is intentionally evidence-bound:

- it points to live product surfaces
- it uses already-generated runtime and integration evidence
- it does not claim external analytics integrations or partner endorsements that are not already visible

## What works now

- diagnostics surface for runtime health and reviewer bundle visibility
- analytics surface for proposal, vote, and treasury-operating summaries
- hosted-read and API packaging inside the services surface
- indexed proposal registry and read-node snapshot used by the live app
- runtime evidence, frontier integrations, and launch trust packets already published

## What is operationally visible now

- live product routes:
  - `https://privatedao.org/analytics/`
  - `https://privatedao.org/diagnostics/`
  - `https://privatedao.org/services/`
- generated evidence:
  - `docs/runtime-evidence.generated.md`
  - `docs/frontier-integrations.generated.md`
  - `docs/read-node/snapshot.generated.md`
  - `docs/launch-trust-packet.generated.md`

## Reviewer-first path

1. Open `/diagnostics`
2. Open `/analytics`
3. Open `/services`
4. Open `docs/frontier-integrations.generated.md`
5. Open `docs/runtime-evidence.generated.md`

## Best demo route

- Start at `https://privatedao.org/services/`
- move into `https://privatedao.org/diagnostics/`
- then confirm the operational summaries at `https://privatedao.org/analytics/`

This order shows that the infrastructure story is:

- buyer-visible
- operator-visible
- reviewer-visible

instead of being buried as backend implementation detail.

## Why this corridor matters

PrivateDAO is stronger for infrastructure, data, and analytics opportunities when it behaves like a product with:

- hosted reads
- diagnostics
- export-ready summaries
- reviewer-visible runtime proof

rather than a governance app that merely mentions RPC.

It also matters as public-good infrastructure because it makes telemetry, hosted reads, and runtime evidence easier for the broader ecosystem to inspect and reuse as part of serious governance operations.

## Product boundary

- This packet does not claim live third-party analytics partnerships.
- It does not claim completed production release approval.
- It does not replace canonical custody, launch-trust, or release-readiness packets.

Use this packet when the reviewer wants to inspect:

- runtime maturity
- hosted-read value
- infrastructure buyer value
- telemetry clarity
- data-side competition readiness
