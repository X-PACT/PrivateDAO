# Zero-Knowledge Layer

PrivateDAO's current deployed protocol remains the same commit-reveal governance system described in the core specification.

The zk layer is an additive companion, not a silent protocol rewrite.

## Current Live Flow

```text
Create Proposal
-> Commit Vote
-> Reveal Vote
-> Finalize Proposal
-> Timelocked Execute
```

Current privacy property:

- vote choice stays hidden during the commit phase
- reveal later discloses the committed vote preimage

Current limitation:

- commit-reveal protects live tally privacy
- reveal still discloses witness information directly

## What The ZK Layer Adds

The zk layer introduces a real proof system that validates a private vote tuple without changing the deployed contracts or current frontend lifecycle.

Current overlay proof:

- proves vote form validity
- proves minimum-weight eligibility
- proves commitment binding to:
  - `vote`
  - `salt`
  - `voterKey`
  - `proposalId`
  - `daoKey`
- proves nullifier binding to:
  - `voterKey`
  - `proposalId`
  - `daoKey`

## Current Commit-Reveal vs ZK-Augmented Governance

### Current commit-reveal

- commitment format is `sha256(vote || salt || voter_pubkey)`
- reveal checks the exact preimage
- no zk verifier is required
- privacy is strongest before reveal

### ZK-augmented governance

- proof system validates a richer private witness
- eligibility and binding can be proven with less direct witness disclosure
- future verifier integration becomes possible without redesigning the current governance product

## What The ZK Layer Does Not Claim Yet

- it does not replace the deployed on-chain verifier path
- it does not change current instruction interfaces
- it does not make treasury execution private
- it does not remove all metadata leakage
- it does not claim anonymous final execution

## New Trust Assumptions

The zk layer introduces additional assumptions that must be stated clearly:

- circuit correctness
- witness generation correctness
- verification key correctness
- Groth16 trusted setup integrity
- proof verification correctness

## Verification Entry Point

```bash
npm run zk:all
```

This command:

- compiles the circuit
- generates setup artifacts
- builds a witness from the sample input
- generates a proof
- verifies the proof

That is why the zk layer is evidence-backed rather than aspirational.
