<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Confidential Payroll Flow

## Product Goal

PrivateDAO should support compensation operations without forcing a DAO to publish a full employee or contributor spreadsheet on-chain.

## Lifecycle

### 1. Author The Batch

The operator prepares an encrypted manifest off-chain. The manifest can live in Box, Drive, or another controlled document store, but it must produce:

- a stable URI
- a manifest hash
- a ciphertext hash

### 2. Bind It To Governance

The proposal carries a confidential payout plan PDA. That PDA is seeded by the proposal address and stores:

- payout type
- settlement recipient
- token mint if applicable
- recipient count
- total amount
- encrypted manifest URI
- immutable hashes

### 3. Approve Privately

The proposal still follows the core PrivateDAO lifecycle:

- commit
- reveal
- finalize
- timelock
- execute

This means the compensation batch inherits the same governance checks as any other treasury action.

### 4. Release The Aggregate Batch

Execution transfers the aggregate amount from the DAO treasury to the settlement recipient. The settlement recipient then handles the final per-recipient distribution against the encrypted manifest.

## Why This Model

This design stays compatible with the current protocol and keeps the security boundary clear:

- the DAO approves the batch on-chain
- the treasury releases only the approved aggregate amount
- the detailed payroll sheet remains encrypted off-chain

## Current Limits

- the chain does not privately distribute to each employee directly
- the encrypted manifest is off-chain
- reviewers must validate manifest provenance through hashes and operator evidence

## Strong Next Step

The natural upgrade path is to prove payout correctness with zk constraints over:

- total budget
- recipient eligibility
- duplicate prevention
- allocation consistency

without exposing the raw payout sheet.
