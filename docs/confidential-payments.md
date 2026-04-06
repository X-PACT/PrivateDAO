<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Confidential Payments

PrivateDAO now supports proposal-bound confidential payout plans for salary batches, bonus rounds, grant disbursements, and similar treasury operations that should not expose the full recipient sheet on-chain.

## What It Does

- attaches an encrypted payout manifest to a proposal without storing the employee-level sheet on chain
- binds the plan to one proposal through a dedicated PDA
- keeps only aggregate settlement data public:
  - payout type
  - asset type
  - settlement recipient
  - recipient count
  - total amount
  - manifest hash
  - ciphertext hash
- executes the aggregate batch only after the proposal passes and clears timelock

## What Stays Private

PrivateDAO does not publish the full payroll or bonus manifest on-chain. The encrypted manifest remains off-chain. The chain only exposes immutable hashes and settlement metadata so operators and reviewers can verify that the approved batch and the executed batch still refer to the same encrypted package.

## Current Security Boundary

The current confidential payout path is honest about its boundary:

- approval is on-chain and proposal-bound
- execution is on-chain and treasury-bound
- the manifest is encrypted off-chain
- the public chain shows aggregate settlement, not individual allocations

This is a governed encrypted payout system, not a fully private money rail.

## Supported Modes

- Salary batch
- Bonus batch
- SOL settlement
- Token settlement

## Operator Path

1. Create a proposal normally.
2. Configure the confidential payout plan with:
   - payout type
   - settlement wallet
   - asset type
   - total amount
   - recipient count
   - encrypted manifest URI
   - manifest hash
   - ciphertext hash
3. Commit, reveal, finalize, and wait for timelock.
4. Execute through the confidential payout path.

## Commands

```bash
npm run configure:confidential-payout -- \
  --dao <DAO_PDA> \
  --proposal <PROPOSAL_PDA> \
  --payout-type salary \
  --asset-type sol \
  --settlement-recipient <SETTLEMENT_WALLET> \
  --payout-total 12.5 \
  --recipient-count 8 \
  --manifest-uri "box://privatedao/payroll/epoch-7" \
  --manifest-hash <HEX32> \
  --ciphertext-hash <HEX32>
```

```bash
npm run inspect:confidential-payout -- --proposal <PROPOSAL_PDA>
```

```bash
yarn execute -- --proposal <PROPOSAL_PDA>
```

## UI Surface

The live frontend now exposes confidential payouts in three places:

- proposal creation builder
- live proposal cards
- selected proposal detail and execution panel

## Anchor Event Logs

The confidential payout path also emits on-chain Anchor events so Devnet and later mainnet operators can trace the batch lifecycle cleanly:

- `ConfidentialPayoutConfigured`
- `ConfidentialPayoutExecuted`

## Related Notes

- [confidential-payroll-flow.md](confidential-payroll-flow.md)
- [confidential-payments-diagram.md](confidential-payments-diagram.md)
- [confidential-payments-audit-scope.md](confidential-payments-audit-scope.md)
