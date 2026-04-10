# ZK Capability Matrix

This matrix separates what the PrivateDAO zk stack does today from what remains future work.

The goal is reviewer clarity, not inflation.

## Capability Matrix

| Layer | What It Proves | Live Now | Verification Path | What Is Not Claimed | Boundary |
| --- | --- | --- | --- | --- | --- |
| Vote validity proof | A committed vote can be checked against a bounded public signal set | Live off-chain | `npm run zk:prove:vote` and `npm run zk:verify:vote` | no verifier CPI on Solana | additive to current protocol |
| Delegation authorization proof | Delegated authority binds to the proposal-scoped delegation intent | Live off-chain | `npm run zk:prove:delegation` and `npm run zk:verify:delegation` | no production-grade delegated privacy path on-chain | additive to current protocol |
| Tally integrity proof | A bounded tally sample is coherent with its public signals | Live off-chain | `npm run zk:prove:tally` and `npm run zk:verify:tally` | not a full hidden tally replacement | bounded reveal sample, not a full hidden tally replacement |
| Public-signal consistency | Generated outputs stay aligned with the expected public inputs | Verified | `npm run verify:zk-consistency` | not a cryptographic verifier contract | sample-output coherence check |
| Tampered public-signal rejection | Modified public signals fail the verifier path | Verified | `npm run verify:zk-negative` | not an on-chain slash or enforcement path | off-chain verification safeguard |
| Tampered proof rejection | Modified proof objects fail the verifier path | Verified | `npm run verify:zk-negative` | not an on-chain slash or enforcement path | off-chain verification safeguard |
| Proposal-bound proof anchors | Proof-related state can be anchored to proposal context for reviewability | Live and anchored | `docs/frontier-integrations.generated.md`, `docs/test-wallet-live-proof-v3.generated.md` | not a complete on-chain verifier CPI | reviewer-facing on-chain anchoring |
| ZK registry integrity | The repository keeps a machine-readable map of zk artifacts and their roles | Verified | `npm run build:zk-registry` and `npm run verify:zk-registry` | not a wallet execution guarantee | machine-readable review layer |
| ZK provenance transcript | Setup, circuit, and artifact lineage remain traceable | Verified | `npm run build:zk-transcript` and `npm run verify:zk-transcript` | not an external audit opinion | reviewer-readable artifact traceability |
| ZK attestation | Registry, transcript, and verification commands stay tied together | Verified | `npm run build:zk-attestation` and `npm run verify:zk-attestation` | not a production launch approval | machine-readable registry and transcript summary |
| ZK doc coherence | The zk docs and artifact surfaces stay consistent | Verified | `npm run verify:zk-docs` | not protocol enforcement | reviewer-surface discipline |
| ZK review-surface integration | ZK links remain connected to proof, audit, and operations surfaces | Verified | `npm run verify:zk-surface` and `npm run verify:all` | not a claim that ZK is the only review path | docs, registry, signals, and tamper checks stay aligned |
| `zk_enforced` finalize path | A stricter proposal path can require stronger receipts and review posture | Live but bounded | `docs/zk-verifier-strategy.md`, `docs/governance-hardening-v3.md`, `docs/test-wallet-live-proof-v3.generated.md` | not the dominant production recommendation yet | stronger path, still additive and truth-aligned |
| On-chain verifier integration | Solana program verifies cryptographic zk proofs directly inside CPI/instruction flow | Not implemented | not claimed | no on-chain verifier integration yet | future protocol phase |
| Anonymous private treasury execution | Treasury execution remains fully private and anonymous end-to-end | Not implemented | not claimed | no anonymous private treasury execution | outside current scope |
| Full hidden on-chain tally replacement | Tally stays fully hidden and enforced on-chain rather than reviewer-bounded | Not implemented | not claimed | no full hidden tally replacement | future zk phase |

## Our Reading Of The Matrix

This is the PrivateDAO-specific reading that matters:

- ZK is real inside the repository and reviewer stack.
- ZK is already tied to proof packets, runtime evidence, and proposal-bound anchors.
- ZK is not being presented here as a fake "fully trustless everything" system.
- `zk_enforced` is useful and live as a stricter path, but it is not yet described as the universal production default.

## Reviewer Shortcut

If you want the shortest high-signal path for this matrix:

1. Read `docs/zk-layer.md`
2. Read `docs/zk-capability-matrix.md`
3. Read `docs/zk-provenance.md`
4. Open `docs/zk-transcript.generated.md`
5. Open `docs/zk-attestation.generated.json`
6. Open `docs/test-wallet-live-proof-v3.generated.md`
7. Open `docs/frontier-integrations.generated.md`

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
