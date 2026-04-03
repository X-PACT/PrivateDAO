# ZK Assumption Matrix

This matrix makes the PrivateDAO zk stack reviewable with the same discipline used for the live protocol.

The deployed Solana program is unchanged. These assumptions apply to the additive Circom and Groth16 stack around it.

## Layer Matrix

| Layer | Circuit | What Is Proven | Public Outputs | Primary Assumptions | Residual Limits | Replay Boundary |
| --- | --- | --- | --- | --- | --- | --- |
| Vote validity | `private_dao_vote_overlay` | vote is boolean, threshold is met, commitment binding is correct | `proposalId`, `daoKey`, `minWeight`, `commitment`, `nullifier`, `eligibilityHash` | circuit correctness, witness correctness, verification key correctness, trusted setup integrity | no on-chain verifier yet, transaction timing remains visible | proposal-scoped vote nullifier |
| Delegation authorization | `private_dao_delegation_overlay` | delegation is active, delegatee binding is correct, delegated weight commitment is valid | `proposalId`, `daoKey`, `minWeight`, `delegationCommitment`, `delegationNullifier`, `delegateeBinding`, `weightCommitment` | circuit correctness, witness correctness, verification key correctness, trusted setup integrity | no on-chain delegation-proof enforcement yet | proposal-scoped delegation nullifier |
| Tally integrity | `private_dao_tally_overlay` | a bounded reveal sample is internally well formed and deterministic weighted totals are consistent | `proposalId`, `daoKey`, `commitment0..1`, `yesWeightTotal`, `noWeightTotal`, `nullifierAccumulator` | circuit correctness, witness correctness, verification key correctness, trusted setup integrity | sample-based tally proof, not a full hidden on-chain tally replacement | public accumulator over revealed sample nullifiers |

## Repository-Level Assumptions

These assumptions apply to the stack as a whole:

- `docs/zk-registry.generated.json` matches the actual artifact tree
- exported verification keys correspond to the tracked circuits
- recomputed public signals match the committed sample outputs
- tampered public signals fail verification
- tampered proof objects fail verification
- the cryptographic manifest fingerprints the canonical zk review artifacts

## Verification Commands

Full proving path:

```bash
npm run zk:all
```

Registry and docs:

```bash
npm run build:zk-registry
npm run verify:zk-registry
npm run verify:zk-docs
```

Consistency and tamper checks:

```bash
npm run verify:zk-consistency
npm run verify:zk-negative
```

Repository-wide gate:

```bash
npm run verify:all
```

## Intended Reviewer Interpretation

This matrix does not claim anonymous on-chain execution or finished verifier integration.

It supports a narrower and more defensible claim:

- the zk stack is real
- each layer has explicit replay boundaries
- each layer has documented assumptions and residual limits
- the repository contains direct commands to test the zk evidence package
