# Multisig Setup Intake

This file is the execution intake for moving PrivateDAO from repository readiness to real production custody. It is deliberately strict: the repository can define the required shape, but the multisig is not considered created until the public addresses and transaction evidence are recorded.

Canonical machine-readable source:

- `docs/multisig-setup-intake.json`

Strict operator ingestion path:

- Build the packet in `/custody`
- Save the downloaded JSON as local operator input: `docs/custody-evidence-intake.json`
- Apply and rebuild all linked proof artifacts with:

```bash
npm run apply:custody-evidence-intake
```

## Required Target

- Network: `mainnet-beta`
- Threshold: `2-of-3`
- Timelock: `48+ hours`
- Custody target: program upgrade authority and production operational authorities
- Secret handling: no seed phrases, no private keys, no hot-wallet exports in Git

## Live Rehearsal Source

- Devnet rehearsal multisig:
  - address: `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
  - creation signature: `4KSyTYQTzeNpBDWou7GFLmvUpAhLgmNKkNdd4PZqndLpCWmUnArffYRQUwe6zrTmQD5uCbBfBR6pakf9Gz8dviRp`
- Rehearsal proved:
  - the `2-of-3` model is live
  - the 3-role signer shape is workable
  - the production closure can keep the same conceptual structure with minimal change

This rehearsal is real evidence. It is not itself the production custody closure.

## Required Signer Slots

| Slot | Role | Public Key | Storage Class | Backup Procedure |
| --- | --- | --- | --- | --- |
| 1 | founder-operator | pending | cold-or-hardware | pending |
| 2 | independent-security-or-ops-signer | pending | cold-or-hardware | pending |
| 3 | recovery-or-governance-signer | pending | cold-or-hardware | pending |

## Candidate Minimal-Delta Production Model

These are the current rehearsal wallets and may be promoted only if they are moved into production-safe custody posture.

| Slot | Role | Rehearsal Wallet | Candidate Public Key | Promotion Condition |
| --- | --- | --- | --- | --- |
| 1 | founder-operator | Solflare | `73EzhBNNdM2ZV3LzMxyNZ5FwGiZCZJrbZTHyRxhTsdq9` | moved to cold-or-hardware custody and retained as the operational founder signer |
| 2 | independent-security-or-ops-signer | Phantom | `BBBPcpUnnBi3CWUhcv6vLTqaY9pugAGuhgw2Axjpvcr2` | signer is operationally independent and approval path is documented |
| 3 | recovery-or-governance-signer | Backpack | `2KpA69UB55tfWUSkKj5j7Tvebd3eG22hEs9hjXUq7pf5` | recovery/governance path remains separate and backup path is documented |

## Required Evidence Before Completion

- multisig implementation selection
- multisig address
- 3 distinct public signer keys
- threshold set to exactly `2`
- timelock configured to at least `48` hours
- multisig creation signature
- zero-value or low-risk rehearsal signature
- program upgrade authority transfer signature
- DAO authority transfer signature, if applicable
- treasury operator authority transfer signature, if applicable
- post-transfer `solana program show` or equivalent authority readout
- post-transfer readout reference URL or repo-backed evidence path
- backup and signer replacement procedure retained outside secret material

## Forbidden Evidence

- private keys
- seed phrases
- unencrypted keypair JSON
- screenshots containing secrets
- hot-wallet exports

## Current Status

`pending-external`

This is correct until real public signer keys, multisig address, timelock configuration, transfer signatures, and authority readouts exist.

Canonical reviewer-safe packet:

- `docs/canonical-custody-proof.generated.md`
- `docs/custody-observed-readouts.json`

## Verification

```bash
npm run verify:multisig-intake
```
