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

## Public surfaces

- `/marketplace` commercial service catalog
- `/connect` developer connection flow
- `/.well-known/agent-card.json` discovery card
- `/api/services` service catalog API
- `/a2a`, `/mcp`, `/openapi.json` machine interfaces

## Deployment boundary

Deploy this integration independently. Do not package or replace the main
PrivateDAO website, `/game/`, or the game host when updating this Lambda.

Runtime secrets and DynamoDB configuration are supplied by the Lambda
environment and AWS Secrets Manager. No secret, private key, token, or
`node_modules` directory belongs in this repository directory.

Before deployment, run `node --check src/handler.mjs`, package the source with
the Lambda runtime dependencies, and verify the public API and browser surfaces
after the update. Keep the previous Lambda package available for rollback.

