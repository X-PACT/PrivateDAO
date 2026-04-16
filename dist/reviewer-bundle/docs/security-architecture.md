# Security Architecture

## 1. Governance Flow Diagram

```text
User
  -> Create Proposal
  -> Commit Vote
  -> Reveal Vote
  -> Finalize Proposal
  -> Timelocked Execute
  -> Treasury Transfer
```

## 2. Protocol Flow

```text
Wallet Signer
  -> Program Instruction
  -> DAO / Proposal / Vote / Delegation validation
  -> State transition
  -> Optional treasury execution
  -> Transaction signature + explorer proof
```

## 2A. Governance Access Layer

```text
User
  -> Token Ownership
  -> Proposal Eligibility
  -> Governance Lifecycle
```

The token operates as the governance access layer:

- token ownership gates structured participation
- proposal eligibility becomes accountable instead of open-ended
- lifecycle access stays aligned with governance identity
- treasury outcomes remain tied to governed participation

## 3. Account Binding Map

```text
DAO
├── Proposal
│   ├── VoterRecord
│   ├── DelegationRecord
│   └── TreasuryAction
└── Treasury PDA
```

## 4. Signer Flow

```text
Authority signer
  -> initialize_dao
  -> cancel_proposal
  -> veto_proposal

Governance token holder
  -> create_proposal
  -> commit_vote
  -> reveal_vote

Delegator
  -> delegate_vote

Delegatee
  -> commit_delegated_vote

Keeper
  -> reveal_vote (only if authorized at commit time)

Permissionless finalizer / executor
  -> finalize_proposal
  -> execute_proposal
```

## 5. Treasury Structure

```text
DAO
  -> Treasury PDA
      -> SOL balance
      -> optional SPL token accounts

Proposal
  -> TreasuryAction
      -> action type
      -> amount
      -> recipient
      -> optional token mint
```

## 6. Replay Boundaries

```text
Commit
  -> one voter record per proposal/voter
  -> has_committed blocks replay

Reveal
  -> has_revealed blocks replay
  -> vote bound to commitment and voter pubkey

Finalize
  -> non-Voting status blocks replay

Execute
  -> is_executed blocks replay
  -> timelock and binding checks block premature or confused replays
```

## 7. Security Layers

### Layer 1 — State Machine Enforcement

- `Voting` gate for commit and reveal
- reveal-end gate for finalize
- unlock gate for execute

### Layer 2 — Signer Enforcement

- authority-only cancel/veto
- voter-only commit
- delegatee-only delegated commit
- voter-or-keeper reveal

### Layer 3 — Account Binding

- proposal PDA bound to DAO
- voter record PDA bound to proposal + voter
- delegation PDA bound to proposal + delegator
- treasury PDA bound to DAO

### Layer 4 — Treasury Validation

- recipient match
- mint match
- token ownership match
- duplicate token account rejection
- treasury source ownership match

### Layer 5 — Atomicity

- failed finalize/execute should not advance lifecycle
- failed execution paths should not partially transfer funds

### Layer 6 — Zero-Knowledge Overlay

- Circom circuit for vote-form validity
- Groth16 proof generation and verification
- minimum-weight eligibility proof
- proposal-scoped commitment and nullifier binding

### Layer 7 — Cryptographic Artifact Integrity

- sha256 manifest over canonical zk artifacts
- sha256 manifest over canonical proof artifacts
- published fingerprints for reviewer-visible verification
- automated integrity checks through repo verification gates

## 8. Reviewer Reading Order

If a reviewer wants the fastest architecture-level understanding:

1. Read `docs/protocol-spec.md`
2. Read `docs/security-review.md`
3. Read `docs/security-coverage-map.md`
4. Inspect `tests/private-dao.ts`
5. Inspect `tests/full-flow-test.ts`

## 9. Honest Boundaries

- this architecture is devnet-first
- direct/delegated overlap is rejected on-chain through proposal-bound marker accounts
- `CustomCPI` is intentionally not arbitrary on-chain execution
