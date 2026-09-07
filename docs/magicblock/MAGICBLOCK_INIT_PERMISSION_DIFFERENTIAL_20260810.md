# MagicBlock InitPermission Differential

Status: `NO_CURRENT_TEE_DISPATCH_BLOCKER`

This reproduction is read-only with respect to application logic. It creates a fresh Devnet auction/session, delegates it to the official Devnet TEE validator, and compares Base simulation with authenticated TEE execution.

## Reproduction

```bash
AUCTION_CREATOR_KEYPAIR="$HOME/.config/solana/id.json" \
AUCTION_SOLANA_RPC=https://api.devnet.solana.com \
AUCTION_TEE_RPC=https://devnet-tee.magicblock.app \
node scripts/reproduce-magicblock-init-permission.mjs
```

The complete machine-readable output, including both serialized wire transactions, is:

`docs/magicblock/MAGICBLOCK_INIT_PERMISSION_DIFFERENTIAL_20260810.json`

## Fixed identity

- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Local/deployed `.so` SHA-256: `115bf6b2e8497f08986d6f067e76fb65435ecdf062b796a43ac16315c8b06449`
- SDK: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2`
- Permission Program: `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1`
- Delegation Program: `DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh`
- TEE endpoint: `https://devnet-tee.magicblock.app`
- TEE validator: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`

## Exact instruction

- Discriminator: `420e99fabb24b3ec`
- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Source mapping: `global:init_permission` and `pub fn init_permission`
- Generated IDL mapping: `init_permission` has discriminator `420e99fabb24b3ec`
- Deployed artifact contains the discriminator
- Base and TEE instruction data and account metas: identical

Ordered instruction account metas:

| # | Account | Signer | Writable |
|---:|---|:---:|:---:|
| 0 | fresh delegated session | no | yes |
| 1 | fresh auction config | no | no |
| 2 | permission PDA | no | yes |
| 3 | `MagicVau1t999999999999999999999999999999999` | no | yes |
| 4 | `Magic11111111111111111111111111111111111111` | no | no |
| 5 | `ACLseoPoyC3cBqoUtkbjZ4aDrkurZW86v19pXz2XQnp1` | no | no |

The complete ordered message accounts, signer/writable flags, Base wire transaction, and TEE wire transaction are preserved in the JSON evidence file.

## Runtime logs

Base simulation:

```text
Instruction: InitPermission
AccountOwnedByWrongProgram: delegated session is owned by the delegation program
```

This is expected for Base simulation after delegation and confirms the Base instruction dispatch.

TEE execution:

```text
Instruction: InitPermission
Program ACLseo... invoke
Created ephemeral: 68 bytes, 4096 rent
Program ACLseo... success
Program <auction> success
```

TEE transaction signature:

`26LfmWkesULq3vchJbMLdCVCz9DgQnQY7GYrLBXZVEq3MMCYo7e6k2NkpKAgSNeXf6rMk2aCc1YhiMyimSbFZo`

The fresh auction/session and delegation signatures are in the JSON evidence file. Strict TEE attestation was also re-run separately and passed.

## Conclusion

The required Base-versus-TEE discriminator mismatch was **not reproduced**. Both runtimes identified the identical instruction as `InitPermission`; the TEE created the ephemeral permission account successfully. Therefore this differential test does not justify `STATUS: MAGICBLOCK TEE RUNTIME BLOCKER`.

The broader auction remains uncertified until private multi-wallet bidding, finalization, commit/undelegation, receipt reconciliation, and walletless verification pass.
