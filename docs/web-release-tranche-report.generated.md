# Web Release Tranche Report
Date: 2026-04-22 19:15:30 UTC

## Summary

- Changed web paths: `38`
- Verified web tranche paths: `25`
- Remaining web paths outside verified tranche: `13`
- Non-web source churn paths: `809`

## Verified Web Tranche

These paths belong to the wallet/signing, core route, proof, and shared-surface tranche that has already been manually aligned and partially verified.

- `apps/web/src/app/android/page.tsx`
- `apps/web/src/app/awards/page.tsx`
- `apps/web/src/app/dashboard/page.tsx`
- `apps/web/src/app/engage/page.tsx`
- `apps/web/src/app/govern/page.tsx`
- `apps/web/src/app/intelligence/page.tsx`
- `apps/web/src/app/judge/page.tsx`
- `apps/web/src/app/learn/page.tsx`
- `apps/web/src/app/products/page.tsx`
- `apps/web/src/app/proof/page.tsx`
- `apps/web/src/app/services/page.tsx`
- `apps/web/src/components/action-review-modal.tsx`
- `apps/web/src/components/competition-workspace.tsx`
- `apps/web/src/components/execution-spine-surface.tsx`
- `apps/web/src/components/governance-action-workbench.tsx`
- `apps/web/src/components/home-shell.tsx`
- `apps/web/src/components/judge-runtime-logs-panel.tsx`
- `apps/web/src/components/normal-user-operation-path.tsx`
- `apps/web/src/components/operations-shell.tsx`
- `apps/web/src/components/service-operational-cards.tsx`
- `apps/web/src/components/site-header.tsx`
- `apps/web/src/components/track-alignment-panel.tsx`
- `apps/web/src/components/track-narrative-panel.tsx`
- `apps/web/src/components/wallet-connect-button.tsx`
- `apps/web/src/lib/judge-runtime-logs.ts`

## Remaining Web Surface

These changed web paths still sit outside the currently verified tranche and should be the next review/type/lint closure target.

- `apps/web/next.config.ts`
- `apps/web/package-lock.json`
- `apps/web/package.json`
- `apps/web/src/app/layout.tsx`
- `apps/web/src/components/devnet-billing-rehearsal.tsx`
- `apps/web/src/lib/curated-documents.ts`
- `apps/web/src/lib/i18n.ts`
- `apps/web/src/lib/read-node-activation.ts`
- `apps/web/src/lib/read-node-host-readiness.ts`
- `apps/web/src/lib/read-node-proposal-context.generated.ts`
- `apps/web/src/lib/service-operational-cards.ts`
- `apps/web/src/lib/site-data.ts`
- `apps/web/src/lib/track-narratives.ts`

## Non-Web Source Churn

These paths are outside `apps/web` and should not block the release reading of the verified web tranche, but they still block a full repo-wide release claim.

- `README.md`
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
- `docs/ecosystem-capability-map-2026.md`
- `docs/ecosystem-focus-alignment.generated.json`
- `docs/ecosystem-focus-alignment.generated.md`
- `docs/frontier-integrations.generated.json`
- `docs/frontier-integrations.generated.md`
- `docs/governance-runtime-proof.generated.json`
- `docs/governance-runtime-proof.generated.md`
- `docs/launch-trust-packet.generated.json`
- `docs/launch-trust-packet.generated.md`
- `docs/magicblock/runtime.generated.json`
- `docs/magicblock/runtime.generated.md`
- `docs/mainnet-acceptance-matrix.generated.json`
- `docs/mainnet-acceptance-matrix.generated.md`
- `docs/mainnet-proof-package.generated.json`
- `docs/mainnet-proof-package.generated.md`
- `docs/mainnet-readiness.generated.md`
- `docs/operational-evidence.generated.json`
- `docs/operational-evidence.generated.md`
- `docs/ownership-and-contact.md`
- `docs/read-node/ops.generated.json`
- `docs/read-node/ops.generated.md`
- `docs/read-node/snapshot.generated.json`
- `docs/read-node/snapshot.generated.md`
- `docs/release-ceremony-attestation.generated.json`
- `docs/release-ceremony-attestation.generated.md`
- `docs/release-drill.generated.json`
- `docs/release-drill.generated.md`
- `docs/release-surface-report.generated.md`
- `docs/release-tranche-plan.generated.md`
- `docs/review-attestation.generated.json`
- `docs/reviewer-telemetry-packet.generated.json`
- `docs/reviewer-telemetry-packet.generated.md`
- `docs/runtime-evidence.generated.json`
- `docs/runtime-evidence.generated.md`
- `docs/runtime/browser-wallet.generated.json`
- `docs/runtime/browser-wallet.generated.md`
- `docs/runtime/browser-wallet.md`
- `docs/runtime/real-device.generated.json`
- `docs/runtime/real-device.generated.md`
- `docs/runtime/real-device.md`
- `docs/runtime/templates/README.md`
- `docs/runtime/templates/android-runtime.json`
- `docs/runtime/templates/backpack-browser-wallet.json`
- `docs/runtime/templates/backpack-desktop.json`
- `docs/runtime/templates/glow-browser-wallet.json`
- `docs/runtime/templates/glow-desktop.json`
- `docs/runtime/templates/phantom-browser-wallet.json`
- `docs/runtime/templates/phantom-desktop.json`
- `docs/runtime/templates/solflare-browser-wallet.json`
- `docs/runtime/templates/solflare-desktop.json`
- `docs/supabase-operation-receipts.sql`
- `docs/supply-chain-attestation.generated.json`
- `docs/supply-chain-attestation.generated.md`
- `docs/testnet-lifecycle-rehearsal-2026-04-22.md`
- `docs/testnet-readiness-status-2026-04-22.md`
- `docs/track-judge-first-openings.generated.json`
- `docs/track-judge-first-openings.generated.md`
- `docs/track-reviewer-packets/colosseum-frontier.generated.json`
- `docs/track-reviewer-packets/colosseum-frontier.generated.md`
- `docs/track-reviewer-packets/privacy-track.generated.json`
- `docs/track-reviewer-packets/privacy-track.generated.md`
- `docs/track-reviewer-packets/rpc-infrastructure.generated.json`
- `docs/track-reviewer-packets/rpc-infrastructure.generated.md`
- `docs/treasury-reviewer-packet.generated.json`
- `docs/treasury-reviewer-packet.generated.md`
- `docs/wallet-compatibility-matrix.generated.json`
- `docs/web-runtime-buckets.generated.md`

## Closure Rule

- Treat the verified web tranche as the current product-ready surface under active closure.
- Close remaining `apps/web` paths before broadening claims about release packaging.
- Keep non-web source churn separated from web-surface truth until it is intentionally reviewed.
