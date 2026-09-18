# PrivateDAO Agent Discovery Revalidation

Observed: `2026-09-18`

This is a credential-free external smoke test. It used no wallet session,
private key, payment, or admin access. The requests are operational evidence
only; they do not claim external adoption or revenue.

## Live Discovery Surfaces

| Surface | Status |
| --- | ---: |
| `https://agents.privatedao.org/.well-known/agent-card.json` | 200 |
| `https://agents.privatedao.org/api/health` | 200 |

The Agent Card response was served as `application/json` and the health
response was served successfully over HTTPS. The previously observed 404 is
not reproducible in this revalidation.

## Local Contract Tests

The isolated Agent Exchange service test suite completed successfully:

- 17 tests passed
- 0 failed
- 0 skipped

The suite covers Agent Card discovery, A2A discovery, MCP tool discovery,
OpenAPI-facing behavior, free verification, paid-job payment boundaries,
registry HTTPS validation, marketplace provider validation, and structured
agreements.

## Boundary

The live check confirms discoverability and service health. It does not claim
that a paid agent job was executed, that revenue was generated, or that a
third-party agent adopted the exchange.
