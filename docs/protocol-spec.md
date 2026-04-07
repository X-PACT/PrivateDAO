# Protocol Specification

## 1. Scope

This document defines the intended protocol behavior of PrivateDAO as implemented in the current repository.

It is not a proposal for redesign.
It is a structured description of the implemented governance lifecycle, commit-reveal semantics, execution rules, and core invariants.

The repository also includes a non-breaking zk stack. That stack is not part of the currently deployed instruction interface and is described explicitly so reviewers do not confuse additive zk work with the live protocol surface.

## 2. System Roles

- `DAO authority`
  - initializes a DAO
  - may cancel an open proposal
  - may veto a passed but not-yet-executed proposal during the timelock window
- `Governance token holder`
  - may create proposals if token ownership requirements are satisfied
  - may commit and reveal votes
  - may delegate voting power for a single proposal
- `Delegatee`
  - may consume delegated voting power for the bound proposal
- `Keeper`
  - may reveal on behalf of a voter if explicitly authorized at commit time
- `Permissionless finalizer`
  - may finalize once reveal conditions are satisfied
- `Permissionless executor`
  - may execute once a proposal is passed and timelock conditions are satisfied

## 3. Core Accounts

- `DAO`
  - governance token configuration
  - quorum and timing configuration
  - authority
  - proposal counter
- `Proposal`
  - bound to one DAO
  - contains lifecycle state, tallies, timings, and optional treasury action
- `VoterRecord`
  - bound to one proposal and one voter
  - stores commitment, weights, and reveal state
- `VoteDelegation`
  - bound to one proposal and one delegator
  - stores delegatee, delegated weights, and `is_used`
- `Treasury PDA`
  - bound to one DAO
  - executes approved treasury actions
- `VoterWeightRecord`
  - Realms-style voter-weight compatibility account

## 4. Lifecycle Specification

### 4.1 Proposal States

Implemented status values:

- `Voting`
- `Passed`
- `Failed`
- `Cancelled`
- `Vetoed`

Additional operational phases derived from state plus timestamps:

- `Commit window open`
- `Reveal window open`
- `Executable`
- `Executed`

### 4.2 Operational Interpretation

- `Voting` with `now < voting_end`
  - commit phase
- `Voting` with `voting_end <= now < reveal_end`
  - reveal phase
- `Passed` with `now < execution_unlocks_at` and `is_executed = false`
  - timelocked, vetoable phase
- `Passed` with `now >= execution_unlocks_at` and `is_executed = false`
  - executable phase
- `Passed` with `is_executed = true`
  - executed terminal state

### 4.3 Allowed Transitions

- DAO initialization
  - no proposal state transition
- `Voting` -> `Cancelled`
  - via `cancel_proposal`
- `Voting` -> `Passed`
  - via `finalize_proposal` after reveal window closes and pass conditions are satisfied
- `Voting` -> `Failed`
  - via `finalize_proposal` after reveal window closes and pass conditions are not satisfied
- `Passed` -> `Vetoed`
  - via `veto_proposal` during timelock and before execution
- `Passed` with `is_executed = false` -> `Passed` with `is_executed = true`
  - via `execute_proposal` after unlock

### 4.4 Forbidden Transitions

- commit after commit window closes
- reveal before commit
- reveal before voting end
- reveal after reveal window closes
- finalize before reveal window closes
- finalize from non-`Voting` status
- execute before finalize
- execute before timelock unlock
- execute twice
- veto after execution
- veto after timelock expiry
- regression from finalized/cancelled/vetoed states back to `Voting`

## 5. Commit-Reveal Specification

### 5.1 Commitment Format

Commitment preimage:

```text
sha256(vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32)
```

Where:

- `vote_byte` is `1` for yes and `0` for no
- `salt_32` is a 32-byte random secret
- `proposal_pubkey_32` is the target proposal public key
- `voter_pubkey_32` is the revealing voter identity

### 5.2 Commit Requirements

For direct commit:

- proposal must be in `Voting`
- current time must be before `voting_end`
- voter token account must belong to signer
- voter token mint must equal DAO governance mint
- voter token balance must be positive
- if `governance_token_required > 0`, balance must satisfy that threshold
- voter record must not already be committed
- delegation marker for the same proposal/voter must not already exist

