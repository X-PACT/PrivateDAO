# Umbra Devnet Relayer Receipt - 2026-05-06

PrivateDAO now verifies the Umbra Devnet relayer through the hosted AWS read-node path.

## Live Endpoints

| Check | URL | Observed result |
| --- | --- | --- |
| Relayer health | `https://api.privatedao.org/api/v1/umbra/relayer/health` | `status: ok` |
| Relayer info | `https://api.privatedao.org/api/v1/umbra/relayer/info` | relayer address and supported mints returned |
| Settlement intent | `POST https://api.privatedao.org/api/v1/private-settlement/intent` | reviewer receipt generated |

## Observed Relayer

- Endpoint: `https://relayer.api-devnet.umbraprivacy.com`
- Relayer address: `3kbpT5EmRBjDZG5XcTYR4LmXb4EYf2AowfCVd55ePG5B`
- Supported mints:
  - `So11111111111111111111111111111111111111112`
  - `DXQwBNGgyQ2BzGWxEriJPVmXYFQBsQbXvfvfSNTaJkL6`
  - `4oG4sjmopf5MzvTHLE8rpVJ2uyczxfsw2K84SUTpNDx7`

## Reviewer Receipt

- Rail: `umbra`
- Network: `testnet`
- Operation type: `private-payroll`
- Asset: `USDC`
- Amount: `0.01`
- Recipient: `Dve1eYmVxkJLv6Jtv27ry77r73ZoyawdNQ9YoXruh3hM`
- Execution reference: `umbra-01c0a6f5f3ffb94eb64c1b84`
- Receipt hash: `01c0a6f5f3ffb94eb64c1b84205750c6fe0af37a6a75cd2a64eb6a5415dfd76f`

## Truth Boundary

This closes the live hosted relayer/readiness layer and the private settlement receipt path.

It does not claim a completed Umbra claim transaction. A real Umbra claim still requires SDK-generated ZK `proof_account_data`, UTXO slot data, and a valid claim request accepted by the relayer lifecycle:

`received -> validating -> offsets_reserved -> building_tx -> tx_built -> submitting -> submitted -> awaiting_callback -> callback_received -> finalizing -> completed`

PrivateDAO intentionally does not fabricate cryptographic claim bodies.
