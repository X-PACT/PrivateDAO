<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# REFHE Operator Flow

Use this when a confidential payroll, bonus, or grant proposal requires encrypted evaluation before settlement.

## Flow

1. Create the proposal.
2. Configure the confidential payout plan.
3. Configure the REFHE envelope.
4. Complete voting and reveal.
5. Finalize the proposal.
6. Run the encrypted evaluation off-chain.
7. Settle the REFHE envelope on-chain.
8. Execute the confidential payout.

## Frontend Flow

In the web app:

1. Open `Proposals`
2. Create a confidential payroll or bonus proposal
3. Fill:
   - encrypted manifest URI
   - manifest hash
   - ciphertext hash
   - REFHE model URI
   - REFHE policy hash
   - REFHE input ciphertext hash
   - REFHE evaluation key hash
4. Submit in wallet
5. After finalization, inspect `REFHE READINESS` in the selected proposal panel
6. Do not execute until the panel reports `Ready`

## CLI Flow

```bash
npm run create-proposal -- ...
npm run inspect:confidential-payout -- --proposal <PROPOSAL_PDA>
npm run inspect:refhe -- --proposal <PROPOSAL_PDA>
npm run settle:refhe -- --dao <DAO_PDA> --proposal <PROPOSAL_PDA> --result-ciphertext-hash <HEX32> --result-commitment-hash <HEX32> --proof-bundle-hash <HEX32> --verifier-program <PROGRAM_ID>
npm run execute -- --proposal <PROPOSAL_PDA>
```

## Required Checks

Before settlement:

- `input_ciphertext_hash` matches the payout plan ciphertext hash
- payout plan belongs to the same proposal
- proposal is still the intended confidential payout proposal

Before execution:

- proposal status is `Passed`
- timelock is cleared
- payout plan status is still `Configured`
- REFHE envelope status is `Settled`
- verifier program is present

## Failure States

- `RefheSettlementRequired`
  - configure/settle REFHE before execution
- `RefheVerifierProgramRequired`
  - settle again with a verifier program binding
- `RefheEnvelopeMismatch`
  - the wrong proposal or payout plan is being used
- `RefheEnvelopeLocked`
  - the proposal or payout plan moved past the allowed configuration window
