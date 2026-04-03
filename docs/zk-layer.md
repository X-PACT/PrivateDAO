# Zero-Knowledge Layer

PrivateDAO's current deployed protocol remains the same commit-reveal governance system described in the core specification.

The zk layer is now a layered additive companion stack, not a silent protocol rewrite.

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

The zk layer introduces real Circom and Groth16 proof systems that validate private governance data without changing the deployed contracts or current frontend lifecycle.

Current live stack:

- `private_dao_vote_overlay`
  - vote form validity
  - threshold eligibility
  - proposal-scoped commitment binding
  - proposal-scoped nullifier binding
- `private_dao_delegation_overlay`
  - delegation activation
  - delegatee binding
  - delegated weight commitment
  - proposal-scoped delegation nullifier binding
- `private_dao_tally_overlay`
  - deterministic weighted tally proof
  - commitment-consistent reveal sample
  - nullifier accumulator over the revealed sample

## Current Commit-Reveal vs ZK-Augmented Governance

### Current commit-reveal

- commitment format is `sha256(vote || salt || voter_pubkey)`
- reveal checks the exact preimage
- no zk verifier is required
- privacy is strongest before reveal

### ZK-augmented governance

- proof systems validate richer private witnesses across vote, delegation, and tally layers
- eligibility, delegation, and deterministic tally logic can be proven with less direct witness disclosure
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

- compiles every live zk circuit
- generates or refreshes setup artifacts
- builds witnesses from circuit-specific sample inputs
- generates real proofs
- verifies all proofs against their exported verification keys

That is why the zk layer is evidence-backed rather than aspirational.

Per-layer commands:

```bash
npm run zk:prove:vote
npm run zk:prove:delegation
npm run zk:prove:tally
```
