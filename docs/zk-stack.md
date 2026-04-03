# ZK Stack

PrivateDAO now ships a layered zero-knowledge companion stack rather than a single proof-of-concept circuit.

The deployed governance protocol is unchanged. The zk stack is additive and evidence-backed.

## Layer 1 — Vote Validity Overlay

Circuit:

- `zk/circuits/private_dao_vote_overlay.circom`

What it proves:

- vote is boolean
- voter weight meets the configured threshold
- commitment is bound to:
  - `vote`
  - `salt`
  - `voterKey`
  - `proposalId`
  - `daoKey`
- proposal-scoped nullifier binding
- eligibility hash binding

## Layer 2 — Delegation Authorization Overlay

Circuit:

- `zk/circuits/private_dao_delegation_overlay.circom`

What it proves:

- delegation is active
- delegated weight meets the configured threshold
- delegation is bound to:
  - `delegatorKey`
  - `delegateeKey`
  - `proposalId`
  - `daoKey`
  - `salt`
- proposal-scoped delegation nullifier binding
- delegatee binding and delegated-weight commitment

## Layer 3 — Tally Integrity Overlay

Circuit:

- `zk/circuits/private_dao_tally_overlay.circom`

What it proves:

- two revealed vote tuples are internally well-formed
- each public commitment matches its private tuple
- weighted yes and no totals are deterministic
- a public nullifier accumulator binds the tally sample to proposal-scoped replay boundaries

## Groth16 Workflow

Each layer has:

- a compiled circuit under `zk/build/`
- a proving key and verification key under `zk/setup/`
- a sample input under `zk/inputs/`
- a sample proof and public signals under `zk/proofs/`

## Verification

```bash
npm run zk:build
npm run zk:prove:sample
npm run zk:verify:sample
```

Or replay the full stack end to end:

```bash
npm run zk:all
```

## Why This Matters

PrivateDAO no longer presents zero-knowledge as a single isolated add-on.

It now has a layered proving surface for:

- vote validity
- delegation authorization
- tally integrity

That strengthens the privacy and verification story without changing the deployed governance contracts.
