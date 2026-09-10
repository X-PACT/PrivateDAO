# EVM Testnet Funding Boundary

## Scope

On 2026-09-10 the real EVM verification runner was executed against the
following testnets using the configured deployer account. The private key was
loaded from the external secret store and was never printed or committed.

## Results

| Network | RPC used | Result | Transactions |
| --- | --- | --- | --- |
| Base Sepolia | `https://sepolia.base.org` | stopped at native-balance gate | none |
| Arbitrum Sepolia | `https://sepolia-rollup.arbitrum.io/rpc` | stopped at native-balance gate | none |
| BNB Testnet | `https://data-seed-prebsc-1-s1.bnbchain.org:8545` | stopped at native-balance gate | none |
| Robinhood Chain Testnet | `https://rpc.testnet.chain.robinhood.com` | stopped at native-balance gate | none |

Each run failed closed with `deployer has no native testnet balance` before
contract deployment or proof anchoring. No deployment manifest was created for
these networks and no capability was promoted to `testnet_verified`.

Ethereum Sepolia remains the only EVM network with committed, independently
verified deployment evidence. Funding a testnet account is an external
operational prerequisite for the remaining real E2E runs; this document does
not treat that prerequisite as completed.
