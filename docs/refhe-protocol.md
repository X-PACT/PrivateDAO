<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# REFHE Protocol

REFHE is the encrypted-computation boundary for confidential payroll, bonus, and grant batches inside PrivateDAO.

It does not pretend to perform fully homomorphic execution on-chain. Instead, it binds an off-chain encrypted evaluation process to a proposal-bound on-chain envelope that must be settled before the confidential payout can execute.

## What REFHE Adds

- a proposal-bound `RefheEnvelope` PDA
- immutable links between:
  - DAO
  - proposal
  - confidential payout plan
  - encrypted input ciphertext hash
  - evaluation policy hash
  - evaluation key hash
  - result ciphertext hash
  - result commitment hash
  - proof bundle hash
  - verifier program binding
- execution gating:
  - if a REFHE envelope exists for a confidential payout proposal, execution is blocked until the envelope is settled

## Why It Exists

Confidential payout plans already protect the employee-level manifest by keeping only hashes and aggregate settlement metadata on-chain.

REFHE upgrades that model by adding a verifiable encrypted-evaluation step:

1. a confidential payout plan is configured on-chain
2. a REFHE envelope is configured against that payout plan
3. encrypted evaluation runs off-chain
4. the result bundle is settled on-chain
5. the payout becomes executable only after the REFHE boundary is satisfied

## On-Chain Boundary

Current on-chain enforcement is honest and strict:

- no REFHE envelope:
  - confidential payout executes normally after proposal pass + timelock
- REFHE envelope exists but is not settled:
  - execution is rejected
- REFHE envelope is settled without a verifier program:
  - execution is rejected
- REFHE envelope is settled with a verifier program:
  - execution may proceed once the proposal is executable

This makes REFHE a real execution gate, not a UI-only tag.

## Account Model

- `ConfidentialPayoutPlan`
  - encrypted manifest hash
  - ciphertext hash
  - settlement recipient
  - aggregate amount
- `RefheEnvelope`
  - model URI
  - policy hash
  - input ciphertext hash
  - evaluation key hash
  - result ciphertext hash
  - result commitment hash
  - proof bundle hash
  - verifier program
  - status: `Configured` or `Settled`

## Commands

Configure the payout batch:

```bash
npm run configure:confidential-payout -- \
  --dao <DAO_PDA> \
  --proposal <PROPOSAL_PDA> \
  --confidential-type salary \
  --settlement-recipient <SETTLEMENT_WALLET> \
  --payout-asset sol \
  --payout-total 2.5 \
  --recipient-count 6 \
  --manifest-uri "box://privatedao/payroll/epoch-7" \
  --manifest-hash <HEX32> \
  --ciphertext-hash <HEX32>
```

Configure REFHE:

```bash
npm run configure:refhe -- \
  --dao <DAO_PDA> \
  --proposal <PROPOSAL_PDA> \
  --model-uri "box://privatedao/refhe/payroll-eval-epoch-7" \
  --policy-hash <HEX32> \
  --input-ciphertext-hash <HEX32> \
  --evaluation-key-hash <HEX32>
```

Settle REFHE:

```bash
npm run settle:refhe -- \
  --dao <DAO_PDA> \
  --proposal <PROPOSAL_PDA> \
  --result-ciphertext-hash <HEX32> \
  --result-commitment-hash <HEX32> \
  --proof-bundle-hash <HEX32> \
  --verifier-program <PROGRAM_ID>
```

Inspect:

```bash
npm run inspect:refhe -- --proposal <PROPOSAL_PDA>
```

## Review Path

- [confidential-payments.md](confidential-payments.md)
- [confidential-payroll-flow.md](confidential-payroll-flow.md)
- [refhe-operator-flow.md](refhe-operator-flow.md)
- [refhe-security-model.md](refhe-security-model.md)
- [refhe-audit-scope.md](refhe-audit-scope.md)
- [assets/refhe-flow.svg](assets/refhe-flow.svg)
