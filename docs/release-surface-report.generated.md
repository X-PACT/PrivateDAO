# Release Surface Report
Date: 2026-04-22 18:53:12 UTC

## Git State

- HEAD: `2fcbd91f5b95019a591ff774f1e8e0365c9bb762`
- origin/main: `2fcbd91f5b95019a591ff774f1e8e0365c9bb762`

## Triage Summary

- Source changes: `77`
- Docs changes: `83`
- Generated/runtime artifacts: `704`

## Current Rule

- Evaluate release readiness from source changes first.
- Treat generated mirrors, export churn, and runtime artifacts as separate from source closure.
- Do not claim full release packaging until source changes are intentionally reviewed and grouped.

## Next Closure Route

- Primary closure target: `web runtime`
- Current tranche reference:
  - [release-tranche-plan.generated.md](docs/release-tranche-plan.generated.md)
- Practical next move:
  - close the `apps/web` surface first
  - then close ops/verification files
  - then reconcile tests/protocol touchpoints
  - only after that refresh docs/evidence

## Current Triage Output

```text
worktree triage: 864 scoped change(s)

[source_app] 56 path(s)
top scopes:
    56  apps/web
sample paths:
 M apps/web/next.config.ts
 M apps/web/package-lock.json
 M apps/web/package.json
 M apps/web/src/app/android/page.tsx
 M apps/web/src/app/awards/page.tsx
 M apps/web/src/app/dashboard/page.tsx
 M apps/web/src/app/engage/page.tsx
 M apps/web/src/app/govern/page.tsx

[source_ops] 18 path(s)
top scopes:
     2  scripts/lib
     1  scripts/worktree-triage-report.sh
     1  scripts/verify-reviewer-telemetry-packet.ts
     1  scripts/verify-real-device-runtime-evidence.ts
     1  scripts/verify-generated-artifacts.ts
     1  scripts/verify-frontier-integrations.ts
     1  scripts/verify-frontend-surface.ts
     1  scripts/verify-browser-wallet-runtime-evidence.ts
     1  scripts/record-real-device-runtime-capture.ts
     1  scripts/record-browser-wallet-runtime-capture.ts
     1  scripts/build-web-runtime-buckets.sh
     1  scripts/build-release-tranche-plan.sh
sample paths:
 M README.md
 M package.json
 M scripts/build-frontier-integrations.ts
 M scripts/build-read-node-snapshot.ts
 M scripts/lib/micropayment-engine.ts
 M scripts/lib/read-node.ts
 M scripts/record-browser-wallet-runtime-capture.ts
 M scripts/record-real-device-runtime-capture.ts

[source_protocol] 3 path(s)
top scopes:
     1  tests/private-dao.ts
     1  tests/full-flow-test.ts
     1  programs/private-dao
sample paths:
 M programs/private-dao/fuzz/Cargo.lock
 M tests/full-flow-test.ts
 M tests/private-dao.ts

[docs_evidence] 76 path(s)
top scopes:
    16  docs/runtime
     6  docs/track-reviewer-packets
     4  docs/zk
     4  docs/read-node
     2  docs/magicblock
     2  docs/competitive
     1  docs/web-runtime-buckets.generated.md
     1  docs/wallet-compatibility-matrix.generated.json
     1  docs/treasury-reviewer-packet.generated.md
     1  docs/treasury-reviewer-packet.generated.json
     1  docs/track-judge-first-openings.generated.md
     1  docs/track-judge-first-openings.generated.json
sample paths:
 M docs/audit-packet.generated.md
 M docs/canonical-custody-proof.generated.json
 M docs/canonical-custody-proof.generated.md
 M docs/competitive/analysis.generated.json
 M docs/competitive/analysis.generated.md
 M docs/cryptographic-manifest.generated.json
 M docs/custody-proof-reviewer-packet.generated.json
 M docs/custody-proof-reviewer-packet.generated.md

[docs_manual] 7 path(s)
top scopes:
     1  docs/testnet-readiness-status-2026-04-22.md
     1  docs/testnet-lifecycle-rehearsal-2026-04-22.md
     1  docs/supabase-operation-receipts.sql
     1  docs/ownership-and-contact.md
     1  docs/ecosystem-capability-map-2026.md
     1  docs/custody-observed-readouts.json
     1  docs/awards.md
sample paths:
 M docs/awards.md
 M docs/custody-observed-readouts.json
 M docs/ownership-and-contact.md
?? docs/ecosystem-capability-map-2026.md
?? docs/supabase-operation-receipts.sql
?? docs/testnet-lifecycle-rehearsal-2026-04-22.md
?? docs/testnet-readiness-status-2026-04-22.md

[generated_js] 184 path(s)
top scopes:
     7  scripts/lib
     1  sdk/src
     1  scripts/verify-zk-transcript.js
     1  scripts/verify-zk-registry.js
     1  scripts/verify-zk-proof-on-chain.js
     1  scripts/verify-zk-negative.js
     1  scripts/verify-zk-external-closure.js
     1  scripts/verify-zk-enforced-runtime-evidence.js
     1  scripts/verify-zk-docs.js
     1  scripts/verify-zk-consistency.js
     1  scripts/verify-zk-attestation.js
     1  scripts/verify-weekly-youtube-ready.js
sample paths:
?? migrations/migrate-realms-dao.js
?? scripts/anchor-zk-proof.js
?? scripts/apply-custody-evidence-intake.js
?? scripts/build-audit-packet.js
?? scripts/build-browser-wallet-runtime-evidence.js
?? scripts/build-canonical-custody-proof.js
?? scripts/build-colosseum-competitive-analysis.js
?? scripts/build-confidential-manifest.js

[fuzz_corpus] 520 path(s)
top scopes:
   520  programs/private-dao
sample paths:
?? programs/private-dao/fuzz/corpus/governance_and_signatures/00de1d4bd6492b0bc5193486f0b0f41deba287ab
?? programs/private-dao/fuzz/corpus/governance_and_signatures/045b9b9275f18fb0f77643618afeeb0cadf5ec13
?? programs/private-dao/fuzz/corpus/governance_and_signatures/0470a082e6a46ec68a1eb7f9d1bd4afd4b9ebc61
?? programs/private-dao/fuzz/corpus/governance_and_signatures/05ee73e922d59d92c9f230a7a3567f650917d374
?? programs/private-dao/fuzz/corpus/governance_and_signatures/0773d40c346e279944164391529ab4ad9ba90089
?? programs/private-dao/fuzz/corpus/governance_and_signatures/087026685c90e2b233c5200f4324c6ca3e8cd133
?? programs/private-dao/fuzz/corpus/governance_and_signatures/0908361411a8e0b4d6330669cc2da5f31898f9c4
?? programs/private-dao/fuzz/corpus/governance_and_signatures/0abf360891779a67424377f2105083de21abf1aa

summary:
  source changes: 77
  docs changes: 83
  generated/runtime artifacts: 704
  mirror/export churn: 0
  other: 0
recommendation: triage source_app/source_ops/source_protocol before any release claim
```
