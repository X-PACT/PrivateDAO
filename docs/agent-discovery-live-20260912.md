# PrivateDAO Agent Discovery Revalidation

Observed: `2026-09-12`

This is a read-only and clean-client revalidation. It used no credentials,
wallet session, or private key. Synthetic requests are explicitly excluded
from external-agent, adoption, and revenue metrics.

## Discovery Surfaces

| Surface | Status | Result |
| --- | ---: | --- |
| `/.well-known/agent-card.json` | 200 | JSON Agent Card, protocol version `0.3.0` |
| `/a2a` | 200 | JSON discovery surface available |
| `/mcp` | 200 | JSON discovery surface available |
| `/openapi.json` | 200 | OpenAPI JSON available |
| `/api/services` | 200 | Service catalog available |
| `/api/acquisition` | 200 | Machine-readable acquisition metadata available |

## Clean Activation Checks

- `POST /api/jobs` with `verify.basic`: `200`.
- Job retrieval: `200`, state `completed`.
- Result returned: yes.
- Receipt retrieval: `200`, verification status `VERIFIED`.
- Paid conversion: not performed.
- Revenue: `0`.

## Paid Intent Boundary Check

- `POST /api/jobs` with `token.intelligence`: `402 Payment Required`.
- Payment intent retrieval: `200`.
- No USDC transfer was made.
- No transaction signature was submitted.
- No paid job was executed.

## Evidence Boundary

These checks prove public discovery, free activation, receipt retrieval, and
payment-intent generation at observation time. They do not prove independent
external-agent adoption, paid conversion, revenue, or marketplace provider
activity.
