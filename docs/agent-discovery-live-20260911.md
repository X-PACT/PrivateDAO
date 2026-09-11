# PrivateDAO Agent Discovery Revalidation

Observed: `2026-09-11`

This revalidation supersedes the earlier `2026-09-10` observation. The
previous 404 responses were transient and must not be treated as current
production evidence.

This is a read-only external discovery check. It used unauthenticated `GET`
requests and did not create jobs, send payments, register agents, or infer
external adoption.

| Surface | Status | Content type | Result |
| --- | ---: | --- | --- |
| `/.well-known/agent-card.json` | 200 | `application/json` | Agent Card available; Solana Mainnet catalog and workflow returned |
| `/openapi.json` | 200 | `application/json` | OpenAPI 3.1.0 returned with 20 paths |
| `/a2a` | 200 | `application/json` | JSON-RPC `message/send` returned a result |
| `/mcp` | 200 | `application/json` | JSON-RPC `initialize` returned a result |
| `/api/services` | 200 | `application/json` | Service catalog returned |
| `/api/acquisition` | 200 | `application/json` | Acquisition metadata returned |

## Current Production Boundary

The current checks used unauthenticated `GET` and JSON-RPC requests from a
clean external-client simulation. The Agent Card, A2A, MCP, OpenAPI, service,
and acquisition surfaces were available at revalidation time.

## Safety Boundary

## Current Clean-Client Checks

The following checks were run without credentials, wallet sessions, or funds.
They are synthetic verification traffic and are not external adoption or
revenue evidence:

- REST `POST /api/jobs` with `verify.basic`: returned `200` with `job_id`,
  `result`, and `receipt`.
- REST job retrieval: `GET /api/jobs/{jobId}` returned `200` and `completed`.
- Receipt retrieval: `GET /api/receipts/{receiptId}` returned `200` with a
  machine-readable receipt containing status, hashes, network, service, and
  receipt identifiers.
- A2A JSON-RPC `message/send` over `POST /a2a`: returned `200` with a
  completed result.
- MCP JSON-RPC `initialize` over `POST /mcp`: returned `200` with a result.

No paid transaction, referral, marketplace listing, payment proof, or external
agent adoption was created by these checks.

## Paid Path Boundary Check

`POST /api/jobs` for `token.intelligence` returned `402 Payment Required` and
issued a real payment intent:

- Network: `solana-mainnet-beta`
- Asset: `USDC`
- Quoted amount: `0.030000`
- Expiration: returned by the service
- Payment intent fields included job ID, treasury owner/token account,
  recipient, quote ID, status URL, and signature submission URL
- Payment proof: not submitted
- Paid conversion: not claimed
- Revenue: `0`

This proves intent generation only. It is not evidence of payment, job
execution, external adoption, or revenue.
