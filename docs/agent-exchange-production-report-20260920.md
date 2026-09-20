# PrivateDAO Agent Exchange Production Report

Date: 2026-09-20

## Release

- Repository branch: `rebrand/enterprise-white`
- Deployed runtime commit: `3de3ade9b`
- Lambda version: `74`
- Function: `PrivateDAOAgentExchange-Function-N2zgpQmMN41S`
- Region: `eu-north-1`
- Public URL: `https://agents.privatedao.org`
- Previous known-good rollback version: `70`

The main PrivateDAO website and `/game/` are separate deployment boundaries.

## Commercial Services

The following priority services are discoverable in production:

- `token.intelligence` — $0.03 USDC per call
- `wallet.intelligence` — $0.05 USDC per call
- `risk.score` — $0.02 USDC per call
- `transaction.simulate` — $0.02 USDC per call
- `swap.quote` — $0.01 USDC per call
- `market.snapshot` — $0.01 USDC per call

The complete catalog is available at `/api/services` and `/api/pricing`.

All paid services expose:

- service identifier
- price and currency
- Solana Mainnet payment network
- supported target networks
- input and output schema
- completion behavior

## Network Matrix

| Network | Current capability | Evidence |
|---|---|---|
| Solana Mainnet | Live payments, read-only services, receipts | Production API and RPC health |
| Ethereum Mainnet | Read-only intelligence and simulation | Chain ID `0x1`, Alchemy RPC health |
| Base Mainnet | Read-only intelligence and simulation | Chain ID `0x2105`, Alchemy RPC health |
| Arbitrum One | Read-only intelligence and simulation | Chain ID `0xa4b1`, Alchemy RPC health |
| HyperEVM Mainnet | Discovery-only | No verified execution adapter |
| Tempo Mainnet | Discovery-only | No verified execution adapter |
| Zcash | Discovery-only | Separate integration path not enabled here |
| Other published test networks | Discovery-only | No production execution claim |

RPC health is not treated as product execution or payment readiness.

## Payment Architecture

- Payment rail: Solana Mainnet USDC
- Target data network is independent from the payment network.
- EVM services never broadcast transactions.
- Swap service is quote-only.
- Transaction simulation does not sign or broadcast.
- No server-side user wallet signer exists.
- The Featured Partner checkout uses the same verified Solana Mainnet USDC rail with a separate `featured_partnership` purpose.

## Machine Interfaces

- Agent Card: HTTP 200, 24 skills
- MCP: HTTP 200, 11 tools, including `pdao_services`
- MCP lifecycle: external initialize -> initialized notification -> tools/list -> tools/call PASS
- MCP schemas: all 11 tools publish object schemas with argument contracts
- SingularityAgent: existing registration remains connected and idempotent; refresh succeeds with the required `MCP-Protocol-Version` header and preserves the existing 18-tool registration
- A2A: published and reachable
- OpenAPI: HTTP 200, OpenAPI 3.1.0, 56 paths
- Service catalog: HTTP 200, 23 services
- Receipts and verification pages: publicly reachable without exposing request secrets

## Production Evidence

A real free production verification job completed after deployment:

- Job: `job_b7884c42-1858-435f-8929-18794437b31d`
- Receipt: `rvr_c0e2ba149335eb8d9d0b8fdeaa60626c`
- Receipt page: HTTP 200
- Verification page: HTTP 200
- Job page: HTTP 200

Post-deployment checks also returned HTTP 200 for:

- `https://agents.privatedao.org/api/health`
- `https://agents.privatedao.org/api/services`
- `https://agents.privatedao.org/.well-known/agent-card.json`
- `https://agents.privatedao.org/api/marketplace/partners`
- `https://privatedao.org/`
- `https://privatedao.org/game/`

## Interoperability Evidence

The production read-only network health checks returned `rpc_healthy` for:

| Network | Chain ID / context | Provider | Read-only |
|---|---|---|---|
| Solana Mainnet | mainnet-beta | Alchemy | yes |
| Ethereum Mainnet | `0x1` | Alchemy | yes |
| Base Mainnet | `0x2105` | Alchemy | yes |
| Arbitrum One | `0xa4b1` | Alchemy | yes |

RPC health is deliberately not treated as service execution, funding, or payment readiness.

The external MCP audit also verified:

- `notifications/initialized` and `notifications/cancelled` are accepted without JSON-RPC responses.
- Unsupported `resources/list` and `prompts/list` return standard method-not-found errors without fake capabilities.
- Existing SingularityAgent registration returns `already_registered` rather than creating a duplicate.
- Network aliases normalize consistently for matching and logistics, and both return the canonical Registry ID `agent_724dd89f22ee9f4527ef1f16`.
- A fresh SingularityAgent initialize/tools/list/safe-tool sequence succeeds with 18 tools.
- Direct provider/service calls also normalize EVM aliases such as `base:mainnet` to `base-mainnet`.
- Transaction simulation schemas reject transaction hashes/signatures before payment and require unsigned transaction data.

## Verification Boundaries

The following have not been claimed as complete because no real paid Mainnet
transaction was authorized or submitted:

- Paid service payment confirmation
- Paid target-network execution after payment
- Paid receipt generated from a real customer payment
- Featured Partner $100 USDC live campaign activation

No fake transaction, receipt, payment status, or E2E result was created.

The current production payment quote path remains enabled. The payment transaction
creates the canonical USDC associated token account idempotently when needed, so an
uninitialized ATA does not block a first customer payment. A real paid E2E still
requires an explicitly approved and funded test transaction.

## Quality Gates

- Node syntax check: PASS
- Test suite: 29/29 PASS
- Smoke test: PASS
- `npm audit --omit=dev`: 0 vulnerabilities
- `git diff --check`: PASS
- No secrets, authenticated RPC URLs, or signer material are present in the report

## Rollback

The immediately previous known-good Lambda deployment is version `70`. Rollback must be
performed through the existing AWS Lambda deployment process; the main website,
game, DNS, and unrelated services are outside this rollback boundary.
