# PrivateDAO Runtime Contracts

Provider-neutral contracts for the PrivateDAO Kernel and Protocol layers.

This package contains no RPC client, wallet signer, private key, treasury authority, or network side effect. Product workflows use these contracts to describe an execution, select a registered provider, track lifecycle state, and return a receipt or proof reference.

The exported `PrivateDaoKernel` is the shared orchestration boundary for products. It enforces provider selection, idempotent preparation, lifecycle transitions, normalized provider errors, and receipt retrieval. `reconcileSettlements` validates payout counts, totals, duplicates, and incomplete lines without knowing how a network transaction was built.

The kernel accepts an optional `KernelTelemetry` sink for lifecycle events without recording payloads, amounts, recipients, secrets, or other sensitive data. Submission is deliberately not retried automatically: a network adapter must provide its own idempotent submission semantics before an application retries a side-effecting transaction.

Network-specific adapters belong outside this package and must implement `KernelProvider`. A network is not considered supported merely because it appears in a product UI; it must have a real adapter and independent test evidence.

`NetworkAdapter` and `WalletSigner` define the integration boundary for real providers. Wallet signing is delegated to an injected wallet session; this package never accepts or stores private keys. `ProtocolRegistry` and its authorization policy types keep product actions, versions, roles, and permissions consistent across REST, SDK, MCP, and agent surfaces. The registry is an in-memory contract implementation for tests and composition; production authentication and persistence remain the responsibility of the application backend.

`ProtocolJob` and `AuditEvent` define the shared asynchronous-job and append-only audit shapes. The included in-memory stores are test/composition utilities only; production services must provide durable, tenant-isolated persistence and must not place employee plaintext, salaries, recipient data, secrets, or private keys in audit metadata.

`TransportBackedNetworkAdapter` is the concrete boundary for a real network integration. It accepts an injected transport, validates that the network is currently available, filters capabilities by network, and delegates observed preparation, submission, status, receipts, and fee estimates. It has no mock success path and does not contain an RPC client or signing key.

`PRODUCT_CATALOG` is the single capability surface for the current release. It intentionally lists only Solana Devnet as available until another network has a real provider, transaction lifecycle, receipt path, and independent test evidence.

`NETWORK_MATRIX` records the requested network roadmap without making unsupported claims. Planned entries are metadata only and cannot be resolved by a provider registry until an adapter is implemented and tested.

The migration rule is strict: product code may depend on these contracts, but provider-specific transaction construction belongs behind `KernelProvider` implementations. REST, SDK, MCP, and agent adapters should expose the same `ProtocolCapability` and receipt semantics.

`registerCatalogCapabilities` materializes the current product catalog in the Protocol registry with shared role and permission policies. It only registers contracts; it does not execute a transaction or create a provider success path. Applications still have to inject a real adapter and provide independent network evidence before declaring an action supported.
