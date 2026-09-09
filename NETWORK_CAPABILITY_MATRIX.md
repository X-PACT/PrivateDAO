# PrivateDAO Network Capability Matrix

This file is a human-readable mirror of
`packages/privatedao-runtime/src/networks.ts`. The runtime catalog is
authoritative and intentionally fails closed.

| Network | Runtime stage | Product exposure |
|---|---|---|
| Solana Devnet | `available` | Current Kernel network; product capabilities are catalogued here. |
| Solana Mainnet | `planned` | No current Kernel provider or production claim. |
| Ethereum Sepolia | `planned` | Adapter and independent lifecycle evidence required. |
| Arbitrum Sepolia | `planned` | Adapter and independent lifecycle evidence required. |
| Tempo Testnet | `planned` | Adapter and independent lifecycle evidence required. |
| Zcash Testnet | `planned` | Adapter and independent lifecycle evidence required. |
| Wormhole Integration | `planned` | Integration boundary only; not a standalone product network. |
| Hyperliquid Testnet | `planned` | Adapter and independent lifecycle evidence required. |

An entry is not customer-executable merely because it is listed here. A
network requires a real provider adapter, transaction lifecycle, finality,
receipt/reconciliation path, and independent tests before discovery or UI may
present it as supported.
