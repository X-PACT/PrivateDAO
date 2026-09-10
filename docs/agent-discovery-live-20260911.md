# PrivateDAO Agent Discovery Revalidation

Observed: `2026-09-11`

This revalidation supersedes the earlier `2026-09-10` observation. The
previous 200 responses must not be treated as current production evidence.

This is a read-only external discovery check. It used unauthenticated `GET`
requests and did not create jobs, send payments, register agents, or infer
external adoption.

| Surface | Status | Content type | Result |
| --- | ---: | --- | --- |
| `/.well-known/agent-card.json` | 404 | `application/json` | Agent Card unavailable at revalidation time |
| `/openapi.json` | 404 | `application/json` | OpenAPI document unavailable at revalidation time |
| `/a2a`, `/mcp`, `/api/services`, `/api/acquisition` | not revalidated | - | Do not infer availability from the earlier observation |

## Current Production Boundary

The current checks used unauthenticated `HEAD` requests and received 404. A
successful historical `GET` observation exists in the prior report, but it is
stale and does not establish current availability. No new Agent Card, A2A,
MCP, OpenAPI, job, payment, or receipt claim is made here.

## Safety Boundary

## Historical Checks Only

The following entries are retained as historical synthetic/internal checks
from the previous observation. They are not current production evidence and
did not send funds or create a paid conversion:

- REST `POST /api/jobs` with `verify.basic`: completed, job
  `job_8eff87aa-9f41-4d12-851a-6bad6d3aad95`.
- REST job retrieval: `GET /api/jobs/{jobId}` returned `200` and `completed`.
- Receipt retrieval: `GET /api/receipts/{receiptId}` returned `200` and
  `VERIFIED` for receipt `rvr_b784f41582ee5d592f89a0b347defb1e`.
- A2A JSON-RPC `message/send` over `POST /a2a`: returned `200` with a
  completed result.
- MCP JSON-RPC `initialize` over `POST /mcp`: returned `200` with a result.

No paid transaction, referral, marketplace listing, payment proof, or external
agent adoption was created by these checks.

## Paid Path Boundary Check

`POST /api/jobs` for `token.intelligence` returned `402 Payment Required` and
issued a real payment intent for job `job_26d39722-2d64-466f-a45c-09d59eedc0ff`:

- Network: `solana-mainnet-beta`
- Asset: `USDC`
- Quoted amount: `0.030000`
- Expiration: returned by the service
- Payment proof: not submitted
- Paid conversion: not claimed
- Revenue: `0`

This proves intent generation only. It is not evidence of payment, job
execution, external adoption, or revenue.