For delegated commit:

- all direct timing/state checks still apply
- delegation must be bound to the same proposal
- delegation delegatee must equal signer
- delegation must not already be used
- direct-vote marker for the delegator must not already exist

### 5.3 Reveal Requirements

- proposal must still be in `Voting`
- current time must be at or after `voting_end`
- current time must be before `reveal_end`
- voter record must already be committed
- voter record must not already be revealed
- signer must be either:
  - the bound voter
  - the bound keeper (`voter_reveal_authority`)
- recomputed commitment must equal stored commitment

### 5.4 Replay Protection

Replay resistance is provided by:

- one voter record per proposal/voter pair
- `has_committed`
- `has_revealed`
- commitment bound to proposal public key and voter public key
- delegation `is_used`
- lifecycle timing gates

The current raw commitment preimage is:

- `sha256(vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32)`

Proposal scoping is therefore enforced both cryptographically and through the proposal-bound `VoteRecord` PDA, reveal account binding, and lifecycle flags on the stored voter record.

### 5.5 ZK-Augmented Commit-Reveal Stack

The repository now includes an additive zero-knowledge layer that does not change the deployed protocol semantics.

Current live protocol:

- commit uses `sha256(vote_byte || salt_32 || proposal_pubkey_32 || voter_pubkey_32)`
- reveal checks the committed preimage

Current zk stack:

- proves boolean vote form and minimum-weight eligibility
- proves delegation activation and delegatee binding
- proves weighted tally integrity over a commitment-consistent reveal sample
- proves proposal-scoped nullifier bindings across vote, delegation, and tally layers

This stack is currently:

- off-chain
- verifier-backed through Groth16
- intentionally non-breaking

It is an upgrade path, not a claim that the deployed program already verifies zk proofs on-chain.

## 6. Finalization Rules

### 6.1 Preconditions

- current time must be at or after `reveal_end`
- proposal status must still be `Voting`
- proposal must be bound to the supplied DAO

### 6.2 Outcome Computation

Quorum condition:

- `commit_count > 0`
- `reveal_count / commit_count` must satisfy DAO quorum percentage

Voting mode conditions:

- `TokenWeighted`
  - `yes_capital > no_capital`
- `Quadratic`
  - `yes_community > no_community`
  - assumes an external sybil-resistance or identity policy
- `DualChamber`
  - both capital and community thresholds must be satisfied

### 6.3 Finalization Effects

If passed:

- status becomes `Passed`
- `execution_unlocks_at = now + execution_delay_seconds`

If failed:

- status becomes `Failed`
- `execution_unlocks_at` remains unchanged from the default non-executable value unless previously impossible under valid flow

## 7. Execution Rules

### 7.1 Preconditions

- proposal status must be `Passed`
- proposal must not already be executed
- current time must be at or after `execution_unlocks_at`
- proposal must be bound to DAO
- treasury PDA must be bound to DAO

### 7.2 Treasury Actions

#### SendSol

Execution requires:

- `treasury_recipient == action.recipient`

Effect:

- lamports move from treasury PDA to configured recipient

#### SendToken

Execution requires:

- `treasury_recipient == action.recipient`
- action contains token mint
- source and destination token accounts are owned by the token program
- token account data length sanity checks pass
- treasury token owner equals treasury PDA
- treasury token mint equals configured action mint
- recipient token mint equals configured action mint
- source and destination token accounts are not the same account
- recipient token owner equals configured recipient

Effect:

- SPL token amount moves from treasury token account to configured recipient token account

#### CustomCPI

The current implementation intentionally rejects `CustomCPI` rather than exposing an event-only success path or arbitrary CPI execution.

Effect:

- proposal creation or execution that attempts `CustomCPI` is rejected
- no treasury movement or execution flag mutation occurs
- the live protocol does not claim arbitrary CPI execution inside the PrivateDAO program

## 8. Authority Rules

- `initialize_dao`
  - requires DAO authority signer
- `create_proposal`
  - requires proposer signer with governance token ownership
- `cancel_proposal`
  - authority only
