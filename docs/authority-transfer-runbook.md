# Authority Transfer Runbook

This runbook is the concrete production custody sequence for PrivateDAO. It is deliberately written as a no-fake checklist: the repository can verify that the plan exists, but the authority transfer is not complete until the resulting addresses, signatures, and explorer links are recorded.

## Scope

Covered authority surfaces:

- program upgrade authority
- DAO authority and policy administration
- treasury operator path
- token administration, if any authority remains live
- emergency pause, veto, or containment operators

## Non-Negotiable Rules

- Do not transfer production authority to an unreviewed hot wallet.
- Do not reuse hackathon, demo, or reviewer wallets for real-funds production custody.
- Do not use a multisig until the threshold, signers, recovery path, and signer roles are documented.
- Do not call the production mainnet blocker closed until the transfer transaction signatures are retained.

## Multisig Creation Checklist

1. Select the custody stack and network.
2. Record the multisig address before moving any authority.
3. Record the threshold, signer roles, signer hardware class, and recovery plan.
4. Confirm every signer can independently view and approve transactions.
5. Run a zero-value rehearsal or low-risk authority rehearsal before production transfer.
6. Save the rehearsal signature and approval transcript in the release packet.

Required evidence:

- completed intake in `docs/multisig-setup-intake.json`
- multisig address
- threshold
- signer role list
- rehearsal signature
- governance or custody policy link

## Program Upgrade Authority Transfer

Pre-checks:

- `anchor build` has been run against the exact release commit.
- `npm run check:mainnet` passes.
- the current upgrade authority is known and controlled.
- the destination multisig address is confirmed out-of-band.

Execution outline:

```bash
solana program show <PROGRAM_ID> --url mainnet-beta
solana program set-upgrade-authority <PROGRAM_ID> \
  --new-upgrade-authority <MULTISIG_OR_GOVERNANCE_AUTHORITY> \
  --url mainnet-beta
solana program show <PROGRAM_ID> --url mainnet-beta
```

Post-checks:

- confirm the new upgrade authority matches the intended multisig or governance authority
- record the transfer transaction signature
- add the authority state to the release ceremony packet
- do not proceed if the authority shown by `solana program show` is unexpected

## DAO And Treasury Authority Transfer

Production DAO and treasury authorities must be handled with the same discipline as program upgrade authority.

Before transferring:

- identify every DAO and treasury authority account
- verify PDA derivations and signer requirements
- verify whether authority movement requires an instruction call, governance proposal, or multisig transaction
- document the proposal or transaction that performs the transfer

After transferring:

- read the authority state from the target account
- retain explorer links for the transfer transaction
- retain a reference URL or repo-backed file for the post-transfer readout
- update the release ceremony packet
- run a read-only operational sanity check before enabling treasury execution

## Timelock Configuration

Production timelock settings must be explicit before accepting real-funds execution.

Minimum requirements:

- timelock duration is written in the release record
- emergency veto or containment path is documented
- operators know the latest safe point to stop suspicious execution
- timelock cannot be shortened without a documented policy change

## Backup And Recovery

Backup does not mean copying raw private keys into a repository. It means preserving the operational ability to recover from device loss, signer absence, or role rotation without exposing secrets.

Required backups:

- signer inventory by role, not by secret
- hardware wallet or custody recovery procedure
- multisig signer replacement process
- emergency contact path
- read-only copy of current authority state
- release packet backup with transaction signatures and hashes

Forbidden backups:

- seed phrases in Git
- private keys in docs, screenshots, or tickets
- unencrypted hot-wallet exports

## Completion Standard

The `upgrade-authority-multisig` blocker can only be marked complete when all of the following exist:

- production multisig or governance authority address
- threshold and signer roles
- authority transfer transaction signature
- post-transfer authority readout
- post-transfer authority readout reference
- signer recovery process
- release packet reference

Until then, the honest state is `pending-external`.
