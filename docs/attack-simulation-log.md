# Attack Simulation Log

This file records reviewer-relevant misuse attempts and the expected safe outcome.

## Attempt: Execute Twice

- Expected: Reject
- Result: Rejected
- Evidence: `AlreadyExecuted` path
- Test: `tests/full-flow-test.ts`

## Attempt: Reveal Before Commit

- Expected: Reject
- Result: Rejected
- Evidence: `NotCommitted` or phase rejection path
- Test: `tests/full-flow-test.ts`

## Attempt: Reveal With Invalid Salt

- Expected: Reject
- Result: Rejected
- Evidence: `CommitmentMismatch`
- Test: `tests/private-dao.ts`

## Attempt: Reveal With Mismatched Vote Payload

- Expected: Reject
- Result: Rejected
- Evidence: `CommitmentMismatch`
- Test: `tests/private-dao.ts`

## Attempt: Reveal By Wrong Signer

- Expected: Reject
- Result: Rejected
- Evidence: `NotAuthorizedToReveal`
- Test: `tests/private-dao.ts`

## Attempt: Commit From Zero-Balance Governance Account

- Expected: Reject
- Result: Rejected
- Evidence: `InsufficientTokens`
- Test: `tests/private-dao.ts`

## Attempt: Double Commit

- Expected: Reject
- Result: Rejected
- Evidence: `AlreadyCommitted`
- Test: `tests/private-dao.ts`

## Attempt: Finalize Before Reveal End

- Expected: Reject
- Result: Rejected
- Evidence: `RevealStillOpen`
- Test: `tests/full-flow-test.ts`

## Attempt: Finalize With Wrong DAO Context

- Expected: Reject
- Result: Rejected
- Evidence: seed / `has_one` constraint failure
- Test: `tests/full-flow-test.ts`

## Attempt: Execute Before Finalize

- Expected: Reject
- Result: Rejected
- Evidence: `ProposalNotPassed`
- Test: `tests/full-flow-test.ts`

## Attempt: Execute Before Timelock Unlock

- Expected: Reject
- Result: Rejected
- Evidence: `ExecutionTimelockActive`
- Test: `tests/full-flow-test.ts`

## Attempt: Execute With Treasury PDA From Another DAO

- Expected: Reject
- Result: Rejected
- Evidence: treasury seed binding failure
- Test: `tests/full-flow-test.ts`

## Attempt: Execute With Wrong Recipient Token Owner

- Expected: Reject
- Result: Rejected
- Evidence: `RecipientOwnerMismatch`
- Test: `tests/full-flow-test.ts`

## Attempt: Execute With Wrong Token Mint

- Expected: Reject
- Result: Rejected
- Evidence: `InvalidTokenMint`
- Test: `tests/full-flow-test.ts`

## Attempt: Execute With Non-Treasury Token Source

- Expected: Reject
- Result: Rejected
- Evidence: `InvalidTreasuryTokenAuthority`
- Test: `tests/full-flow-test.ts`

## Attempt: Reuse Voter Record Across Proposals

- Expected: Reject
- Result: Rejected
- Evidence: vote PDA seed mismatch
- Test: `tests/private-dao.ts`

## Attempt: Commit Delegated Vote As Non-Delegatee

- Expected: Reject
- Result: Rejected
- Evidence: `NotDelegatee`
- Test: `tests/private-dao.ts`

## Attempt: Reuse Delegation From Another Proposal

- Expected: Reject
- Result: Rejected
- Evidence: delegation proposal-binding mismatch
- Test: `tests/private-dao.ts`

## Attempt: Force Partial State Mutation Through Failed Execute

- Expected: No mutation
- Result: Preserved
- Evidence: `isExecuted` remains false; balances and status remain stable on failed paths
- Test: `tests/full-flow-test.ts`

## Attempt: Force Partial State Mutation Through Failed Finalize

- Expected: No mutation
- Result: Preserved
- Evidence: status, reveal count, commit count, and unlock fields remain unchanged
- Test: `tests/full-flow-test.ts`

## Reviewer Note

This log is not a substitute for reading the formal security documents.

It is a compact attack-simulation index that helps an auditor jump quickly from:

- attack idea
- to expected safety property
- to repository evidence
