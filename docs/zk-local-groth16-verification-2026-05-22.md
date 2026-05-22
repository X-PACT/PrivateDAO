# ZK Local Groth16 Verification - 2026-05-22

## Purpose

This packet records a fresh local verification pass for the PrivateDAO ZK companion circuits. It is intended for reviewers who need to distinguish verified ZK proof artifacts from marketing language.

## Verified Scope

- Vote overlay circuit: `zk/circuits/private_dao_vote_overlay.circom`
- Delegation overlay circuit: `zk/circuits/private_dao_delegation_overlay.circom`
- Tally overlay circuit: `zk/circuits/private_dao_tally_overlay.circom`
- Verification keys: `zk/setup/*_vkey.json`
- Proof/public inputs: `zk/proofs/*.proof.json` and `zk/proofs/*.public.json`

## Command

```bash
npm run zk:verify:sample
```

Equivalent direct script:

```bash
bash scripts/zk/verify-sample.sh
```

## Result

Executed on 2026-05-22 after the Testnet custody hardening commit:

```text
[zk] verifying proof: private_dao_vote_overlay
[INFO] snarkJS: OK!
[zk] verifying proof: private_dao_delegation_overlay
[INFO] snarkJS: OK!
[zk] verifying proof: private_dao_tally_overlay
[INFO] snarkJS: OK!
[zk] verification passed
```

## What The Vote Circuit Proves

The current vote overlay circuit enforces:

- `vote` is binary: `0` or `1`
- voter `weight` is at least `minWeight`
- `commitment = Poseidon(vote, salt, voterKey, proposalId, daoKey)`
- `nullifier = Poseidon(voterKey, proposalId, daoKey)`
- `eligibilityHash = Poseidon(voterKey, weight, daoKey)`

This provides a real Groth16 companion proof path for vote validity, nullifier continuity, and eligibility binding.

## Boundary

This is a local Groth16 verification packet for shipped circuit artifacts. It does not claim that Solana on-chain verifier CPI enforcement is complete. The stricter production lane remains tracked separately by:

- `docs/zk/enforced-runtime-evidence.md`
- `docs/zk/external-closure.generated.md`
- `docs/zk-capability-matrix.md`

## Reviewer Interpretation

Reviewers can verify that PrivateDAO has real ZK circuits, keys, proofs, public inputs, and a repeatable proof verification command. Runtime wallet captures and on-chain verifier enforcement remain distinct closure gates and should not be conflated with this local proof-verification pass.
