# Agent Exchange paid production audit — 2026-09-23

This is an independent, read-only audit. No payment or deployment was made by
this audit.

## Confirmed paid completions

Production DynamoDB contained 238 jobs, including 39 completed jobs. Excluding
free verification and receipt services, exactly two completed paid jobs were
found:

| Job | Service | Receipt | Amount | Result |
| --- | --- | --- | --- | --- |
| `job_044816b2-9f53-4923-bf96-6cb2884c6d8c` | `verify.deep` | `rvr_83dd956fed95227baf3af8929b6bda66` | `0.0001 SOL` | `VERIFIED` |
| `job_33640e3c-5bdb-42bb-a250-129840776b37` | `token.intelligence` | `rvr_fe53c65da876a1798a5b6ae36af3f27e` | `0.03 USDC` | `VERIFIED` |

The new receipt's payment transaction was independently confirmed on
Solana Mainnet with no execution error, native USDC mint, 30,000 base units,
the configured treasury token account, and memo
`PDAOJOB:job_33640e3c-5bdb-42bb-a250-129840776b37`. The production receipt,
job record, and canonical input/result/evidence digests matched.

The earlier job has two successful on-chain SOL transfers with the same job
memo. Only the second transfer is referenced by the payment, receipt, and
revenue records; the first is classified as a duplicate/retry payment, not a
second completed revenue event.

## Reconciliation findings

- Historical production jobs include 193 `awaiting_payment` and 6 `running`
  records; these are not counted as successful paid completions.
- Production Payments contains three records: two for the earlier job and one
  for the new job. Payments do not currently retain payer, asset, amount, or
  network fields, so those details must be taken from the quote, receipt, and
  chain transaction during reconciliation.
- The canonical source now includes the missing DynamoDB SDK dependencies,
  provider integrations, persistent rate-limit and telemetry table
  declarations, configurable CORS, and provider provenance in completed
  evidence.
- The corrected SAM template is a future deployment reference only. Production
  was not changed during this audit.
