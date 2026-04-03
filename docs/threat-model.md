# Threat Model

## 1. System Overview

PrivateDAO is a Solana governance protocol implemented as an Anchor program. It governs proposal creation, hidden voting, proposal finalization, and treasury execution.

The core lifecycle is:

1. `create_proposal`
2. `commit_vote` or `commit_delegated_vote`
3. `reveal_vote`
4. `finalize_proposal`
5. `execute_proposal`

The commit-reveal flow is intentional:

- votes are committed as `sha256(vote_byte || salt_32 || voter_pubkey_32)`
- the proposal tally remains hidden during the commit phase
- tally updates only after valid reveal
- execution is separated from finalization by a timelock

Treasury execution supports:

- `SendSol`
- `SendToken`
- `CustomCPI` as an event-only pattern rather than arbitrary on-chain CPI execution

Delegation is proposal-scoped:

- a delegator can delegate voting weight to a delegatee for one proposal
- the delegatee commits and reveals using combined weight
- delegation is one-shot through `is_used`

On-chain boundaries:

- DAO, proposal, voter record, delegation, treasury, and voter-weight accounts
- instruction-phase enforcement
- signer enforcement
- PDA and account binding enforcement
- treasury movement

Off-chain boundaries:

- CLI scripts
- GitHub Pages frontend
- Android-native client
- RPC availability
- wallet signing
- zk witness generation
- zk proving
- zk verification artifacts

The protocol is on-chain for state transition and treasury safety. Operator surfaces are off-chain wrappers around that protocol.

The current zk layer is additive:

- it does not change the deployed on-chain lifecycle
- it adds a real off-chain proof path
- it introduces new proof-system assumptions that must be reviewed separately

## 2. Actor Model

### Malicious voter

Capabilities:

- holds governance tokens
- can sign transactions
- can attempt invalid commit/reveal orderings
- can attempt replay, wrong salt, wrong vote payload, or late reveal
- can attempt voter-record substitution

### Malicious delegate

Capabilities:

- acts as delegatee on a proposal
- can attempt to consume delegated rights outside intended binding
- can attempt stale or cross-proposal delegation use
- can attempt overlap with direct commit paths

### Malicious treasury participant

Capabilities:

- attempts treasury account substitution
- attempts recipient substitution
- attempts wrong mint, wrong token source, wrong token destination, or duplicate token account wiring
- attempts to trigger execution with valid-looking but semantically wrong accounts

### Compromised signer

Capabilities:

- controls a wallet with governance tokens or authority privileges
- can submit otherwise valid instructions
- can attempt to finalize or execute in unexpected order
- can exploit any missing signer/account binding checks

### Account substitution attacker

Capabilities:

- supplies initialized accounts that are structurally valid
- swaps proposal, voter record, delegation, treasury, or token accounts
- attempts semantic confusion without breaking serialization

### Replay attacker

Capabilities:

- resubmits prior instructions
- reuses signatures only at the transaction layer if possible
- attempts repeated commit, reveal, finalize, or execute
- attempts reordered or slightly altered account sets against old state

### Confused-deputy attacker

Capabilities:

- uses a permissionless surface such as finalize or execute
- supplies valid signer but mismatched account context
- relies on protocol accepting approximate authority or account relations

### External transaction manipulator

Capabilities:

- observes transaction timing
- front-runs or back-runs around timing windows
- cannot forge signatures, but can exploit timing or account assumptions if they exist

### ZK artifact attacker

Capabilities:

- attempts to substitute public signals
- attempts to rely on reviewer confusion between current on-chain logic and future zk integration
- attempts to exploit incorrect setup, verification key, or proof-handling assumptions

## 3. Asset Model

### Treasury balances

Treasury SOL and SPL token balances must not move except through correctly finalized and correctly wired execution paths.

### Governance decision correctness

A proposal outcome must reflect valid committed and revealed votes, not invalid reveals, stale delegation, or state confusion.

### Proposal lifecycle integrity

A proposal must move only through valid lifecycle states and must not skip, regress, or duplicate critical transitions.

### Voter rights

Only valid governance token holders should be able to propose or vote with the weight they legitimately control.

### Delegation rights

Delegation must remain proposal-scoped, delegatee-bound, one-shot, and non-replayable in practical operation.

### Execution correctness

Execution must move the intended asset to the intended recipient only after the intended proposal has passed and unlocked.

### Proposal status invariants

`Voting`, `Passed`, `Failed`, `Cancelled`, and `Vetoed` statuses must remain consistent with the lifecycle and must not be entered through partial or confused paths.

### ZK proof integrity

Proof artifacts, verification keys, and public signals must correspond to the intended circuit semantics. Otherwise the zk layer would create false assurance rather than stronger privacy guarantees.

