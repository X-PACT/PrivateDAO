# Next.js Route Parity

This checklist defines the route parity now expected from the published `apps/web` surface at the repo root.

It is a UI parity checklist, not a protocol claim.

## Required Routes

- `/`
- `/command-center/`
- `/dashboard/`
- `/proof/`
- `/documents/`
- `/viewer/`
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

### `/documents/`

- Curated reviewer and trust document library
- In-app routes for V3 proof, audit packet, launch trust packet, and blockers
- Raw-file links preserved for authoritative references

### `/viewer/`

- Repository markdown viewer for broad docs parity
- Static routes for legacy markdown entrypoints across `docs/**/*.md`
- Supports cutover away from `?page=docs&doc=...` without dropping raw-file authority

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

## Live Rule

The canonical live surface now comes from `apps/web` at the repo root.

Keep verifying that:

- these routes continue exporting successfully
- mirror links resolve correctly
- reviewer links open the right evidence
- `docs/` remains available as the archive and raw-reference fallback
