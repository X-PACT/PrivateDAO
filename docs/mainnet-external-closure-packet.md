# Mainnet External Closure Packet

Last updated: 2026-04-12

This packet is the exact external-only closure path for PrivateDAO after local engineering checks have passed.

Current honest state:

- local product checks: ready
- local build + core suite: ready
- public repo + reviewer surfaces: ready
- external production closure: still pending

This packet does not claim that mainnet launch is complete. It isolates the remaining work that requires custody signers, token update authority, or external audit/ceremony execution.

## 1. `PDAO live` metadata cutover

Status:

- complete on Devnet

Closed by:

- update authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- update transaction:
  - `Cou2ws3HJspXJpgAL6HyMTCJZ72aTXn88Ks9Rn3jrD4BUvSQxFV4gLgtLkdGdzHsH3gnpRhRj4yyGSq2r8HdFiD`
- updated URI:
  - `https://privatedao.org/assets/pdao-token.json`

Verification:

- `npm run verify:pdao-live` now passes

Boundary:

- token metadata cutover is closed
- this does not close production custody, multisig, or mainnet ceremony work

## 2. Custody And Authority Closure

These remain external because they require real signers and final production custody decisions.

What is already closed below production:

- a live Devnet rehearsal multisig exists:
  - address: `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
  - threshold: `2-of-3`
  - creation signature: `4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp`
- canonical rehearsal packet:
  - `docs/devnet-rehearsal-multisig.md`

What remains open:

- production multisig selection or creation
- production signer custody setup
- authority-transfer execution against the production custody target
- post-transfer readouts and references
- production-style closure plan adoption from the live rehearsal source

Required closure items:

1. select and record production multisig implementation
2. create production multisig
3. record multisig address
4. record all 3 signer public keys
5. record 2-of-3 threshold
6. record rehearsal signature
7. configure and record 48+ hour timelock
8. execute authority transfers for:
   - program upgrade authority
   - DAO authority / policy admin
   - treasury operator authority
   - token administration if any authority remains live
9. record post-transfer readouts and reference URLs

Canonical evidence files:

- `docs/multisig-setup-intake.json`
- `docs/multisig-setup-intake.md`
- `docs/production-style-custody-closure-plan.json`
- `docs/production-style-custody-closure-plan.md`
- `docs/authority-transfer-runbook.md`
- `docs/canonical-custody-proof.generated.md`
- `docs/custody-observed-readouts.json`

Completion tests:

- `npm run verify:multisig-intake`
- `npm run verify:mainnet-blockers`

## 3. Deploy-Only Mainnet Funding Requirement

Actual current program artifact:

- `target/deploy/private_dao.so`
- size: `1,411,968 bytes`

Estimated upgradeable deploy rent:

- `ProgramData account`: `9.82850136 SOL`
- `Program account`: `0.00114144 SOL`
- persistent locked total: `9.82964280 SOL`

Operational wallet balance recommended at deploy time:

- `20 SOL`

Rationale:

- covers the temporary upload buffer
- covers final locked rent
- leaves room for fees and retries

This number is for deploy only. It does not include audit, multisig operations, or production monitoring work.

## 4. Remaining External Mainnet Gates

Canonical blocker file:

- `docs/mainnet-blockers.md`

Open blockers still tracked there:

1. external audit completion
2. upgrade authority multisig
3. production monitoring alerts closure
4. real-device wallet runtime closure
5. MagicBlock / REFHE source receipts
6. mainnet cutover ceremony

## 5. Exact Finish Line

The statement below becomes professionally valid only after the actions above are complete:

`The only remaining step is funding the mainnet deploy wallet.`

Until then, the honest status is:

`Local engineering is ready. PDAO metadata cutover is closed. External custody, authority, and release-ceremony closure are still required.`
