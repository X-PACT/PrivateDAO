# EVM Organizational E2E Funding Boundary

**Checked:** 2026-09-17
**Scope:** preflight evidence for the real organizational E2E runner

The deployer key was loaded only in-memory by the read-only preflight and was
not printed, logged, copied, or committed. No mainnet transaction was attempted.

| Network | Chain ID | Balance observed | Runner result |
| --- | ---: | ---: | --- |
| Ethereum Sepolia | 11155111 | funded; 0.049266503251792295 ETH observed before the successful run | organizational E2E completed; 17 submitted/deployment receipts independently read as `success` |
| Tempo Testnet | 42431 | funded | organizational E2E completed; 16 submitted receipts independently read as `success` |

The earlier Ethereum preflight stopped below the 0.01 ETH safety minimum. After
the wallet was funded, the runner completed on Ethereum Sepolia and the receipt
set was independently re-read from the public RPC. The Tempo result is recorded
separately in `packages/evm-verification/deployments/organizational-tempo-testnet.json`.

This document is funding-boundary evidence only. It does not promote Ethereum
to `testnet_verified` until the capability registry is bound to the release
commit containing the artifact, and it does not claim mainnet readiness.
