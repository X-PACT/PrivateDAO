# PrivateDAO Runtime Contracts

Provider-neutral contracts for the PrivateDAO Kernel and Protocol layers.

This package contains no RPC client, wallet signer, private key, treasury authority, or network side effect. Product workflows use these contracts to describe an execution, select a registered provider, track lifecycle state, and return a receipt or proof reference.

The exported `PrivateDaoKernel` is the shared orchestration boundary for products. It enforces provider selection, idempotent preparation, lifecycle transitions, normalized provider errors, and receipt retrieval. `reconcileSettlements` validates payout counts, totals, duplicates, and incomplete lines without knowing how a network transaction was built.

Network-specific adapters belong outside this package and must implement `KernelProvider`. A network is not considered supported merely because it appears in a product UI; it must have a real adapter and independent test evidence.

The migration rule is strict: product code may depend on these contracts, but provider-specific transaction construction belongs behind `KernelProvider` implementations. REST, SDK, MCP, and agent adapters should expose the same `ProtocolCapability` and receipt semantics.
