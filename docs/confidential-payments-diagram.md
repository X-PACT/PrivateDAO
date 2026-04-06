<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Confidential Payments Diagram

```mermaid
flowchart LR
  A["Encrypted payroll or bonus manifest"] --> B["Manifest URI + hashes"]
  B --> C["configure_confidential_payout_plan"]
  C --> D["Proposal-bound payout plan PDA"]
  D --> E["Commit / Reveal / Finalize"]
  E --> F["Timelock clears"]
  F --> G["execute_confidential_payout_plan"]
  G --> H["Treasury releases aggregate batch"]
  H --> I["Settlement wallet distributes off-chain against encrypted manifest"]
```

## Reading The Diagram

- The encrypted manifest stays off-chain.
- The proposal-bound payout plan PDA becomes the immutable on-chain reference.
- Governance approves the aggregate batch through the standard lifecycle.
- The treasury releases only the aggregate amount to the settlement recipient.

## Why This Matters

The model keeps compensation operations:

- reviewable
- proposal-scoped
- timelocked
- replay-resistant

without forcing the DAO to publish the full payroll sheet on-chain.
