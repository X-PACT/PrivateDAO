# PrivateDAO Agent Discovery Revalidation

Observed: `2026-09-17`

This was a clean external-client smoke test. It used no credentials, wallet
session, private key, or payment. The requests were synthetic and are not
evidence of external adoption or revenue.

## Discovery Surfaces

| Surface | Status |
| --- | ---: |
| `/.well-known/agent-card.json` | 200 |
| `/a2a` | 200 |
| `/mcp` | 200 |
| `/openapi.json` | 200 |
| `/api/services` | 200 |
| `/api/acquisition` | 200 |

## Free Activation

- Service: `verify.basic`
- Job: `job_569ddade-d31b-46ef-b820-50a5598183d1`
- Job status: `completed`
- Verification status: `VERIFIED`
- Receipt: `rvr_ac793473d746eea591fef38f246db1e0`
- Receipt status: `VERIFIED`
- Network: `solana-mainnet-beta`
- Amount: `0`
- Payment signature: `null`
- Public evidence contained no employee, wallet, or secret data.

The job was retrieved again through `GET /api/jobs/{jobId}` and the receipt
through `GET /api/receipts/{receiptId}` from separate HTTP requests.

## Paid Conversion Boundary

- Service requested: `token.intelligence`
- Response: `402 Payment Required`
- Quote: `0.030000 USDC`
- Network: `solana-mainnet-beta`
- No wallet was connected.
- No payment transaction was built, signed, submitted, or claimed.

This proves payment-intent generation only. It does not prove paid conversion,
external-agent adoption, or revenue.
