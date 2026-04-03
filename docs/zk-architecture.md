# ZK Architecture

## Current Position

PrivateDAO's live protocol is still the deployed commit-reveal governance system. The zk layer is now an additive stack for privacy-preserving proof generation.

## Flow

```text
vote tuple
  -> vote witness
  -> Groth16 vote proof

delegation tuple
  -> delegation witness
  -> Groth16 delegation proof

revealed tally sample
  -> tally witness
  -> Groth16 tally proof

public review signals
  -> verifier checks
```

## Boundaries

### On-chain today

- proposal lifecycle
- treasury execution
- timelock enforcement
- account binding
- replay resistance through lifecycle and execution guards

### Off-chain today

- zk witness generation
- Groth16 proving
- verification key management
- proof verification

## Circuit Inputs

### Vote layer public

- `proposalId`
- `daoKey`
- `minWeight`
- `commitment`
- `nullifier`
- `eligibilityHash`

### Vote layer private

- `vote`
- `salt`
- `voterKey`
- `weight`

### Delegation layer public

- `proposalId`
- `daoKey`
- `minWeight`
- `delegationCommitment`
- `delegationNullifier`
- `delegateeBinding`
- `weightCommitment`

### Delegation layer private

- `delegatorKey`
- `delegateeKey`
- `salt`
- `delegatedWeight`
- `active`

### Tally layer public

- `proposalId`
- `daoKey`
- `commitment0..1`
- `yesWeightTotal`
- `noWeightTotal`
- `nullifierAccumulator`

### Tally layer private

- `vote0..1`
- `salt0..1`
- `voterKey0..1`
- `weight0..1`

## Security Goal

The zk stack is designed to prove that votes, delegations, and tally samples are well formed without forcing every verifier to inspect the private witness directly.

That gives PrivateDAO a concrete zk migration path while preserving the current live protocol surface.
