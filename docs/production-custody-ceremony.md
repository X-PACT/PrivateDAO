# Production Custody Ceremony

This document is the operator-facing ceremony for moving PrivateDAO from repository readiness into real production custody.

It does not claim the ceremony has already happened. It defines the exact evidence that must exist when it does happen.

## Goal

Close the `upgrade-authority-multisig` blocker with a real custody event that is reviewable after the fact.

## Minimum Inputs

- chosen Solana-native multisig implementation: `Squads Protocol`
- chosen multisig implementation
- network: `mainnet-beta`
- exactly 3 public signer keys
- threshold: `2-of-3`
- timelock configuration of at least `48` hours
- current authority holder for every authority surface being transferred
- final destination authority address

## Ceremony Scope

The custody ceremony must cover:

- program upgrade authority
- DAO authority
- treasury operator authority
- token administration authority, if any live authority remains
- emergency pause or containment ownership

## Required Sequence

1. Confirm the exact release commit and build artifact hash.
2. Confirm the signer roles and public keys out-of-band.
3. Create the Squads multisig and record the multisig address.
4. Configure the timelock and record the timelock transaction or configuration output.
5. Run a zero-value or low-risk rehearsal transaction.
6. Transfer the program upgrade authority.
7. Transfer DAO and treasury authorities.
8. Read back every authority state from chain.
9. Store the final evidence packet outside secret material.

## Required Evidence

- multisig address
- multisig creation signature
- signer role table
- timelock configuration signature or readout
- rehearsal signature
- program upgrade authority transfer signature
- DAO authority transfer signature
- treasury operator transfer signature
- post-transfer `solana program show` or equivalent authority readout
- post-transfer readout reference URL or repo-backed evidence path
- screenshots or exported approval history from the multisig client, when available

## Failure Conditions

Abort the ceremony if:

- signer identity cannot be confirmed
- the destination authority address is inconsistent across steps
- the timelock configuration is below `48` hours
- the post-transfer readout does not match the intended multisig
- any signer uses an undocumented hot wallet for production authority

## Repository Updates After The Ceremony

Once the real ceremony is complete, update:

- local operator input `docs/custody-evidence-intake.json`
- run `npm run apply:custody-evidence-intake`
- `docs/multisig-setup-intake.json`
- `docs/custody-observed-readouts.json`
- `docs/canonical-custody-proof.generated.json`
- `docs/canonical-custody-proof.generated.md`
- `docs/launch-ops-checklist.json`
- `docs/mainnet-blockers.json`
- `docs/trust-package.md`
- `docs/launch-trust-packet.generated.json`
- `docs/launch-trust-packet.generated.md`

## Honest Boundary

This repository can define the ceremony, verify its required fields, and point to the exact evidence that must be captured.

It cannot fabricate the multisig address, the real signer keys, or the authority transfer signatures themselves.
