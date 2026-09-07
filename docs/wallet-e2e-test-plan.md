# Wallet And End-to-End Test Plan

This plan defines the user-facing flows that must be exercised before mainnet real-funds operation. It complements the existing Devnet load and resilience evidence; it does not fabricate real-device captures.

## Environments

Minimum target matrix:

- Phantom desktop on Devnet
- Solflare desktop on Devnet
- Backpack desktop on Devnet
- Glow desktop on Devnet
- Android or mobile browser path when supported

## Flow 1 — Wallet And Diagnostics

1. open the live product
2. connect wallet on Devnet
3. open runtime diagnostics
4. copy the diagnostics snapshot
5. confirm no console errors for wallet detection or RPC reads

Expected evidence:

- wallet label
- network
- diagnostics snapshot
- screenshot or recording reference

## Flow 2 — DAO Governance Lifecycle

1. create or select the Devnet DAO
2. create a simple proposal
3. commit a vote
4. reveal with the same salt and vote
5. finalize after the reveal window
6. execute after the timelock

Expected evidence:

- proposal PDA
- transaction signatures for lifecycle transitions
- explorer links
- final status

## Flow 3 — Confidential Payout Path

1. create a confidential payroll or bonus proposal
2. verify aggregate payout metadata is visible without plaintext compensation data
3. run the governance lifecycle
4. execute only after the required settlement or evidence path is present
5. confirm no plaintext private payroll data appears in logs or UI output

Expected evidence:

- proposal PDA
- payout plan PDA where applicable
- execution signature
- confirmation that private details were not exposed

## Flow 4 — Strict V2 Proof And Settlement Boundary

1. initialize or inspect `DaoSecurityPolicy`
2. record `ProposalExecutionPolicySnapshot`
3. record proof verification evidence for the proposal
4. attempt finalize without valid proof evidence and confirm rejection
5. finalize with valid strict evidence
6. execute confidential payout with single-use settlement evidence
7. attempt evidence replay and confirm rejection

Expected evidence:

- policy account
- proof verification account
- settlement evidence account
- consumption record
- rejection signature or error for replay attempt

## Flow 5 — Negative User Paths

1. reveal with the wrong salt and confirm rejection
2. attempt late cancel after meaningful participation and confirm V2 rejection
3. attempt execution before timelock and confirm rejection
4. attempt duplicate execution and confirm rejection
5. attempt settlement evidence replay and confirm rejection

Expected evidence:

- error code or transaction failure reason
- proposal account state remains non-corrupted
- no treasury movement for rejected actions

## Logging

For each failed or successful test, preserve:

- wallet
- browser/client
- network
- transaction signature or error
- console error, if any
- Network tab failure, if any
- explorer URL for successful Devnet transactions

## Honest Boundary

The repository already contains Devnet load and resilience evidence. Real-device wallet readiness is not complete until the captures are recorded through:

```bash
npm run record:real-device-runtime -- /path/to/capture.json
npm run build:real-device-runtime
npm run verify:real-device-runtime
```