## 4. Attack Surfaces

### Create proposal

Misuse risks:

- proposer without token ownership
- malformed treasury action
- wrong proposer token mint

### Commit vote

Misuse risks:

- vote from zero-balance or insufficient-balance account
- double commit
- commit after voting close
- wrong voter record or wrong proposal binding

### Commit delegated vote

Misuse risks:

- non-delegatee consuming delegated rights
- delegation from another proposal
- replaying a used delegation
- cross-proposal account confusion

### Reveal vote

Misuse risks:

- reveal before commit
- reveal with wrong salt
- reveal with wrong vote payload
- reveal by wrong signer
- reveal after reveal window
- reveal against wrong proposal or wrong voter record

### Finalize proposal

Misuse risks:

- finalize before reveal window ends
- finalize with wrong DAO / proposal pairing
- finalize after proposal is already finalized
- confused-deputy use of permissionless finalize surface

### Execute proposal

Misuse risks:

- execute before finalization
- execute before timelock unlock
- execute twice
- execute with wrong treasury PDA
- execute with wrong recipient
- execute with wrong token mint or token ownership relations
- partial mutation before CPI failure

### Treasury transfer logic

Misuse risks:

- SOL recipient substitution
- token mint mismatch
- source account not controlled by treasury PDA
- destination account not owned by intended recipient
- duplicate token source/destination

### Delegation logic

Misuse risks:

- self-delegation
- stale delegation
- cross-proposal reuse
- overlap between delegated and direct voting paths

### Timing window transitions

Misuse risks:

- off-by-one mistakes at commit end
- off-by-one mistakes at reveal start/end
- premature finalization
- premature execution

### ZK overlay path

Misuse risks:

- treating zk as if it already changes the deployed protocol when it does not
- mismatching proof public signals with the intended DAO or proposal context
- stale proof artifact reuse in review or verification flows
- verification-key confusion

## 5. Threat Classes

### Lifecycle bypass

Attempting to finalize or execute from the wrong phase or from a proposal state that is not eligible for that transition.

### Replay attacks

Attempting to repeat a previously valid lifecycle step to duplicate effects or re-enter a phase.

### Duplicate execution

Attempting to move treasury funds more than once from the same proposal.

### Signer confusion

Using a signer that is valid for transaction submission but not valid for the protocol role intended by the account set.

### Authority misuse

Attempting to use authority-only paths or authority-related account expectations with the wrong signer or wrong DAO context.

### PDA substitution

Supplying a valid account that is not the PDA derived for the intended proposal, vote record, delegation, or treasury.

### Account misbinding

Supplying accounts that are individually valid but belong to a different proposal, DAO, delegation, or recipient relationship.

### Treasury miswiring

Supplying incorrect treasury, recipient, token source, or token destination accounts to extract funds or redirect them.

### Commit-reveal mismatch

Attempting to reveal a vote that does not match the stored commitment or stored voter identity.

### Invalid reveal injection

Attempting to reveal before commit, after the reveal window, or using a wrong signer or keeper.

### Timing boundary attacks

Attempting to exploit off-by-one mistakes around `voting_end`, `reveal_end`, or `execution_unlocks_at`.

### Delegation misuse

Attempting to reuse delegation state, consume it from the wrong signer, or apply it to the wrong proposal.

### Partial state mutation

Attempting to trigger a failure after a lifecycle field or balance changes partially, leaving the protocol in an inconsistent state.

### State regression

Attempting to push a proposal back into an earlier state or create impossible state combinations after failure paths.

### Semantic account confusion

Supplying initialized, owner-correct, or funded accounts that still do not belong to the exact intended governance relationship.

### ZK proof confusion

Treating a valid proof as if it were sufficient for a different DAO, proposal, or verifier context than the one encoded in its public signals.

## 6. Mitigations

### Lifecycle bypass

Mitigation:

- `commit_vote` requires `status == Voting`
- `reveal_vote` requires `status == Voting` and timing checks
- `finalize_proposal` requires `status == Voting` and `now >= reveal_end`
- `execute_proposal` requires `status == Passed`, `!is_executed`, and `now >= execution_unlocks_at`

Protocol enforcement:

- `programs/private-dao/src/lib.rs`

Tests:

- `tests/full-flow-test.ts`
- `tests/private-dao.ts`

### Replay and duplicate execution

Mitigation:

- voter records reject `AlreadyCommitted`
- reveals reject `AlreadyRevealed`
- finalize rejects `AlreadyFinalized`
- execute rejects `AlreadyExecuted`

Protocol enforcement:

- `programs/private-dao/src/lib.rs`

Tests:

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Signer confusion and authority misuse

Mitigation:

