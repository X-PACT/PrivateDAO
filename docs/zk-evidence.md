# ZK Evidence

This repository includes a real zk proving flow for the PrivateDAO vote overlay circuit.

## Circuit

- `zk/circuits/private_dao_vote_overlay.circom`

## Sample Input

- `zk/inputs/private_dao_vote_overlay.sample.json`

## Setup Artifacts

- `zk/setup/private_dao_vote_overlay_final.zkey`
- `zk/setup/private_dao_vote_overlay_vkey.json`
- `zk/setup/pot12_final.ptau`

## Proof Artifacts

- `zk/proofs/private_dao_vote_overlay.proof.json`
- `zk/proofs/private_dao_vote_overlay.public.json`

## Commands

```bash
npm run zk:build
npm run zk:prove:sample
npm run zk:verify:sample
```

## Verified Public Signals

The current sample proof verifies the following public tuple:

```text
proposalId      = 1001
daoKey          = 500000000000000001
minWeight       = 100
commitment      = 16115429784406986868472469925743244425564508207526982137045445058555141307942
nullifier       = 20594767627702624343192248933054080961988768773240591871417120423903645627123
eligibilityHash = 4577846992959871234224907804216108488563806233231347939839278844706105995776
```

These values are stored in:

- `zk/proofs/private_dao_vote_overlay.public.json`

## Evidence Standard

The zk layer is only considered valid when:

- the circuit compiles
- the witness is generated from the sample input
- the proof is generated successfully
- the proof verifies against the exported verification key

This is intended to be a real proving path, not a placeholder research note.

The repository-level command that replays this end-to-end path is:

```bash
npm run zk:all
```
