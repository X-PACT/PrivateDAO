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

No paid job, referral, marketplace listing, payment intent, payment proof, or
external-agent activity was created by this check.
