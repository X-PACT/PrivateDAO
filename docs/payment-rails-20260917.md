# Testnet Payment Rails Evidence

The user authorized optional bridges on September 17. Native product execution
and its capability matrix retain independent network contracts and receipts.

## Observed execution

- Tempo: three one-atomic-unit AlphaUSD payments, one atomic transaction,
  reconciliation 3/3. Amounts and recipients are public onchain. Random references
  are committed into network/asset/payer/payee/amount-bound memos.
- Sepolia to Base Sepolia: 0.001 test ETH deposited through the canonical portal.
  Both source and destination receipts succeeded; destination hash is derived
  from the source portal event, not inferred from a balance increase.
- Initial bridge attempt reverted. The second attempt used bounded gas headroom
  after a fresh estimate. Both attempts are recorded in the evidence artifact.
- These are internal test transactions, not customers, revenue or adoption.

Artifacts: `packages/evm-verification/deployments/payment-rail-tempo.json` and
`packages/evm-verification/deployments/payment-rail-base-bridge.json`.

## Operational boundaries

Only Tempo Testnet and Sepolia-to-Base-Sepolia ETH are implemented here. No
Tempo bridge, arbitrary-token bridge or other destination is declared supported.
Mainnet is rejected by the builders. Existing website, game, AWS configuration
and product deployments were not changed by this work.

The integration helpers build unsigned calls and reconcile receipts. Organization
approval, durable tenant-scoped idempotency and wallet UI integration are still
required before exposing them as commercial payment actions. Tempo's public
transfers must not be advertised as Umbra-style confidential settlement.

The test runner persists signed bytes and their hash before broadcast under
`~/.privatedao-secrets/payment-rail-runs/` with private permissions. Resume uses
the persisted hash; no replacement payment is created on timeout. The
`--retry-reverted` option requires an onchain reverted receipt first. A process
lock prevents simultaneous runners. If a process is killed, inspect that exact
process and the stored hash before removing its stale lock directory.

## Official references checked

- Tempo transfer memos: https://docs.tempo.xyz/guide/payments/transfer-memos
- Tempo atomic calls: https://docs.tempo.xyz/guide/use-accounts/batch-transactions
- Base Sepolia portal: https://docs.base.org/specifications/reference/base-contracts

## Next work

Use the newly funded Base account for native verification deployment and E2E.
Wire payment helpers into approved organizational execution and commercial UI
with persistent idempotency. Other network/product gaps in the master backlog
remain active; this payment milestone does not close the full objective.
