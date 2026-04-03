# Security Review Surface

PrivateDAO now includes a reviewer-visible hardening layer focused on realistic Solana governance misuse, not just happy-path coverage.

## Scope covered in the repository

- lifecycle bypass rejection
- commit-reveal invalid reveal paths
- replay and duplicate execution prevention
- signer and authority misuse rejection
- PDA and account substitution rejection
- treasury miswiring rejection
- delegation misuse guards across product surfaces
- finalize and execute account-binding rejection
- timing boundary and lifecycle invariant checks
- mainnet cutover readiness checks
- non-breaking zk overlay proof generation and verification

## Reviewer-first proof points

- Core program: `programs/private-dao/src/lib.rs`
- Core behavior tests: `tests/private-dao.ts`
- End-to-end lifecycle and treasury tests: `tests/full-flow-test.ts`
- Demo walkthrough: `tests/demo.ts`
- Mainnet gate: `scripts/check-mainnet-readiness.sh`
- Judge audit note: `docs/judge-technical-audit.md`
- Mainnet readiness note: `docs/mainnet-readiness.md`

## Hardening highlights

### Lifecycle and replay safety

- proposals cannot execute before finalize
- proposals cannot execute before timelock unlock
- proposals cannot execute twice
- invalid proposal states are rejected for finalize and execute
- failed execution paths leave execution state unmutated

### Commit-reveal safety

- reveal before commit is rejected
- reveal with mismatched salt or mismatched vote payload is rejected
- reveal by the wrong signer is rejected
- reveal outside the allowed window is rejected
- voter records remain proposal-bound and cannot be reused across proposals

### Treasury and account wiring safety

- `SendSol` enforces intended recipient wiring
- `SendToken` enforces:
  - expected mint alignment
  - treasury token source owned by the treasury PDA
  - destination owner matches the configured recipient
  - source and destination are not duplicated
- failed treasury execution attempts do not partially mark proposals as executed

### Signer and delegation safety

- self-delegation is rejected
- unauthorized delegated voting is rejected
- delegated commits cannot consume a delegation PDA from another proposal
- operator scripts and browser-native flows now block direct-commit and delegation overlap for the same proposal without changing the deployed protocol interface

### Finalize and execute binding safety

- finalize rejects mismatched `dao` / `proposal` pairings
- execute rejects treasury PDAs that belong to another DAO even when the treasury account is valid and funded
- failed finalize and execute attempts leave proposal state unchanged
- permissionless finalize and execute remain supported, but only when signer and account bindings are exact

### Timing and invariant safety

- commit still works immediately before voting end and is rejected once the commit window is closed
- reveal opens exactly when the voting window ends and not before
- finalize opens at reveal end and not before
- execute opens at timelock unlock and not before
- failed finalize and execute attempts do not advance proposal lifecycle fields
- `revealed => committed` is asserted directly through voter records
- `reveal_count <= commit_count` is asserted directly
- successful execute is the only tested path that sets `is_executed = true`

## Honest current boundary

One protocol-level boundary remains intentionally documented instead of hidden:

- direct-commit versus delegation mutual exclusion is guarded at the operator and frontend layer today
- enforcing that relationship on-chain without widening instruction accounts would require a public interface change, which this hardening pass intentionally avoids while the project is under live review

## Mainnet transition stance

The repository is stronger and safer than before, but it is still honest about the last mile:

- mainnet transition is operationally reachable
- external audit completeness is not claimed
- production monitoring and release controls still matter
- Android runtime verification still requires a real Android SDK/device environment

This note exists so reviewers can verify that the hardening work is concrete, visible, and bounded by what the current protocol actually supports.

## Formal Security Reasoning Layer

The repository now includes a formal audit-simulation layer:

- Threat model: `docs/threat-model.md`
- Security coverage map: `docs/security-coverage-map.md`
- Failure modes: `docs/failure-modes.md`
- Replay analysis: `docs/replay-analysis.md`

## Failure Mode Summary

The failure-mode review focuses on realistic misuse:

- mismatched treasury execution
- wrong DAO context for finalize
- wrong voter or keeper reveal
- cross-proposal delegation misuse
- malformed but valid-looking token accounts
- invalid PDA substitution
- partial execution attempts

The expected safe outcome in each case is rejection without unintended state advancement or duplicate treasury effects.

## Replay Summary

Replay analysis now documents:

- repeated commit attempts
- repeated reveal attempts
- repeated finalize attempts
- repeated execute attempts
- reordered-account replay attempts
- altered-signer replay attempts
- cross-proposal state reuse

Current reasoning supports that no replay path in tested behavior produces duplicate execution effects.

## ZK Overlay Summary

The repository now includes a real zero-knowledge companion layer that does not change the deployed protocol surface:

- Circom circuit: `zk/circuits/private_dao_vote_overlay.circom`
- Groth16 setup and verification path
- sample witness generation
- proof generation
- proof verification through `npm run zk:all`
- explicit zk layer framing: `docs/zk-layer.md`

The current zk layer proves:

- vote form validity
- minimum-weight eligibility
- proposal-scoped commitment binding
- proposal-scoped nullifier binding

This is intentionally additive. It strengthens the protocol's future privacy path without changing current instruction interfaces or deployed assumptions.

## Cryptographic Integrity Summary

The repository now also includes a sha256-based artifact integrity layer over the highest-signal zk and review artifacts:

- generated manifest: `docs/cryptographic-manifest.generated.json`
- integrity note: `docs/cryptographic-integrity.md`
- build command: `npm run build:cryptographic-manifest`
- verification command: `npm run verify:cryptographic-manifest`

The current integrity manifest covers:

- zk circuit source
- zk verification key
- zk sample proof and public inputs
- proof registry
- devnet release manifest
- live proof note
- submission registry

This does not replace protocol security. It reduces silent drift and makes reviewer-facing evidence tamper-evident.

## Remaining Real-World Risks

The audit-simulation layer does not hide residual realities:

- direct-commit versus delegation mutual exclusion remains operationally guarded rather than fully enforced on-chain
- off-chain timing metadata is not hidden by commit-reveal
- the zk overlay is off-chain today and is not yet an on-chain verifier integration
- local validator startup remains environment-sensitive in this shell
- external audit completeness is still not claimed
- `CustomCPI` remains intentionally event-only rather than arbitrary on-chain execution

## Confidence Level

Current confidence level: **high for tested lifecycle and treasury safety on the implemented protocol surface**, with the remaining limits concentrated in:

- operational enforcement boundaries
- environment-dependent integration execution
- external review depth beyond repository-contained reasoning and tests
