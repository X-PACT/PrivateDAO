# Devnet Rehearsal Multisig

This packet records the live Devnet rehearsal multisig created to validate a `2-of-3` custody posture using the currently connected browser-wallet signer set.

It is intentionally bounded:

- this is a Devnet rehearsal artifact
- it is not the production multisig
- it does not close mainnet custody, authority transfer, or release ceremony work

## Rehearsal Multisig

- implementation: `spl-token-2022-multisig`
- network: `devnet`
- multisig address: `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
- threshold: `2-of-3`
- creation signature: `4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp`
- explorer:
  - https://explorer.solana.com/tx/4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp?cluster=devnet

## Signer Set

| Slot | Wallet | Public Key |
| --- | --- | --- |
| 1 | Solflare | `73EzhBNNdM2ZV3LzMxyNZ5FwGiZCZJrbZTHyRxhTsdq9` |
| 2 | Phantom | `BBBPcpUnnBi3CWUhcv6vLTqaY9pugAGuhgw2Axjpvcr2` |
| 3 | Backpack | `2KpA69UB55tfWUSkKj5j7Tvebd3eG22hEs9hjXUq7pf5` |

## What This Closes

- a real `2-of-3` multisig account now exists on Devnet
- the browser-wallet signer set is recorded and machine-verifiable
- custody rehearsal is no longer hypothetical

## What This Does Not Close

- mainnet multisig intake
- production upgrade-authority transfer
- DAO authority transfer
- treasury operator authority transfer
- rehearsal execution requiring 2 signer approvals
- production custody ceremony

## Verification

```bash
npm run verify:devnet-rehearsal-multisig
```
