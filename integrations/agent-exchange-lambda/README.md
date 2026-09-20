# PrivateDAO Agent Exchange Lambda

This directory is the canonical source for the independently deployed Agent
Exchange Lambda. It is intentionally separate from the commercial website and
the game runtime.

## Runtime

- Function: `PrivateDAOAgentExchange-Function-N2zgpQmMN41S`
- Runtime: Node.js 22
- Handler: `src/handler.handler`
- Domain: `agents.privatedao.org`
- Production execution network: Solana Mainnet
- Mainnet read-only intelligence: Ethereum Mainnet, Base Mainnet, and Arbitrum One
- Solana Agent identity: 8004 Agent #1471; this Lambda does not create or replace that identity

## Public surfaces

- `/marketplace` commercial service catalog
- `/connect` developer connection flow
- `/.well-known/agent-card.json` discovery card
- `/api/services` service catalog API
- `/api/network/health?network=ethereum-mainnet` sanitized provider health
- `/a2a`, `/mcp`, `/openapi.json` machine interfaces

## Deployment boundary

Deploy this integration independently. Do not package or replace the main
PrivateDAO website, `/game/`, or the game host when updating this Lambda.

Runtime secrets and DynamoDB configuration are supplied by the Lambda
environment and AWS Secrets Manager. No secret, private key, token, or
`node_modules` directory belongs in this repository directory.

The existing Solana RPC secret may also contain `ALCHEMY_API_KEY`. The runtime
constructs network-specific Alchemy endpoints in `src/evm.mjs`; the key is
never returned in health evidence, receipts, Agent Card metadata, browser
bundles, or logs. Explicit `PDAO_EVM_*_RPC_URL` values take precedence when
configured securely.

The current payment rail remains Solana Mainnet USDC. A requested EVM target
network does not move the payment rail: paid jobs quote and verify payment on
Solana, then execute the read-only target service. EVM transaction simulation
and Jupiter swap quotes never sign or broadcast transactions. Solana
transaction simulation uses `simulateTransaction` with signature verification
disabled; it returns simulation logs and compute usage only.

Alchemy Data APIs are used opportunistically behind the EVM provider boundary
for token metadata and wallet token balances. If a Data API method is not
available, the service returns the bounded standard-RPC evidence instead of
inventing a value. Contract-code and `eth_call` metadata reads use a short
in-memory TTL cache; wallet balances and other mutable user data are never
shared through that cache. Runtime rate limits and sanitized provider metrics
are enforced server-side.

Agent #1471 metadata remains the canonical Solana identity. Its existing IPFS
URI and owner are preserved; no duplicate registration is created during
multi-chain expansion.

Before deployment, run `node --check src/handler.mjs`, package the source with
the Lambda runtime dependencies, and verify the public API and browser surfaces
after the update. Keep the previous Lambda package available for rollback.
