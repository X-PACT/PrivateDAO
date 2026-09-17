# EVM Testnet Funding Boundary

**Checked:** 2026-09-17
**Scope:** read-only public-wallet balance and chain-ID checks before native
E2E execution

No private key was loaded. No signing or transaction submission occurred.

| Network | Chain ID observed | Native balance | RPC result | Result |
| --- | ---: | ---: | --- | --- |
| Ethereum Sepolia | 11155111 | 0.124755828574594106 ETH | healthy | funded |
| Base Sepolia | 84532 | 0.008922210582553289 ETH | healthy | underfunded for the 0.01 ETH gate |
| Arbitrum Sepolia | 421614 | 0.01142287521323 ETH | healthy | funded |
| BNB Testnet | 97 | 0 tBNB | healthy | cancelled scope |
| Robinhood Testnet | 46630 | 0 ETH | healthy | blocked_external: funding required |
| Hyperliquid Testnet | 998 | 0 HYPE | healthy | blocked_external: funding required |

This report is a funding gate only. A funded balance is not deployment, proof,
settlement, receipt, or capability-verification evidence. No capability is
promoted to `testnet_verified` by this report alone.
