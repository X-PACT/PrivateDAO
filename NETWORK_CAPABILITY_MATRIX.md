# PrivateDAO Network Capability Matrix

This file is a human-readable mirror of
`packages/privatedao-runtime/src/networks.ts`. The runtime catalog is
authoritative and intentionally fails closed.

| Network | Runtime stage | Product exposure | Independent evidence |
|---|---|---|---|
| Solana Devnet | `available` | Current Kernel network; product capabilities are catalogued here. | Solana product evidence remains the current application baseline. |
| Solana Mainnet | `planned` | No current Kernel provider or production claim. | No Mainnet execution. |
| Ethereum Sepolia | `planned` | Not exposed by the application catalog yet. | Blind + Record E2E verified; wrong-chain and altered-proof rejection verified in `packages/evm-verification/deployments/phase-2-e2e-ethereum-sepolia.json`. |
| Arbitrum Sepolia | `planned` | Adapter and application binding still required. | No independent E2E evidence. |
| Tempo Testnet | `planned` | Adapter and application binding still required. | No independent E2E evidence. |
| Zcash Testnet | `planned` | Native adapter still required. | No independent E2E evidence. |
| Wormhole Integration | `planned` | Integration boundary only; not a standalone product network. | Explicitly excluded from the no-bridge execution model. |
| Hyperliquid Testnet | `planned` | Adapter and application binding still required. | No independent E2E evidence. |

An entry is not customer-executable merely because evidence exists here. A
network requires a real provider adapter, transaction lifecycle, finality,
receipt/reconciliation path, application binding, and independent tests before
discovery or UI may present the exact capability as supported. Ethereum Sepolia
has verification evidence, but remains hidden from customer execution until
the application binding is completed.
