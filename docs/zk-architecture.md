# ZK Architecture

## Current Position

PrivateDAO's live protocol is still the deployed commit-reveal governance system. The zk layer is an additive overlay for privacy-preserving proof generation.

## Flow

```text
private vote tuple
  -> zk witness
  -> Groth16 proof
  -> public commitment + nullifier + eligibility hash
  -> verifier check
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

### Public

- `proposalId`
- `daoKey`
- `minWeight`
- `commitment`
- `nullifier`
- `eligibilityHash`

### Private

- `vote`
- `salt`
- `voterKey`
- `weight`

## Security Goal

The zk overlay is designed to prove that a vote is well-formed and eligible without revealing private witness data directly to every verifier.

That gives PrivateDAO a concrete zk migration path while preserving the current live protocol surface.
