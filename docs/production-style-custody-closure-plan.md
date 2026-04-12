# Production-Style Custody Closure Plan

This plan converts the live Devnet rehearsal multisig into a production-style closure model with the smallest possible conceptual delta.

It is intentionally not the production custody record itself.

## What Stays The Same

- signer count: `3`
- threshold: `2-of-3`
- custody model: multisig-first
- authority-transfer targets:
  - `program-upgrade-authority`
  - `dao-authority`
  - `treasury-operator-authority`
- minimum timelock target: `48+ hours`

## What Changes For Production

- network changes from `devnet` to `mainnet-beta`
- a new production multisig address must be created on `mainnet-beta`
- signer custody must be upgraded from browser-wallet rehearsal posture to `cold-or-hardware`
- authority-transfer signatures and post-transfer readouts must be recorded

## Rehearsal Source

- rehearsal multisig address:
  - `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
- rehearsal creation signature:
  - `4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp`

This rehearsal proves that the signer model is live and technically workable. It does not replace production custody.

## Candidate Production Signer Model

| Slot | Role | Current Rehearsal Wallet | Public Key | Keep For Production Only If |
| --- | --- | --- | --- | --- |
| 1 | founder-operator | Solflare | `73EzhBNNdM2ZV3LzMxyNZ5FwGiZCZJrbZTHyRxhTsdq9` | moved to cold/hardware custody and remains operational founder signer |
| 2 | independent-security-or-ops-signer | Phantom | `BBBPcpUnnBi3CWUhcv6vLTqaY9pugAGuhgw2Axjpvcr2` | signer is operationally independent and approval path is documented |
| 3 | recovery-or-governance-signer | Backpack | `2KpA69UB55tfWUSkKj5j7Tvebd3eG22hEs9hjXUq7pf5` | recovery/governance role remains separate and backup path is documented |

## Minimal-Difference Production Path

1. keep the `2-of-3` model unchanged
2. keep the same role model unchanged
3. create a new `mainnet-beta` multisig address
4. keep these exact signer public keys only if they satisfy production custody rules
5. otherwise replace only the signer public keys while keeping the same slot and role model
6. configure and record the `48+ hour` timelock
7. execute:
   - program upgrade authority transfer
   - DAO authority transfer
   - treasury operator authority transfer
8. record:
   - multisig creation signature
   - rehearsal signature
   - timelock configuration signature
   - transfer signatures
   - post-transfer readouts

## Honest Boundary

This plan is the closest production-shaped continuation of the live Devnet rehearsal.

It does **not** mean:

- the rehearsal multisig address becomes the production multisig address
- browser wallets are automatically acceptable for production custody
- production authority transfer is already closed

## Related Files

- `docs/devnet-rehearsal-multisig.md`
- `docs/devnet-rehearsal-multisig.json`
- `docs/multisig-setup-intake.md`
- `docs/multisig-setup-intake.json`
- `docs/mainnet-external-closure-packet.md`
