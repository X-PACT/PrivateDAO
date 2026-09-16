# EVM Organizational E2E Funding Boundary

**Checked:** 2026-09-17
**Scope:** preflight evidence for the real organizational E2E runner

The deployer key was loaded only in-memory by the read-only preflight and was
not printed, logged, copied, or committed. No mainnet transaction was attempted.

| Network | Chain ID | Balance observed | Runner result |
| --- | ---: | ---: | --- |
| Ethereum Sepolia | 11155111 | 0.005563058955954597 ETH | `blocked_external`: below the runner safety minimum of 0.01 ETH; no transaction submitted |
| Tempo Testnet | 42431 | funded | organizational E2E completed; 16 submitted receipts independently read as `success` |

The Ethereum runner intentionally stops before deployment when the balance is
below its safety minimum. The threshold was not weakened. The Tempo result is
recorded separately in `packages/evm-verification/deployments/organizational-tempo-testnet.json`.

This document is funding-boundary evidence only. It does not promote Ethereum
to `testnet_verified`, and it does not claim mainnet readiness.
