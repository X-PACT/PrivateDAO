# Squads Devnet Multisig Ceremony

This is the shortest honest path for closing the `upgrade-authority-multisig` blocker with real custody evidence.

It is intentionally Devnet-first. The product already works on Devnet. This ceremony adds institutional proof, not basic functionality.

## Current Facts

- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- currently observed devnet upgrade authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- selected multisig implementation: `Squads Protocol`
- existing devnet rehearsal multisig: `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
- existing devnet rehearsal creation signature: `4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp`

## Required Ceremony Shape

- network: `devnet`
- signers: `3`
- threshold: `2-of-3`
- timelock: `48+ hours`
- client: `Squads Protocol`

## Candidate Signer Roster

| Slot | Role | Wallet | Candidate public key |
| --- | --- | --- | --- |
| 1 | founder-operator | Solflare | `73EzhBNNdM2ZV3LzMxyNZ5FwGiZCZJrbZTHyRxhTsdq9` |
| 2 | independent-security-or-ops-signer | Phantom | `BBBPcpUnnBi3CWUhcv6vLTqaY9pugAGuhgw2Axjpvcr2` |
| 3 | recovery-or-governance-signer | Backpack | `2KpA69UB55tfWUSkKj5j7Tvebd3eG22hEs9hjXUq7pf5` |

These public keys may only be promoted if the signer posture is documented and the repository never stores seed phrases or private keys.

## Exact Operator Sequence

1. Open `https://app.squads.so/squads?cluster=devnet`
2. Connect the current authority wallet or the designated signer wallet.
3. Create a new Squads multisig.
4. Enter the `3` signer public keys.
5. Set threshold to `2`.
6. Configure a timelock of at least `48` hours.
7. Record:
   - multisig address
   - creation transaction signature
   - timelock configuration transaction signature
   - approval history screenshot if available
8. Submit a low-risk rehearsal transaction inside Squads and record its signature.
9. Transfer the program upgrade authority from `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD` to the new multisig.
10. Record:
   - transfer transaction signature
   - `solana program show 5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx --url devnet`
   - explorer links
11. If DAO and treasury authorities are also transferred, record those signatures and post-transfer readouts in the same intake.
12. Save the captured fields into `docs/custody-evidence-intake.json`.
13. Run:

```bash
npm run apply:custody-evidence-intake
```

## Minimum Evidence To Capture

- Squads multisig address
- creation signature
- timelock configuration signature
- rehearsal signature
- signer public keys
- program upgrade authority transfer signature
- post-transfer `solana program show` readout
- explorer links or repo-backed screenshots

## Honest Boundary

Creating the multisig is not the same as completing authority transfer.

Authority transfer is not complete until the destination authority, transfer signature, and post-transfer readout are all recorded.
