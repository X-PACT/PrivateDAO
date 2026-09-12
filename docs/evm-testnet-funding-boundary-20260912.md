# EVM Testnet Funding Boundary

**Checked:** 2026-09-12
**Scope:** read-only balance and chain-ID checks for the external testnet deployer

The deployer key was loaded from the external secret store without being
printed, logged, copied, or committed. The checks used explicit HTTPS RPC
endpoints and did not submit transactions.

| Network | Chain ID observed | Native balance | Result |
| --- | ---: | ---: | --- |
| Base Sepolia | 84532 | 0 ETH | blocked_external: funding required |
| Arbitrum Sepolia | 421614 | 0 ETH | blocked_external: funding required |
| BNB Testnet | 97 | 0 tBNB | blocked_external: funding required |

No contract deployment, proof anchor, receipt, or capability promotion occurred
for these networks. They remain unverified until a funded real E2E run produces
independently readable on-chain evidence.
