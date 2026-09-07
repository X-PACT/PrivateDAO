# PrivateDAO Kernel and Protocol Architecture Audit

**Audit date:** 2026-09-07  
**Scope:** local commercial source, GitHub reference, and the live Amazon-hosted site  
**Status:** architecture baseline; implementation has not started

## 1. Evidence boundary

The following facts were checked during this audit:

- Local source: `/home/x-pact/PrivateDAO-CANONICAL-LIVE-20260818/source/commercial-core`
- The local source is **not** a Git checkout. It has no `.git` directory, remote, branch, or commit identity.
- GitHub candidate: `https://github.com/X-PACT/PrivateDAO.git`
- GitHub `main` currently resolves to `ec7d851b7b2dc586fd0d22cb09ee70118f96c63e`.
- The GitHub tree contains 16,032 tracked paths; the local source contains 11,850 files when generated dependency directories are excluded from the count.
- Selected parity checks differ: the GitHub and local `apps/web/src/app/layout.tsx` hashes differ, and the GitHub and local `apps/web/package.json` hashes differ.
- The GitHub commit date is 2026-08-15, while the local web package was modified on 2026-08-26 and the live site reports `Last-Modified: 2026-08-27`. This is consistent with GitHub being older, but it is not by itself proof that the local source is the deployed source.
- The dependency diff includes Umbra `^4.0.0` in GitHub versus `5.0.0-rc.6` locally, and GitHub omits local IKA/Mysten/MagicBlock-kit entries. This is a release-risk difference, not a safe cleanup candidate.
- The local static `index.html` is 224,773 bytes with SHA-256 `14612e02d87f4623d18a1643b335f6053938fd7c35aaebb6f63fbe028abd4a6a`; the live root response is 143,590 bytes with SHA-256 `70911cabb36733d28f875cd55633ba94c7eb0cc1b69a66c76244528179849c5f`. They are byte-different.
- A canonical local Git repository now exists at this source root with baseline commit `c494ea46402cd5d77646d24fc5bb4e6d7395987a`. It has been pushed to GitHub branch `codex/canonical-live-20260907`; GitHub `main` and Amazon remain unchanged.
- AWS CLI is unavailable in the local environment, so no AWS deployment was attempted from this session.
- The read-only clone's working-tree checkout was incomplete during the audit; tree/object inspection is authoritative for the counts above, while its partial working tree is not evidence of repository contents or deletion.
- `https://privatedao.org/` and `/execute/` returned HTTP 200 through Caddy.
- The live response reported `x-privatedao-primary-host: candidate` and `x-privatedao-backup-policy: github-pages-backup-only`. This proves reachability, not source parity.

No repository, deployment target, DNS record, container, database, wallet, or secret was modified by this audit.

During the audit, two portability defects were corrected in the local source:

- `scripts/publish-web-live-surface.sh` no longer writes to a hard-coded `/home/x-pact/PrivateDAO` path.
- `scripts/verify-web-live-surface.sh` now resolves the repository root from its own location.

Both scripts pass `bash -n`. They have not been run against a live publish target.

## 2. Current source shape

The local commercial source currently contains:

- 191 Next application page/route files under `apps/web/src/app`.
- 308 files in the web and operational script trees that reference chain execution, provider SDKs, RPC clients, or settlement integrations.
- Four `package.json` files across the first three directory levels.
- Anchor/Solana programs, web application routes, Android-native code, ZK circuits/artifacts, deployment scripts, provider integrations, and generated/static artifacts in one source tree.

This is a useful product source, but it is not yet a clean canonical Git repository. The route count also explains the current UX risk: technical surfaces and customer-facing product surfaces are interleaved.

## 3. Current logical layers

### A. Customer and operator experience

Next pages, workbenches, checkout surfaces, product pages, and operational views currently expose product workflows directly. The target commercial navigation should be small and stable:

1. Products
2. Workflows
3. Proof and verification
4. Developers
5. Investors / company

Technical diagnostics, raw protocol pages, provider probes, and generated evidence should remain behind Developers or Operations, not in the primary customer navigation.

### B. Product workflow layer

The current tree contains product-specific flows for:

- Blind and Record Verification
- Confidential Payroll and private payout workflows
- Treasury coordination
- Governance and DAO rooms
- Private Auctions / MagicBlock flows
- Agent Exchange and discovery
- Game and other separate product surfaces

These workflows should own business concepts, validation, policy, and user-facing outcomes. They must not construct provider-specific transactions directly.

### C. Integration layer currently present

The source references Solana/Anchor, Umbra, MagicBlock, Jupiter, QuickNode, IKA, Supabase, Android RPC clients, and ZK/proof tooling. Examples include:

- `apps/web/src/lib/privatedao-auction-client.ts`
- `apps/web/src/lib/solana-network.ts`
- `apps/web/src/lib/umbra-devnet-wallet.ts`
- `apps/web/src/app/api/private-payout/umbra-workflow/route.ts`
- `apps/web/src/app/api/jupiter/order/route.ts`
- `apps/web/src/app/api/quicknode/stream/route.ts`
- `apps/web/src/app/api/coordination/providers/status/route.ts`
- Android `SolanaRpcClient` implementation