- `veto_proposal`
  - authority only
- `commit_vote`
  - voter signer only
- `delegate_vote`
  - delegator signer only
- `commit_delegated_vote`
  - delegatee signer only
- `reveal_vote`
  - voter or authorized keeper only
- `finalize_proposal`
  - permissionless
- `execute_proposal`
  - permissionless

Keeper note:

- keeper authority is optional and proposal-scoped
- keeper can only submit the exact reveal for the stored commitment
- successful reveal clears stored keeper authority from the voter record

## 9. Formal Invariants

### Lifecycle Invariants

- `Executed => status == Passed`
- `Executed => execution_unlocks_at > 0`
- `Cancelled => not executable`
- `Vetoed => not executable`
- `Failed => not executable`
- finalized proposals do not return to `Voting`

### Commit-Reveal Invariants

- `has_revealed => has_committed`
- reveal count never exceeds commit count
- invalid reveal does not mutate tally
- revealed tally only comes from valid commitments
- proposal-scoped replay protection is enforced both by proposal-bound commitments and by voter-record PDA binding

### Execution Invariants

- successful execute is the only valid path that sets `is_executed = true`
- failed execute does not set `is_executed`
- duplicate execute does not create duplicate treasury effects
- treasury balance delta must equal intended action amount on successful execute
- reveal rebate is only paid when the proposal account remains rent-safe; it is not a treasury payout

### Binding Invariants

- proposal belongs to exactly one DAO
- voter record belongs to exactly one proposal and one voter
- delegation belongs to exactly one proposal and one delegator
- treasury belongs to exactly one DAO
- execution accounts must be exact, not approximate or merely initialized

### ZK Overlay Invariants

- proof public signals are proposal-bound
- proof public signals are DAO-bound
- nullifier is scoped to voter, proposal, and DAO
- eligibility proof is scoped to voter, weight, and DAO
- proof verification alone does not advance on-chain lifecycle state

### Strict V2 Overlay Invariants

- strict ZK finalization requires `ProposalExecutionPolicySnapshot`
- strict ZK finalization requires `ProposalProofVerification.status == Verified`
- strict ZK proof records must be DAO-bound and proposal-bound
- strict ZK proof records must match the canonical V2 proposal payload hash
- strict ZK proof records must be fresh at finalization time
- threshold-attested proof verification is an explicit on-chain trust model, not a cryptographic verifier CPI claim
- strict proof companion accounts cannot be overwritten with a different strict payload after recording

### Settlement V2 Invariants

- strict confidential payout execution requires `SettlementEvidence.status == Verified`
- strict settlement evidence must be DAO-bound, proposal-bound, payout-plan-bound, and canonical-payout-field-bound
- strict settlement evidence must be fresh at execution time
- strict settlement evidence is consumed through a single-use `SettlementConsumptionRecord` PDA
- strict settlement evidence accounts cannot be overwritten with a different evidence payload after recording
- the same settlement evidence cannot execute two payouts

### Policy Transition Invariants

- legacy objects remain readable after V2 policy accounts are added
- DAO-wide future policy changes do not silently reinterpret proposals with existing `ProposalExecutionPolicySnapshot`
- strict enforcement requires explicit companion accounts rather than implicit reinterpretation of legacy records

## 10. On-Chain vs Off-Chain Boundaries

### On-Chain

- lifecycle gating
- signer requirements
- PDA/account binding
- treasury execution checks
- tally accounting
- delegation consumption

### Off-Chain

- CLI and frontend orchestration
- salt storage
- explorer linking
- devnet/local validator setup
- zk witness generation
- zk proving
- primary Groth16 proof verification workflow

## 11. Known Limits of the Current Specification

- this specification reflects the current repository behavior, not an aspirational redesign
- commit-reveal hides vote content, not timing metadata
- Groth16 witness generation and proving remain off-chain. Legacy `zk_enforced` receipts are retained for compatibility, while the V2 strict path adds companion proof-verification accounts, threshold-attested verification, canonical payload binding, expiry, and object-level policy snapshots. This is stronger than legacy receipt metadata, but still an attested fallback until a cryptographic verifier CPI is integrated.
- no external audit is claimed by this document
