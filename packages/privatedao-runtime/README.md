# PrivateDAO Runtime Contracts

Provider-neutral contracts for the PrivateDAO Kernel and Protocol layers.

This package contains no RPC client, wallet signer, private key, treasury authority, or network side effect. Product workflows use these contracts to describe an execution, select a registered provider, track lifecycle state, and return a receipt or proof reference.

The migration rule is strict: product code may depend on these contracts, but provider-specific transaction construction belongs behind `KernelProvider` implementations. REST, SDK, MCP, and agent adapters should expose the same `ProtocolCapability` and receipt semantics.
