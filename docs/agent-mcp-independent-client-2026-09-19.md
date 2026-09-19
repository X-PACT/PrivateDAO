# Agent Exchange MCP Independent Client Check

Observed: `2026-09-19`

The repository now includes `npm run test:agent-mcp`, a standalone Node
client that uses only the public MCP HTTP endpoint. It does not import the
Agent Exchange implementation and it does not use a wallet, payment, admin
credential, or mutating request.

## Verified

- `POST https://agents.privatedao.org/mcp` returned JSON-RPC `initialize`
  successfully.
- Negotiated protocol version: `2025-03-26`.
- Server: `pdao-agent-exchange` version `1.1.0`.
- `tools/list` returned 11 tools.
- Required read/discovery tools `pdao_services`, `verify_basic`, and
  `network_stats` were present.
- A read-only `tools/call` for `pdao_services` returned 14 services.

## Boundary

This proves a reproducible independent HTTP-client compatibility check for the
published JSON-RPC surface. It does not certify every third-party MCP SDK,
authenticated agent workflow, paid execution, or external adoption.
