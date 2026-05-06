# Web Runtime Buckets
Date: 2026-04-22 18:48:47 UTC

## Counts

- Wallet and signing: `3`
- Primary routes: `5`
- Evidence and status: `2`
- Supporting surface: `25`
- Web tooling: `3`
- Other: `0`

## Wallet and Signing

- `apps/web/src/components/action-review-modal.tsx`
- `apps/web/src/components/governance-action-workbench.tsx`
- `apps/web/src/components/wallet-connect-button.tsx`

## Primary Routes

- `apps/web/src/app/android/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/govern/page.tsx`
- `apps/web/src/app/judge/page.tsx`
- `apps/web/src/app/proof/page.tsx`

## Evidence and Status

- `apps/web/src/components/judge-runtime-logs-panel.tsx`
- `apps/web/src/lib/judge-runtime-logs.ts`

## Supporting Surface

- `apps/web/src/app/awards/page.tsx`
- `apps/web/src/app/engage/page.tsx`
- `apps/web/src/app/intelligence/page.tsx`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/app/learn/page.tsx`
- `apps/web/src/app/products/page.tsx`
- `apps/web/src/app/services/page.tsx`
- `apps/web/src/components/competition-workspace.tsx`
- `apps/web/src/components/devnet-billing-rehearsal.tsx`
- `apps/web/src/components/execution-spine-surface.tsx`
- `apps/web/src/components/home-shell.tsx`
- `apps/web/src/components/normal-user-operation-path.tsx`
- `apps/web/src/components/operations-shell.tsx`
- `apps/web/src/components/service-operational-cards.tsx`
- `apps/web/src/components/site-header.tsx`
- `apps/web/src/components/track-alignment-panel.tsx`
- `apps/web/src/components/track-narrative-panel.tsx`
- `apps/web/src/lib/curated-documents.ts`
- `apps/web/src/lib/i18n.ts`
- `apps/web/src/lib/read-node-activation.ts`

## Web Tooling

- `apps/web/next.config.ts`
- `apps/web/package-lock.json`
- `apps/web/package.json`

## Closure Rule

- Close wallet/signing and primary routes first.
- Then close evidence/status interpretation.
- Then close supporting surface copy and routing consistency.
- Leave tooling/package drift for the end of tranche 1 unless it blocks runtime.
