# ZK Threat Extension

This note extends the main threat model for the additive PrivateDAO zk stack.

The deployed governance program is unchanged. These threats apply to the off-chain Circom, Groth16, registry, and reviewer-verification layer that now accompanies the live protocol.

## Scope

Covered zk surfaces:

- `zk/circuits/private_dao_vote_overlay.circom`
- `zk/circuits/private_dao_delegation_overlay.circom`
- `zk/circuits/private_dao_tally_overlay.circom`
- setup artifacts under `zk/setup/`
- proof and public-signal artifacts under `zk/proofs/`
- zk registry under `docs/zk-registry.generated.json`

## Additional Threat Classes

### Circuit / verifier drift

Risk:

- a proof verifies, but the reviewer is looking at stale or mismatched circuit artifacts

Mitigation:

- `docs/zk-registry.generated.json` binds each layer to its source, sample input, proof, public signals, proving key, and verification key
- `npm run verify:zk-registry` rejects missing or mismatched registry paths and signal counts

### Public-signal tampering

Risk:

- a proof package is presented with altered public outputs to misrepresent what was actually proven

Mitigation:

- `npm run verify:zk-negative` mutates public outputs and confirms verification rejection
- `npm run verify:zk-consistency` recomputes the sample public signals through SDK helpers and checks they match the stored outputs

### Proof-object tampering

Risk:

- a proof object is modified while the surrounding review package stays intact

Mitigation:

- `npm run verify:zk-negative` also mutates proof coordinates and requires rejection
- the cryptographic manifest makes proof drift tamper-evident at the repository level

### Registry / document drift

Risk:

- zk docs, generated registry, and reviewer artifacts drift apart over time

Mitigation:

- `npm run build:zk-registry`
- `npm run verify:zk-registry`
- `npm run verify:generated-artifacts`
- `npm run verify:review-surface`

### Setup artifact substitution

Risk:

- the wrong verification key or proving key is paired with a circuit or proof package

Mitigation:

- the registry records the exact setup paths per circuit
- the cryptographic manifest fingerprints the verification keys
- zk verification commands use the exported verification keys directly from the tracked artifact tree

### Sample witness misrepresentation

Risk:

- reviewers are shown proofs without a clear mapping back to witness assumptions

Mitigation:

- each circuit has a committed sample input under `zk/inputs/`
- `npm run zk:all` rebuilds the full proving path from those sample inputs
- `docs/zk-evidence.md` and `docs/zk-stack.md` map each layer to its witness and public signals

## Residual ZK Risks

The current zk stack remains intentionally bounded:

- it is off-chain today and not yet an on-chain verifier integration
- Groth16 trusted setup assumptions apply
- the tally layer currently proves a bounded reveal sample, not a full hidden on-chain tally replacement
- zk does not make treasury execution private
- zk does not remove metadata leakage from transaction timing or wallet activity

## Reviewer Verification Path

The minimum zk review path is:

```bash
npm run build:zk-registry
npm run verify:zk-registry
npm run verify:zk-consistency
npm run verify:zk-negative
npm run zk:all
```

This is intended to make the zk surface reviewer-verifiable instead of claim-based.
