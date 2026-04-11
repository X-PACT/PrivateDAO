# Multisig Setup Intake

This file is the execution intake for moving PrivateDAO from repository readiness to real production custody. It is deliberately strict: the repository can define the required shape, but the multisig is not considered created until the public addresses and transaction evidence are recorded.

Canonical machine-readable source:

- `docs/multisig-setup-intake.json`

## Required Target

- Network: `mainnet-beta`
- Threshold: `2-of-3`
- Timelock: `48+ hours`
- Custody target: program upgrade authority and production operational authorities
- Secret handling: no seed phrases, no private keys, no hot-wallet exports in Git

## Required Signer Slots

| Slot | Role | Public Key | Storage Class | Backup Procedure |
| --- | --- | --- | --- | --- |
| 1 | founder-operator | pending | cold-or-hardware | pending |
| 2 | independent-security-or-ops-signer | pending | cold-or-hardware | pending |
| 3 | recovery-or-governance-signer | pending | cold-or-hardware | pending |

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
