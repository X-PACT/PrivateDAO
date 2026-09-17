# PrivateDAO Multichain Readiness

Observed: `2026-09-17`

This report separates network connectivity, adapter support, funding, and
independent product evidence. A reachable RPC is not treated as product
support.

## Network Status

| Network | Current state | Evidence boundary |
| --- | --- | --- |
| Solana Devnet | `devnet_verified` for three Payroll rows | Payroll Devnet artifacts and runtime registry |
| Solana Mainnet | `mainnet_live` for two Agent Exchange rows | Live Agent Card, A2A, MCP, OpenAPI, free job and receipt smoke checks |
| Ethereum Sepolia | `testnet_verified` | Fresh Phase 2 artifact with record/blind proof, rejection, expiry, and revocation checks |
| Base Sepolia | `testnet_verified` | Fresh Phase 2 artifact with the same full verification checks |
| Arbitrum Sepolia | `testnet_verified` | Committed Phase 2 artifact; a prior long-running rerun remains open and was not duplicated |
| Tempo Testnet | `testnet_verified` | Committed verification and organizational evidence artifacts |
| Robinhood Testnet | adapter and RPC healthy; `unverified` | Public balance is zero; no product E2E evidence |
| Hyperliquid HyperEVM Testnet | EVM adapter and RPC healthy; `unverified` | Chain `998`, HYPE gas, public balance is zero; no product E2E evidence |
| Zcash Testnet | foundation adapter only | Native UTXO, isolation, timeout, receipt and gate tests; no funded chain E2E |
| BNB Testnet | cancelled scope | No funding or E2E work is active |
| Stellar | cancelled scope | No product adapter work is active |
| Wormhole | cancelled scope | No bridge network is declared in the capability matrix |

## Product Evidence

- Application bindings: `7` products and `34` bindings.
- Native capability registry: `192` rows, `24` testnet-verified, `3`
  devnet-verified, `2` mainnet-live, bridge-free.
- Hyperliquid rows remain `planned`; adding the adapter did not promote any
  capability.
- Mainnet execution remains disabled by the EVM gate.

## Current Funding Gate

Read-only balance observations for the public test wallet:

- Ethereum Sepolia: funded.
- Arbitrum Sepolia: funded.
- Base Sepolia: below the `0.01 ETH` reporting threshold after its completed
  E2E run.
- Robinhood Testnet: `0 ETH`.
- Hyperliquid Testnet: `0 HYPE`.

No private key was printed, committed, or included in this report. No funding
transaction is initiated by the reporting command.

## External Agent Exchange

Unauthenticated external checks currently pass for Agent Card, A2A, MCP,
OpenAPI, services, acquisition, health, pricing, discovery, registry search,
and treasury status. A fresh `verify.basic` job completed with a verified
receipt. A paid service correctly returned `402 Payment Required` with a
Solana Mainnet USDC quote; no payment was signed or submitted.

These checks are synthetic smoke traffic and are not evidence of external
adoption or revenue.

## Release Boundary

The repository is synchronized between `main` and `canonical-live`. The game,
production website, and production services were not changed by this work.
No network is promoted to Mainnet or commercial support without independent
on-chain evidence for that product and network.
