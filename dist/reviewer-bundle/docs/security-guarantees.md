# Security Guarantees

This document states the security properties the current repository is intended to guarantee on its implemented protocol surface.

## Guaranteed Properties

### Lifecycle cannot be bypassed

- commit is not accepted after the commit window closes
- reveal is not accepted before commit or outside the reveal window
- finalize is not accepted before reveal completion
- execute is not accepted before finalization or before timelock unlock

### Treasury cannot execute twice

- a successfully executed proposal cannot execute a second time
- duplicate treasury effects are rejected by lifecycle state

### Invalid reveal cannot mutate state

- wrong salt fails
- wrong vote payload fails
- wrong reveal signer fails
- late reveal fails
- invalid reveal does not increment reveal count or valid tally

### Mismatched account binding is rejected

- wrong DAO/proposal pairing fails
- wrong voter record/proposal pairing fails
- wrong delegation/proposal pairing fails
- wrong treasury/DAO pairing fails

### Replay execution cannot succeed

- repeated commit cannot create duplicate voting effect
- repeated reveal cannot create duplicate tally effect
- repeated finalize cannot re-finalize
- repeated execute cannot re-transfer funds

### Failed finalize does not advance lifecycle

- status remains unchanged
- execution unlock remains unchanged
- tallies remain unchanged

### Failed execute does not advance lifecycle

- `is_executed` remains false
- status remains unchanged
- treasury effect does not partially occur

### Treasury execution must be exact

- `SendSol` requires the configured recipient
- `SendToken` requires correct mint, ownership, and token account wiring
- valid-looking but semantically wrong treasury paths are rejected

## Scope Of These Guarantees

These guarantees apply to:

- the current on-chain program
- the currently implemented treasury paths
- the currently covered lifecycle and delegation flows

These guarantees do not claim:

- external audit completeness
- mainnet certification
- protection against off-chain metadata visibility such as transaction timing

## Evidence Pointers

- `docs/security-review.md`
- `docs/threat-model.md`
- `docs/security-coverage-map.md`
- `docs/failure-modes.md`
- `docs/replay-analysis.md`
- `tests/private-dao.ts`
- `tests/full-flow-test.ts`
