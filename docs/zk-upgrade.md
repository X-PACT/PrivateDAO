# ZK Upgrade Path

PrivateDAO now includes a real zero-knowledge companion layer that starts from the current protocol without changing the deployed program, PDA seeds, account layouts, or browser flows.

This layer is intentionally additive:

- the on-chain governance lifecycle remains `create -> commit -> reveal -> finalize -> execute`
- the zk circuit runs off-chain today
- the proof system demonstrates how vote eligibility and commitment binding can be proven without exposing private inputs directly
- future verifier integration can be added later as a protocol phase, not silently introduced into the current live system

## What Exists Today

- a real Circom circuit at `zk/circuits/private_dao_vote_overlay.circom`
- Groth16 setup and verification scripts
- a sample witness path that produces a real proof
- proof artifacts under `zk/proofs/`
- setup artifacts under `zk/setup/`

## What The Proof Asserts

The current zk overlay proves all of the following at once:

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

## Why This Is Non-Breaking

The live program still uses the existing commit-reveal flow. The zk layer does not replace current instructions and does not change any runtime assumptions for existing users or scripts.

Instead, it establishes a real proof system that can later support:

- zk voter eligibility
- zk commitment binding
- zk nullifier-style replay protection
- future verifier integration

## Commands

```bash
npm run zk:build
npm run zk:prove:sample
npm run zk:verify:sample
```
