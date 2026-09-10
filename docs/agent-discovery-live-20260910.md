# PrivateDAO Agent Discovery Live Evidence

Observed: `2026-09-10`

This is a read-only external discovery check. It used unauthenticated `GET`
requests and did not create jobs, send payments, register agents, or infer
external adoption.

| Surface | Status | Content type | Result |
| --- | ---: | --- | --- |
| `/.well-known/agent-card.json` | 200 | `application/json` | Agent Card, protocol `0.3.0`, 15 skills |
| `/a2a` | 200 | `application/json` | Agent discovery document |
| `/mcp` | 200 | `application/json` | MCP discovery document |
| `/openapi.json` | 200 | `application/json` | OpenAPI document with job, receipt, acquisition and marketplace paths |
| `/api/services` | 200 | `application/json` | 14 service entries |
| `/api/acquisition` | 200 | `application/json` | Acquisition metadata, pricing, payment, SDK, receipts and integrations |

## Important Method Boundary

An earlier `HEAD` check returned `404` for the well-known path. The required
agent discovery method is `GET`, which returned `200` and valid JSON in this
check. This evidence does not claim that `HEAD` is supported.

## Safety Boundary

## Free Activation Checks

The following production-readiness checks used the free path and were tagged
as synthetic/internal validation. They did not send funds or create a paid
conversion:

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
