# Replay Analysis

## Repeated commit attempts

### Replay Vector

The same voter attempts to commit more than once for the same proposal.

### Expected Rejection Condition

`AlreadyCommitted`

### Actual Protection Mechanism

- voter record has `has_committed`
- commit requires `!vr.has_committed`

### Test Coverage Reference

- `tests/private-dao.ts`

### Residual Replay Risk

No duplicate commit effect observed.

## Repeated reveal attempts

### Replay Vector

A voter or keeper attempts to reveal the same vote twice.

### Expected Rejection Condition

`AlreadyRevealed`

### Actual Protection Mechanism

- voter record has `has_revealed`
- reveal requires `!vr.has_revealed`

### Test Coverage Reference

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Residual Replay Risk

No reveal replay path with duplicate tallying is observed.

## Repeated finalize attempts

### Replay Vector

A proposal is finalized twice.

### Expected Rejection Condition

`AlreadyFinalized`

### Actual Protection Mechanism

- finalize requires `proposal.status == Voting`

### Test Coverage Reference

- `tests/full-flow-test.ts`

### Residual Replay Risk

No repeated finalize path advances state twice.

## Repeated execute attempts

### Replay Vector

The same passed proposal is executed more than once.

### Expected Rejection Condition

`AlreadyExecuted`

### Actual Protection Mechanism

- execute requires `!proposal.is_executed`

### Test Coverage Reference

- `tests/full-flow-test.ts`

### Residual Replay Risk

No replay path results in duplicated execution effects in current coverage.

## Replay with reordered accounts

### Replay Vector

The attacker resubmits the same instruction intent with the same signer but different DAO, treasury, proposal, voter record, or delegation account order/binding.

### Expected Rejection Condition

Seed or relationship constraint failure.

### Actual Protection Mechanism

- proposal PDA bound to DAO
- voter record PDA bound to proposal + voter
- delegation PDA bound to proposal + delegator
- treasury PDA bound to DAO

### Test Coverage Reference

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Residual Replay Risk

No successful reordered-account replay is observed in the tested surfaces.

## Replay with altered signers

### Replay Vector

A replay substitutes a different signer while preserving a valid-looking account set.

### Expected Rejection Condition

Authorization or signer-role failure.

### Actual Protection Mechanism

- reveal checks voter/keeper role
- delegated commit checks delegatee equality
- authority-only actions use `has_one = authority`

### Test Coverage Reference

- `tests/private-dao.ts`

### Residual Replay Risk

Finalize and execute are intentionally permissionless, so replay safety there depends on lifecycle and account binding rather than signer exclusivity.

## Replay with duplicate signatures

### Replay Vector

A transaction is re-sent after the protocol state has already advanced.

### Expected Rejection Condition

The state transition should no longer be valid even if the transaction intent is repeated.

### Actual Protection Mechanism

- lifecycle gating
- `AlreadyCommitted`
- `AlreadyRevealed`
- `AlreadyFinalized`
- `AlreadyExecuted`

### Test Coverage Reference

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Residual Replay Risk

No duplicate-signature-driven double effect is observed in protocol behavior.

## Replay with cross-proposal state reuse

### Replay Vector

An attacker reuses vote or delegation state created for Proposal A against Proposal B.

### Expected Rejection Condition

Seed mismatch or explicit proposal relation mismatch.

### Actual Protection Mechanism

- vote PDA includes proposal key
- delegation PDA includes proposal key
- delegated commit checks `delegation.proposal == proposal.key()`

### Test Coverage Reference

- `tests/private-dao.ts`

### Residual Replay Risk

No cross-proposal replay effect is observed in current tests.

## Replay conclusion

Current test-backed reasoning supports the following conclusion:

- no replayed commit path duplicates voting weight
- no replayed reveal path duplicates tally effects
- no replayed finalize path reopens or refinalizes proposals
- no replayed execute path duplicates treasury effects

The residual replay boundary is operational rather than protocol-internal:

- permissionless surfaces remain exposed to repeated submission attempts, but protocol state and account validation prevent those attempts from duplicating effects
- RPC behavior and transaction rebroadcasting remain environmental concerns, not currently observed protocol replay vulnerabilities