- authority-only paths use `has_one = authority`
- reveal requires `revealer == voter || revealer == voter_reveal_authority`
- delegated commit requires `delegation.delegatee == delegatee.key()`
- finalize and execute remain permissionless, but account bindings remain strict

Protocol enforcement:

- `CancelProposal`
- `VetoProposal`
- `RevealVote`
- `CommitDelegatedVote`
- `FinalizeProposal`
- `ExecuteProposal`

Tests:

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### PDA substitution and account misbinding

Mitigation:

- proposal accounts use proposal PDA seeds
- voter records use vote PDA seeds bound to proposal + voter
- delegation records use delegation PDA seeds bound to proposal + delegator
- treasury PDA is derived from DAO
- `has_one = dao` and seed constraints enforce exact relations

Protocol enforcement:

- account validation in instruction contexts

Tests:

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Treasury miswiring

Mitigation:

- `SendSol` checks `treasury_recipient == action.recipient`
- `SendToken` checks:
  - token program ownership
  - token account length sanity
  - treasury token owner equals treasury PDA
  - source mint equals action mint
  - destination mint equals action mint
  - destination owner equals configured recipient
  - source and destination are not the same account

Protocol enforcement:

- `execute_proposal`

Tests:

- `tests/full-flow-test.ts`

### Commit-reveal mismatch and invalid reveal injection

Mitigation:

- reveal recomputes `sha256(vote || salt || voter_pubkey)`
- reveal requires committed state
- reveal rejects wrong signer and wrong timing

Protocol enforcement:

- `reveal_vote`

Tests:

- `tests/private-dao.ts`
- `tests/full-flow-test.ts`

### Timing boundary attacks

Mitigation:

- explicit `< voting_end`, `>= voting_end`, `< reveal_end`, `>= execution_unlocks_at` checks
- tests assert before/at/after transition behavior

Protocol enforcement:

- `commit_vote`
- `commit_delegated_vote`
- `reveal_vote`
- `finalize_proposal`
- `execute_proposal`

Tests:

- `tests/full-flow-test.ts`

### Delegation misuse

Mitigation:

- self-delegation rejected
- delegation tied to one proposal
- delegated commit checks delegatee equality
- `is_used` blocks reuse after successful delegated commit
- product surfaces block direct/delegated overlap operationally

Protocol enforcement:

- `delegate_vote`
- `commit_delegated_vote`

Tests:

- `tests/private-dao.ts`

### Partial state mutation and state regression

Mitigation:

- tests verify failed finalize and execute leave critical fields unchanged
- failed treasury execution paths are asserted not to set `is_executed`
- proposal status remains stable after failed execute attempts

Protocol enforcement:

- Anchor transaction atomicity
- explicit state checks around lifecycle fields

Tests:

- `tests/full-flow-test.ts`

### ZK overlay integrity

Mitigation:

- public signals bind proof semantics to DAO and proposal context
- proof verification is exposed through repository commands rather than vague claims
- reviewer-facing docs explain the difference between current commit-reveal and zk-augmented governance
- zk artifacts are gated through `verify-zk-surface.sh`

Protocol and repository enforcement:

- `zk/circuits/private_dao_vote_overlay.circom`
- `scripts/zk/build-zk.sh`
- `scripts/zk/prove-sample.sh`
- `scripts/zk/verify-sample.sh`
- `scripts/verify-zk-surface.sh`

Tests / verification references:

- `docs/zk-layer.md`
- `docs/zk-upgrade.md`
- `docs/zk-evidence.md`

## 7. Residual Risks

- direct-commit versus delegation mutual exclusion is still enforced operationally in CLI/frontend surfaces rather than directly on-chain
- commit-reveal hides vote content, not transaction timing or participation timing
- the zk layer is off-chain today and is not yet an on-chain verifier integration
- `CustomCPI` is event-only and depends on off-chain execution patterns if used operationally
- external RPC availability and local validator behavior affect verification environments
- no external audit is claimed
- mainnet release operations still require release discipline, monitoring, and wallet hygiene outside the program itself

## 8. Trust Assumptions

Trusted or assumed components:

- Solana runtime transaction atomicity
- Anchor account validation and signer enforcement
- SPL Token program correctness
- honest wallet signature semantics
- RPC responses are sufficiently correct for off-chain observation
- Circom circuit correctness for the current overlay
- Groth16 setup artifact integrity
- verification key integrity for the committed zk artifacts

Timing assumptions:

- cluster time and block time progress enough for lifecycle windows to become reachable
- users and operators do not assume sub-second exactness beyond the enforced timestamp boundaries

Operational assumptions:

- wallets sign only intended transactions
- off-chain surfaces preserve account sets and user intent
- deployment and governance operations use the intended program ID and cluster
