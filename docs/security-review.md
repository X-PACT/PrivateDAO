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
- mainnet cutover readiness checks

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
