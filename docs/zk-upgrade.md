# ZK Upgrade Path

PrivateDAO now includes a real zero-knowledge companion stack that starts from the current protocol without changing the deployed program, PDA seeds, account layouts, or browser flows.

This layer is intentionally additive:

- the on-chain governance lifecycle remains `create -> commit -> reveal -> finalize -> execute`
- the zk circuit runs off-chain today
- the proof system demonstrates how vote eligibility and commitment binding can be proven without exposing private inputs directly
- future verifier integration can be added later as a protocol phase, not silently introduced into the current live system

## What Exists Today

- a real Circom circuit at `zk/circuits/private_dao_vote_overlay.circom`
- a real Circom circuit at `zk/circuits/private_dao_delegation_overlay.circom`
- a real Circom circuit at `zk/circuits/private_dao_tally_overlay.circom`
- Groth16 setup and verification scripts
- sample witness paths that produce real proofs
- proof artifacts under `zk/proofs/`
- setup artifacts under `zk/setup/`
- a layered ZK stack note at `docs/zk-stack.md`

## What The Proofs Assert

The current vote overlay proves all of the following at once:

- the vote is boolean
- the voter weight is at least the configured threshold
- the public commitment matches the private tuple
  - `vote`
  - `salt`
  - `voterKey`
  - `proposalId`
  - `daoKey`
- the nullifier is bound to:
  - `voterKey`
  - `proposalId`
  - `daoKey`
- the public eligibility hash is bound to:
  - `voterKey`
  - `weight`
  - `daoKey`

The delegation overlay proves:

- delegated voting is active
- delegated weight meets the configured threshold
- delegation is bound to:
  - `delegatorKey`
  - `delegateeKey`
  - `proposalId`
  - `daoKey`
  - `salt`
- proposal-scoped delegation nullifier binding

The tally overlay proves:

- two revealed vote tuples are boolean and commitment-consistent
- weighted yes and no totals are deterministic
- a nullifier accumulator binds the revealed sample to proposal-scoped replay boundaries

## Why This Is Non-Breaking

The live program still uses the existing commit-reveal flow. The zk layer does not replace current instructions and does not change any runtime assumptions for existing users or scripts.

Instead, it establishes a real proof system that can later support:

- zk voter eligibility
- zk commitment binding
- zk delegation authorization
- zk tally integrity
- zk nullifier-style replay protection
- future verifier integration

## Commands

```bash
npm run zk:build
npm run zk:prove:sample
npm run zk:verify:sample
```

Per-layer proof replay:

```bash
npm run zk:prove:vote
npm run zk:prove:delegation
npm run zk:prove:tally
```
