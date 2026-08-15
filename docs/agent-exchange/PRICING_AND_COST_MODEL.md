# Pricing And Cost Model

Live catalog prices are deliberately explicit and machine-readable:

| Service | Price | Currency | Access |
| --- | ---: | --- | --- |
| verify.basic | 0 | USDC | Free |
| verify.deep | 0.25 | USDC | Paid |
| forensics.trace | 0.75 | USDC | Paid |
| agent.match | 0.10 | USDC | Paid |
| sponsored.discovery | 5.00 | USDC | Paid |
| intelligence.synthesize | 1.00 | USDC | Paid |

Quotes expire after five minutes. The service accepts a payment only when the finalized Solana transaction matches the quote recipient, asset, amount, and unused signature. The server never signs or transfers funds.

The initial AWS footprint is Lambda, HTTP API Gateway, four on-demand DynamoDB tables, and CloudWatch. Fixed infrastructure cost is intended to be near zero at low volume; actual monthly cost depends on requests, storage, logs, and RPC usage. Bedrock is disabled until an IAM-approved model and positive-margin price are configured.
