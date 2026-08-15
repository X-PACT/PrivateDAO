# AWS Deployment Record

The isolated Agent Exchange stack is deployed in `eu-north-1`.

- CloudFormation stack: `PrivateDAOAgentExchange`
- API Gateway endpoint: `https://2rlm82zg14.execute-api.eu-north-1.amazonaws.com`
- Payment network: Solana mainnet-beta
- Treasury: `2BJ4ezxqV9YJXc38D9duKBkdn4su4jE1beKUHwH663sL`
- Production tables: four encrypted, on-demand DynamoDB tables with point-in-time recovery
- Server wallet: none
- EVM payments: disabled
- Bedrock: disabled by default; deterministic services remain available

## DNS handoff

The authoritative DNS servers for `privatedao.org` are `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. No Route 53 hosted zone or ACM certificate exists in the AWS account, so the custom name is not claimed as live yet.

After an ACM certificate is issued and API Gateway custom domain is configured, add the exact AWS-provided validation CNAME and API Gateway target CNAME at the registrar. The current API Gateway URL remains the verified AWS endpoint until that external DNS step is complete.

The certificate request is prepared in `eu-north-1` and is pending this DNS validation record:

```text
Name:  _98da1443e8136fa17268cb28c9ffc522.agents.privatedao.org.
Type:  CNAME
Value: _ab7fbd7a17ed931d1f3946e69d4ad2af.jkddzztszm.acm-validations.aws.
```

After validation, create the API Gateway custom domain and add its target CNAME. Do not replace the current `privatedao.org` A record.

## Verified production smoke tests

- `GET /api/health` returned `ok` and `solana-mainnet-beta`.
- `GET /.well-known/agent-card.json` returned six skills.
- `GET /openapi.json` returned OpenAPI `3.1.0`.
- `POST /api/tasks` with `verify.basic` returned `VERIFIED` and a durable receipt ID.
- `POST /api/payments/quote` returned a USDC quote for the configured treasury.
- Paid task without a transaction returned HTTP `402 payment_required` and a quote.
- `POST /mcp` `tools/list` returned six tools.

No mainnet funds were spent. Paid execution remains fail-closed until a client submits a finalized transaction matching the quote.
