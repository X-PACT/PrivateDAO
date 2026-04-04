# Failure Modes

## 1. Execute with mismatched treasury

### Scenario

An attacker supplies a treasury PDA derived from another DAO while keeping the proposal valid.

### Trigger

`execute_proposal` with a valid-looking but semantically wrong treasury account.

### Expected Safe Outcome

The instruction must fail before execution effects occur.

### Verified Protection

- treasury account is seed-bound to the supplied DAO
- proposal is `has_one = dao`
- failed path leaves `is_executed = false`

Reference:

- `tests/full-flow-test.ts`

### Remaining Risk

No direct protocol gap observed in this path.

## 2. Finalize using wrong dao context

### Scenario

A permissionless finalizer submits a correct proposal with an incorrect DAO account.

### Trigger

`finalize_proposal` with mismatched `dao` / `proposal`.

### Expected Safe Outcome

The instruction fails on seed or `has_one` validation and proposal fields remain unchanged.

### Verified Protection

- proposal PDA is DAO-bound
- failed finalize leaves status and unlock fields unchanged

Reference:

- `tests/full-flow-test.ts`

### Remaining Risk

No direct protocol gap observed in this path.

## 3. Reveal using wrong voter

### Scenario

An attacker attempts to reveal another voter’s commit.

### Trigger

`reveal_vote` signed by a different signer than the voter or authorized keeper.

### Expected Safe Outcome

The reveal is rejected and tallies remain unchanged.

### Verified Protection

- `revealer` must equal voter or keeper
- mismatched reveal signer rejected

Reference:

- `tests/private-dao.ts`

### Remaining Risk

Metadata timing remains observable even when vote content stays hidden.

## 4. Commit using stale or cross-proposal delegation

### Scenario

A delegatee tries to consume a delegation PDA that belongs to another proposal.

### Trigger

`commit_delegated_vote` with a valid delegation account from the wrong proposal.

### Expected Safe Outcome

The instruction fails and the delegation remains unused.

### Verified Protection

- delegation PDA is proposal-bound
- failed delegated commit does not set `is_used`

Reference:

- `tests/private-dao.ts`

### Remaining Risk

Direct/delegated overlap is now rejected on-chain through proposal-bound vote and delegation marker accounts. Product surfaces still mirror that same check for clearer operator feedback.

## 5. Replay execution attempt

### Scenario

An attacker replays execute after a successful treasury transfer.

### Trigger

A second `execute_proposal` call with the same proposal.

### Expected Safe Outcome

The second call is rejected and no second transfer occurs.

### Verified Protection

- `AlreadyExecuted`
- treasury delta asserted to match only one execution

Reference:

- `tests/full-flow-test.ts`

### Remaining Risk

No duplicate execution path is currently observed in tests.

## 6. Malformed but valid-looking token accounts

### Scenario

An attacker supplies initialized token accounts with incorrect mint, owner, or source semantics.

### Trigger

`SendToken` execution with wrong destination owner, wrong mint, duplicate source/destination, or non-treasury source ownership.

### Expected Safe Outcome

Execution fails before any token transfer and proposal remains unexecuted.

### Verified Protection

- recipient owner match
- mint match on source and destination
- treasury ownership match
- source/destination non-duplication
- `is_executed` remains false on failed paths

Reference:

- `tests/full-flow-test.ts`

### Remaining Risk

No direct protocol gap observed in this path.

## 7. Partial execution attempt

### Scenario

A treasury execute path fails after lifecycle checks but before intended funds transfer.

### Trigger

Miswired execute path or invalid treasury account arrangement.

### Expected Safe Outcome

No partial treasury movement and no lifecycle advancement.

### Verified Protection

- failed execute paths are asserted to preserve `is_executed`
- balances and status remain stable until a successful execute

Reference:

- `tests/full-flow-test.ts`

### Remaining Risk

Relies on Solana transaction atomicity as a trust assumption.

## 8. Cross-proposal voter-record misuse

### Scenario

A voter record from Proposal A is supplied to Proposal B.

### Trigger

`commit_vote` with a PDA derived from another proposal.

### Expected Safe Outcome

Seed validation failure before vote state mutates.

### Verified Protection

- vote record PDA includes proposal key

Reference:

- `tests/private-dao.ts`

### Remaining Risk

No direct protocol gap observed in this path.

## 9. Authority substitution attempt

### Scenario

A non-authority attempts an authority-only action, or a valid signer attempts permissionless action with wrong authority-related context.

### Trigger

`cancel_proposal`, `veto_proposal`, or confused binding around finalize/execute contexts.

### Expected Safe Outcome

Authority-only paths reject the signer; permissionless paths still reject wrong account context.

### Verified Protection

- `has_one = authority`
- DAO/proposal/treasury binding checks

Reference:

- `programs/private-dao/src/lib.rs`
- `tests/full-flow-test.ts`

### Remaining Risk

Authority-only paths are logic-protected, but explicit authority misuse tests are thinner than execute/finalize path tests.

## 10. Invalid PDA substitution

### Scenario

An attacker uses valid initialized accounts that are not the exact PDAs expected by the protocol.

### Trigger

Substitution against proposal, voter record, delegation, or treasury.

### Expected Safe Outcome

Seed or relationship constraints fail before any state mutation.

### Verified Protection

- PDA seeds tie accounts to DAO/proposal/voter/delegator relationships

Reference:

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Remaining Risk

No direct protocol gap observed in tested substitution paths.
