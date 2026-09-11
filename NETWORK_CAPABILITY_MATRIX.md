# PrivateDAO Network Capability Matrix

This file is a human-readable mirror of
`packages/privatedao-runtime/src/networks.ts`. The runtime catalog is
authoritative and intentionally fails closed.

| Network | Runtime stage | Product exposure | Independent evidence |
|---|---|---|---|
| Solana Devnet | `available` | Current Kernel network; Payroll rows are separately marked `devnet_verified`. | Product-specific Solana evidence; do not generalize it to every product. |
| Solana Mainnet | `planned` | Agent discovery/invocation is externally runtime-verified; no general product Mainnet execution claim. | No new Mainnet execution performed by this workstream. |
| Ethereum Sepolia | `available` | Blind Verification and Record Verification are application-bound through the Kernel. | Real contract-write E2E in `packages/evm-verification/deployments/phase-2-e2e-ethereum-sepolia.json`, including wrong-chain, altered-proof, expiry, replay, and revocation checks. |
| Arbitrum Sepolia | `planned` | EVM adapter exists, but no funded real deployment or product evidence is recorded. | RPC chain ID is reachable; deployer balance is zero. No capability is customer-executable. |
| BNB Testnet | `planned` | EVM adapter exists, but no funded real deployment or product evidence is recorded. | RPC chain ID is reachable; deployer balance is zero. No capability is customer-executable. |
| Base Sepolia | `planned` | EVM adapter exists, but no funded real deployment or product evidence is recorded. | RPC chain ID is reachable; deployer balance is zero. No capability is customer-executable. |
| Robinhood Chain Testnet | `planned` | Network configuration exists; no independent product E2E evidence is recorded. | Requires a verified provider and funded testnet execution. |
| Tempo Testnet | `available` | Blind Verification and Record Verification are application-bound through the Kernel. | Real contract-write E2E in `packages/evm-verification/deployments/phase-2-e2e-tempo-testnet.json` on chain 42431. |
| Zcash Testnet | `planned` | Native adapter and product execution path are not implemented. | No EVM or bridge substitution is allowed. |
| Hyperliquid Testnet | `planned` | No product execution adapter is recorded. | Requires a product-specific native capability decision before implementation. |

An entry is not customer-executable merely because an adapter or RPC responds.
A network requires a real provider adapter, transaction lifecycle, finality,
receipt/reconciliation path, application binding, and independent tests before
discovery or UI may present the exact capability as supported. The generated
machine-readable registry is authoritative for product/capability evidence;
this document is the human-readable network boundary.

The read-only EVM RPC probe currently reaches all six configured testnets and
observes the expected chain IDs: Ethereum Sepolia, Arbitrum Sepolia, BNB
Testnet, Base Sepolia, Robinhood Testnet, and Tempo Testnet. This is provider
health evidence only; it does not upgrade any product capability to
`testnet_verified`.
