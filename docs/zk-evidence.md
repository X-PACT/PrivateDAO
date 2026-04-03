# ZK Evidence

This repository now includes a real multi-circuit zk proving flow for the PrivateDAO companion stack.

## Circuits

- `zk/circuits/private_dao_vote_overlay.circom`
- `zk/circuits/private_dao_delegation_overlay.circom`
- `zk/circuits/private_dao_tally_overlay.circom`

## Sample Inputs

- `zk/inputs/private_dao_vote_overlay.sample.json`
- `zk/inputs/private_dao_delegation_overlay.sample.json`
- `zk/inputs/private_dao_tally_overlay.sample.json`

## Setup Artifacts

- `zk/setup/private_dao_vote_overlay_final.zkey`
- `zk/setup/private_dao_vote_overlay_vkey.json`
- `zk/setup/private_dao_delegation_overlay_final.zkey`
- `zk/setup/private_dao_delegation_overlay_vkey.json`
- `zk/setup/private_dao_tally_overlay_final.zkey`
- `zk/setup/private_dao_tally_overlay_vkey.json`
- `zk/setup/pot12_final.ptau`

## Proof Artifacts

- `zk/proofs/private_dao_vote_overlay.proof.json`
- `zk/proofs/private_dao_vote_overlay.public.json`
- `zk/proofs/private_dao_delegation_overlay.proof.json`
- `zk/proofs/private_dao_delegation_overlay.public.json`
- `zk/proofs/private_dao_tally_overlay.proof.json`
- `zk/proofs/private_dao_tally_overlay.public.json`

## Commands

```bash
npm run zk:build
npm run zk:prove:sample
npm run zk:verify:sample
npm run build:zk-registry
npm run verify:zk-registry
npm run verify:zk-consistency
npm run verify:zk-negative
```

Per-layer replay:

```bash
npm run zk:prove:vote
npm run zk:prove:delegation
npm run zk:prove:tally
```

## Verified Public Signals

### Vote overlay

```text
proposalId      = 1001
daoKey          = 500000000000000001
minWeight       = 100
commitment      = vote/salt/voter/proposal/dao commitment
nullifier       = voter/proposal/dao nullifier
eligibilityHash = voter/weight/dao eligibility binding
```

### Delegation overlay

```text
proposalId            = 1001
daoKey                = 500000000000000001
minWeight             = 100
delegationCommitment  = delegator/delegatee/proposal/dao/salt binding
delegationNullifier   = delegator/proposal/dao nullifier
delegateeBinding      = delegatee/proposal/dao binding
weightCommitment      = delegatee/weight/dao commitment
```

### Tally overlay

```text
proposalId           = 1001
daoKey               = 500000000000000001
commitment0..1       = two commitment-consistent revealed vote tuples
yesWeightTotal       = deterministic weighted yes tally
noWeightTotal        = deterministic weighted no tally
nullifierAccumulator = public accumulator over the revealed sample nullifiers
```

## Evidence Standard

The zk stack is only considered valid when:

- every circuit compiles
- each witness is generated from its circuit-specific sample input
- every proof is generated successfully
- every proof verifies against its exported verification key
- the generated zk registry matches the real artifact tree
- recomputed public signals match the stored public outputs
- tampered public signals fail verification
- tampered proof objects fail verification

This is intended to be a real proving path, not a placeholder research note.

The repository-level command that replays this end-to-end path is:

```bash
npm run zk:all
```
