# ZK Provenance

The PrivateDAO zk stack is intended to be reviewable as a concrete artifact chain, not as a loose collection of circuit files.

## Provenance Scope

The provenance surface covers:

- Circom circuit sources
- sample inputs
- witness artifacts
- Groth16 proving keys
- Groth16 verification keys
- generated proofs
- generated public signals
- the shared ptau artifact used by the current setup flow

## Why Provenance Matters

The security question is not only whether a proof verifies.

Reviewers also need to know:

- which setup artifacts were used
- which proof files correspond to which circuit layer
- whether tracked hashes match the current repository contents
- whether replay commands and review artifacts remain aligned over time

That is why the zk package now includes:

- `docs/zk-registry.generated.json`
- `docs/zk-transcript.generated.md`

## Current Provenance Model

The current stack is built around:

- proving system: `Groth16`
- shared setup artifact: `zk/setup/pot12_final.ptau`
- per-layer proving and verification keys
- deterministic reviewer commands per layer

## Replay Path

```bash
npm run build:zk-registry
npm run build:zk-transcript
npm run verify:zk-registry
npm run verify:zk-transcript
npm run verify:zk-docs
npm run verify:zk-consistency
npm run verify:zk-negative
npm run zk:all
```

## Reviewer Conclusion

If the registry, transcript, and verification commands all pass, reviewers can conclude that the tracked zk stack is not only present, but provenance-linked across source, setup, proof, and documentation layers.

## Honest Boundary

This provenance layer improves artifact traceability and reviewer trust.

It does not by itself mean:

- trusted setup concerns disappear
- on-chain verification is already deployed
- the current Solana program has been rewritten around zk proofs