These are candidates for migration behind Kernel interfaces. Their presence is not proof that each path is production-supported or E2E-certified.

### D. Protocol/program layer

Anchor/Solana programs and ZK artifacts are present. The application currently has multiple product-specific routes and scripts around those programs. The new Kernel must treat program IDs, networks, account rules, and proof verifiers as registered capabilities rather than scattered constants.

### E. Deployment layer

The live site is reachable and served by Caddy. Local source, GitHub, and live artifacts are not yet proven to be the same release. Alignment requires a checked-out Git source, reproducible build metadata, artifact hashes, and a rollback record.

## 4. Target Kernel boundary

Kernel is the only layer allowed to perform chain/provider execution. Product code calls typed interfaces such as:

```text
NetworkRegistry
ProviderRegistry
AccountResolver
TransactionBuilder
TransactionSigner
TransactionSubmitter
ConfirmationTracker
ReceiptStore
ReconciliationService
ProofService
ErrorNormalizer
IdempotencyStore
```

Every execution must carry:

- product and workflow identifier
- tenant/organization scope
- network and provider capability
- idempotency key
- expected accounts/recipients and policy hash
- lifecycle state
- normalized error category
- receipt and reconciliation references

Kernel must not expose arbitrary signing or unrestricted treasury authority to UI code, MCP clients, or agents.

## 5. Target Protocol Layer

Protocol sits above Kernel and below external clients:

```text
Client / Agent / Organization
  -> PrivateDAO Protocol
  -> Product workflow
  -> Policy and permissions
  -> Kernel
  -> network/provider
  -> receipt, reconciliation, proof
```

The Protocol surface must provide:

- capability discovery and versioning
- typed resources, tools, and actions
- organization/tenant authorization
- policy and spending limits
- session and idempotency handling
- asynchronous status polling
- receipts and verification links
- proof metadata and selective disclosure
- network/provider negotiation
- adapters for REST, SDK, MCP, and agents

MCP is an adapter, not the business contract. REST/OpenAPI and SDK clients must expose the same capability model and authorization rules.

## 6. Capability taxonomy

Initial capabilities should be registered by product, not by raw protocol:

- `verification.record.create`
- `verification.record.verify`
- `verification.blind.prove`
- `payroll.calculate`
- `payroll.approve`
- `payroll.settle`
- `treasury.policy.check`
- `governance.proposal.execute`
- `auction.bid.commit`
- `auction.settle`
- `agent.discover`
- `agent.invoke`

Each capability needs a version, supported networks, provider requirements, policy requirements, fee model, latency expectation, and evidence/receipt schema.

## 7. Migration order

The safe migration order is:

1. Inventory and register current providers, networks, accounts, receipts, and proof verifiers.
2. Implement Kernel interfaces and adapters without changing the customer UI.
3. Migrate Blind/Record Verification and prove receipt parity.
4. Migrate Confidential Payroll, including policy, settlement, reconciliation, and verification.
5. Migrate Treasury workflows.
6. Migrate Governance workflows.
7. Migrate Private Auctions / MagicBlock.
8. Migrate Agent Exchange and discovery.
9. Add Protocol adapters and public capability discovery.
10. Simplify the primary UX only after workflow parity is demonstrated.

No EVM or other network should be advertised until its provider adapter has a real E2E test and matching receipt/reconciliation semantics.

## 8. E2E acceptance matrix

Every migrated product must prove:

```text
discover -> authorize -> prepare -> sign -> submit -> confirm/finalize
-> reconcile -> receipt -> proof/verification -> retry/idempotency
```

Required negative cases include wrong network, wrong account, rejected signature, expired transaction, provider outage, duplicate request, partial failure, unauthorized tenant access, malformed proof, and disclosure-scope violation.

The test must distinguish demo/synthetic activity from real on-chain activity and must never use owner activity as external adoption evidence.

## 9. Repository alignment and cleanup policy

Before making a canonical repository:

1. Finish the read-only GitHub clone.
2. Record GitHub commit, local source manifest, and live artifact headers/hashes.
3. Scan candidate files for secrets, keys, token material, generated caches, and environment-specific state.
4. Import only verified source into a new working checkout.
5. Build and run product smoke tests from that checkout.
6. Compare the generated release manifest with the live release.
7. Deploy through the existing rollback-capable path.
8. Keep archives immutable and named with source commit/date until the new release is verified.
9. Delete duplicates only after checksums, provenance, and restore tests are recorded.

No deletion is authorized by this audit. A directory that appears old or duplicated is not safe to remove until its unique files and secrets have been classified.

## 10. Immediate implementation gate

The next implementation deliverable is the Kernel/Protocol skeleton plus a machine-readable provider/capability inventory. It must be added to the verified Git checkout, not directly to the non-Git local snapshot. Until local, GitHub, and live release identities are reconciled, changing product code risks creating another divergent deployment.
