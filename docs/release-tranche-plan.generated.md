# Release Tranche Plan
Date: 2026-04-22 18:34:01 UTC

## Tranche Order

1. Web runtime
2. Ops and verification
3. Protocol and tests
4. Docs and evidence

## Counts

- Web runtime: `38`
- Ops and verification: `14`
- Protocol and tests: `3`
- Docs and evidence: `76`
- Other: `0`

## Tranche 1: Web Runtime

These files directly affect the user-visible product surface, wallet UX, guided flow, proof routing, and live/dashboard interpretation.

- `apps/web/next.config.ts`
- `apps/web/package-lock.json`
- `apps/web/package.json`
- `apps/web/src/app/android/page.tsx`
- `apps/web/src/app/awards/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/engage/page.tsx`
- `apps/web/src/app/govern/page.tsx`
- `apps/web/src/app/intelligence/page.tsx`
- `apps/web/src/app/judge/page.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/learn/page.tsx`
- `apps/web/src/app/products/page.tsx`
- `apps/web/src/app/proof/page.tsx`
- `apps/web/src/app/services/page.tsx`
- `apps/web/src/components/action-review-modal.tsx`
- `apps/web/src/components/competition-workspace.tsx`
- `apps/web/src/components/devnet-billing-rehearsal.tsx`
- `apps/web/src/components/execution-spine-surface.tsx`
- `apps/web/src/components/governance-action-workbench.tsx`

## Tranche 2: Ops and Verification

These files affect triage, release reporting, runtime capture, and verification automation.

- `README.md`
- `package.json`
- `scripts/build-frontier-integrations.ts`
- `scripts/build-read-node-snapshot.ts`
- `scripts/lib/micropayment-engine.ts`
- `scripts/lib/read-node.ts`
- `scripts/record-browser-wallet-runtime-capture.ts`
- `scripts/record-real-device-runtime-capture.ts`
- `scripts/verify-browser-wallet-runtime-evidence.ts`
- `scripts/verify-frontend-surface.ts`
- `scripts/verify-frontier-integrations.ts`
- `scripts/verify-generated-artifacts.ts`
- `scripts/verify-real-device-runtime-evidence.ts`
- `scripts/verify-reviewer-telemetry-packet.ts`

## Tranche 3: Protocol and Tests

These files affect protocol-adjacent validation or test coverage and should be reviewed after the web release surface is intentional.

- `programs/private-dao/fuzz/Cargo.lock`
- `tests/full-flow-test.ts`
- `tests/private-dao.ts`

## Tranche 4: Docs and Evidence

These files package truth, generated proof, or reviewer-facing material and should follow the source tranches instead of leading them.

- `docs/audit-packet.generated.md`
- `docs/awards.md`
- `docs/canonical-custody-proof.generated.json`
- `docs/canonical-custody-proof.generated.md`
- `docs/competitive/analysis.generated.json`
- `docs/competitive/analysis.generated.md`
- `docs/cryptographic-manifest.generated.json`
- `docs/custody-observed-readouts.json`
- `docs/custody-proof-reviewer-packet.generated.json`
- `docs/custody-proof-reviewer-packet.generated.md`
- `docs/devnet-canary.generated.json`
- `docs/devnet-canary.generated.md`
- `docs/ecosystem-focus-alignment.generated.json`
- `docs/ecosystem-focus-alignment.generated.md`
- `docs/frontier-integrations.generated.json`
- `docs/frontier-integrations.generated.md`
- `docs/governance-runtime-proof.generated.json`
- `docs/governance-runtime-proof.generated.md`
- `docs/launch-trust-packet.generated.json`
- `docs/launch-trust-packet.generated.md`

## Current Rule

- Close tranche 1 before claiming product-surface release readiness.
- Close tranche 2 before claiming operator or reviewer-grade release readiness.
- Close tranche 3 before claiming stronger engineering closure.
- Close tranche 4 last so published evidence matches the final source state.
