# Next.js Route Parity

This checklist defines the minimum route parity expected before `apps/web` can replace or formally mirror the current `docs/` reviewer surface.

It is a UI parity checklist, not a protocol claim.

## Required Routes

- `/`
- `/command-center/`
- `/dashboard/`
- `/proof/`
- `/security/`
- `/diagnostics/`
- `/analytics/`
- `/services/`
- `/awards/`

## Route Expectations

### `/`

- Product narrative for buyers, judges, and operators
- Command Center preview
- Proof, security, services, and diagnostics entry points

### `/command-center/`

- Buyer journey rail
- Proposal workspace
- Wallet runtime panel
- Proof links

### `/proof/`

- Baseline proof
- V3 proof
- Frontier integrations
- Audit and launch trust closure

### `/security/`

- Governance Hardening V3
- Settlement Hardening V3
- Frontier integrations
- Launch boundary honesty

### `/diagnostics/`

- Generated artifacts and reviewer bundle health
- Runtime checks
- Launch blockers

### `/analytics/`

- Vote, proposal, and treasury analytics
- Readiness summary
- Launch blockers panel

### `/services/`

- Commercial comparison surface
- Service journey
- Pilot / pricing / SLA references

### `/awards/`

- Recognition
- Trust links
- Reviewer-facing credibility path

## Cutover Rule

Do not call `apps/web` the canonical live surface until:

- these routes are exported successfully
- mirror links resolve correctly
- reviewer links open the right evidence
- the current `docs/` entrypoint can be preserved or redirected intentionally
