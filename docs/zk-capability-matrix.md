# ZK Capability Matrix

This matrix separates what the PrivateDAO zk stack does today from what remains future work.

The goal is reviewer clarity, not inflation.

## Capability Matrix

| Capability | Current Status | Verification Path | Boundary |
| --- | --- | --- | --- |
| Vote validity proof | Live off-chain | `npm run zk:prove:vote` and `npm run zk:verify:vote` | additive to current protocol |
| Delegation authorization proof | Live off-chain | `npm run zk:prove:delegation` and `npm run zk:verify:delegation` | additive to current protocol |
| Tally integrity proof | Live off-chain | `npm run zk:prove:tally` and `npm run zk:verify:tally` | bounded reveal sample, not a full hidden tally replacement |
| Public-signal consistency | Verified | `npm run verify:zk-consistency` | sample-output coherence check |
| Tampered public-signal rejection | Verified | `npm run verify:zk-negative` | off-chain verification safeguard |
| Tampered proof rejection | Verified | `npm run verify:zk-negative` | off-chain verification safeguard |
| ZK registry integrity | Verified | `npm run build:zk-registry` and `npm run verify:zk-registry` | machine-readable review layer |
| ZK provenance transcript | Verified | `npm run build:zk-transcript` and `npm run verify:zk-transcript` | reviewer-readable artifact traceability |
| ZK attestation | Verified | `npm run build:zk-attestation` and `npm run verify:zk-attestation` | machine-readable registry and transcript summary |
| ZK doc coherence | Verified | `npm run verify:zk-docs` | reviewer-surface discipline |
| ZK review-surface integration | Verified | `npm run verify:zk-surface` | docs, registry, signals, and tamper checks stay aligned |
| Repository-wide zk inclusion | Verified | `npm run verify:all` | zk is part of the broader proof and ops surface |
| On-chain verifier integration | Not implemented | not claimed | future protocol phase |
| Anonymous private treasury execution | Not implemented | not claimed | outside current scope |
| Full hidden on-chain tally replacement | Not implemented | not claimed | future zk phase |

## Reviewer Reading Guide

What is strong today:

- real Circom circuits
- real Groth16 proofs
- real setup artifacts
- replay-bounded public outputs
- consistency checks
- tamper rejection
- registry-backed zk review surface

What is intentionally not claimed:

- zk-enforced on-chain instructions
- private treasury execution
- anonymous mainnet governance execution
- full hidden tally replacement

## Canonical Commands

```bash
npm run zk:all
npm run verify:zk-registry
npm run verify:zk-transcript
npm run verify:zk-attestation
npm run verify:zk-docs
npm run verify:zk-consistency
npm run verify:zk-negative
npm run verify:zk-surface
npm run verify:all
```
