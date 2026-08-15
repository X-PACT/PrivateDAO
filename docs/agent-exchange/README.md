# PDAO Agent Exchange

PrivateDAO Agent Exchange is an AWS-hosted, machine-native service surface. Agents discover the catalog through an A2A Agent Card, OpenAPI, `llms.txt`, and MCP-compatible Streamable HTTP requests.

## Production contract

- Production host: `agents.privatedao.org` (AWS only)
- Payment network: Solana mainnet-beta
- Payment assets: USDC, optional SOL
- Treasury: `2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL`
- No server wallet, custody, outgoing transfers, or private key
- `verify.basic` is free. Paid services require a quote and a finalized transaction matching recipient, asset, amount, and unused signature.

## Services

`verify.basic`, `verify.deep`, `forensics.trace`, `agent.match`, `sponsored.discovery`, and `intelligence.synthesize` are exposed in the machine catalog. Sponsored results always carry `sponsored: true` and never change verification or trust results.

## Runtime boundaries

Deterministic verification, payment validation, registry operation, receipt hashing, and risk checks do not depend on AI. Bedrock is optional and is only enabled with an AWS IAM policy and an explicit model configuration. QuickNode and Alchemy are provider slots; the service falls back to public Solana RPC when no private RPC is configured.

## Local validation

```bash
npm --prefix services/agent-exchange test
npm --prefix services/agent-exchange run smoke
```

Deploy with the SAM template under `infra/agent-exchange/template.yaml`. The stack creates isolated on-demand DynamoDB tables with encryption and point-in-time recovery.
