<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# MagicBlock Operator Flow

This is the canonical operator sequence for a PrivateDAO confidential token payout that uses MagicBlock.

## CLI path

1. Configure the confidential payout plan:

```bash
npm run configure:confidential-payout -- \
  --dao "$DAO_PDA" \
  --proposal "$PROPOSAL_PDA" \
  --payout-type bonus \
  --asset-type token \
  --settlement-recipient "$SETTLEMENT_WALLET" \
  --payout-total 250000000 \
  --payout-mint "$TOKEN_MINT" \
  --recipient-count 2 \
  --manifest-uri "box://privatedao/payroll/bonus-epoch-1" \
  --manifest-hash "$MANIFEST_HASH" \
  --ciphertext-hash "$CIPHERTEXT_HASH"
```

2. Configure the MagicBlock corridor:

```bash
npm run configure:magicblock -- \
  --dao "$DAO_PDA" \
  --proposal "$PROPOSAL_PDA" \
  --owner-wallet "$OWNER_WALLET" \
  --payout-mint "$TOKEN_MINT" \
  --deposit-amount 250000000 \
  --private-transfer-amount 250000000 \
  --withdrawal-amount 250000000
```

3. Run the MagicBlock payment route:

```bash
npm run magicblock:payments -- initialize-mint --mint "$TOKEN_MINT"
npm run magicblock:payments -- deposit --owner "$OWNER_WALLET" --mint "$TOKEN_MINT" --amount 250000000
npm run magicblock:payments -- transfer --from "$OWNER_WALLET" --to "$SETTLEMENT_WALLET" --mint "$TOKEN_MINT" --amount 250000000 --visibility private --to-balance ephemeral
npm run magicblock:payments -- withdraw --owner "$SETTLEMENT_WALLET" --mint "$TOKEN_MINT" --amount 250000000
```

4. Settle the corridor on-chain from the DAO authority wallet:

```bash
npm run settle:magicblock -- \
  --dao "$DAO_PDA" \
  --proposal "$PROPOSAL_PDA" \
  --validator "$VALIDATOR_PUBKEY" \
  --transfer-queue "$TRANSFER_QUEUE_PUBKEY" \
  --deposit-tx-signature "$DEPOSIT_SIG" \
  --transfer-tx-signature "$TRANSFER_SIG" \
  --withdraw-tx-signature "$WITHDRAW_SIG"
```

5. Finalize and execute:

```bash
yarn finalize -- --proposal "$PROPOSAL_PDA"
yarn execute -- --proposal "$PROPOSAL_PDA"
```

## Frontend path

The live frontend now exposes the same lifecycle:

- create the confidential token payout
- bind the MagicBlock corridor
- inspect corridor readiness in the selected proposal
- run the MagicBlock corridor in wallet
- execute only after corridor settlement is visible on-chain

## Guardrails

- MagicBlock only activates for confidential token payouts
- the corridor is proposal-bound
- the settlement wallet must match the payout plan settlement recipient
- execution is rejected until DAO-authority settlement evidence is present
- the PrivateDAO program records and gates on MagicBlock evidence; it does not re-verify MagicBlock transaction contents cryptographically on-chain
- backend read infrastructure stays read-only
