# EVM Testnet Funding Boundary

**Checked:** 2026-09-17
**Scope:** read-only RPC and deployer-balance checks before native E2E execution

The deployer private key was loaded only inside the test process. It was not
printed, logged, copied, or committed. No transaction was submitted during
these checks.

| Network | Chain ID observed | Native balance | RPC result | Result |
| --- | ---: | ---: | --- | --- |
| Base Sepolia | 84532 | 0 ETH | healthy | blocked_external: funding required |
| Arbitrum Sepolia | 421614 | 0 ETH | healthy | blocked_external: funding required |
| BNB Testnet | 97 | 0 tBNB | healthy | blocked_external: funding required |
| Robinhood Testnet | 46630 | 0 ETH | healthy | blocked_external: funding required |

The EVM runner was then invoked for all four networks and stopped before
deployment at the first zero-balance check. This is not deployment, proof,
settlement, receipt, or capability-verification evidence. No capability was
promoted from documentation to `testnet_verified`.

