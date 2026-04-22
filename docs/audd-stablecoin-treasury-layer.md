# AUDD Stablecoin Treasury Layer

## Purpose

PrivateDAO treats stablecoin settlement as treasury infrastructure, not as a cosmetic token toggle.

The AUDD layer is designed for teams that need:

- Australian-dollar merchant settlement
- governed treasury management in AUD terms
- invoice collection with reviewer-visible proof
- programmable finance flows tied to governance approval
- business-facing payment rails that stay readable from browser to chain

AUDD fits this layer because the sponsor brief is practical and production-oriented: build something people can use, make AUDD the on-chain Australian-dollar asset, and connect it to real payments, settlement, treasury, or programmable finance flows on Solana.

## Product lanes

### AUDD merchant settlement

The product can stage an AUDD payment request from the browser, attach memo-coded intent, preserve route context, and keep the resulting signature inside the same reviewer path as the treasury request.

Primary routes:

- `https://privatedao.org/services#treasury-payment-request`
- `https://privatedao.org/services/testnet-billing-rehearsal/`
- `https://privatedao.org/judge/`

### AUDD treasury management

Treasury operators can prepare AUD-denominated reserve motions, supplier settlement, or invoice funding requests without splitting governance, route logic, and settlement proof across separate tools.

Primary routes:

- `https://privatedao.org/services#jupiter-treasury-route`
- `https://privatedao.org/govern/`
- `https://privatedao.org/proof/?judge=1`

### AUDD programmable finance

The same surface can support policy-bound merchant disbursements, recurring treasury operations, and route-reviewed finance actions while keeping governance and wallet execution linked.

Primary routes:

- `https://privatedao.org/services/`
- `https://privatedao.org/documents/agentic-treasury-micropayment-rail/`
- `https://privatedao.org/documents/treasury-reviewer-packet/`

## Why AUDD fits the product

The sponsor ask is direct:

- use AUDD meaningfully on Solana
- solve a real financial problem
- ship a smooth user experience
- stay production-oriented

PrivateDAO already matches that shape with:

- wallet-first treasury requests
- governed payout and settlement routing
- SPL token transfer construction in the browser
- memo-coded payment traces
- reviewer-visible signatures, logs, and packet routes

That makes AUDD a strong fit for the existing architecture because we do not need to redesign the product to support an Australian-dollar rail. We need to configure the official AUDD mint and run the same governed flow through the treasury layer.

## Technical shape

The web product now exposes AUDD as a first-class treasury asset when these environment values are configured:

```bash
NEXT_PUBLIC_TREASURY_AUDD_MINT=
NEXT_PUBLIC_TREASURY_AUDD_RECEIVE_ADDRESS=
NEXT_PUBLIC_TREASURY_AUDD_DECIMALS=6
NEXT_PUBLIC_TREASURY_AUDD_TOKEN_PROGRAM=TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA
PRIVATE_DAO_MICROPAYMENT_MINT=
PRIVATE_DAO_MICROPAYMENT_SYMBOL=AUDD
```

The browser flow constructs a wallet-signed SPL token transfer using:

- associated token account derivation
- idempotent destination ATA creation
- `TransferChecked`
- memo-coded billing and settlement labels
- explorer-visible Testnet signatures

No unverified AUDD mint is hardcoded into the repository. The official Solana mint is injected through environment configuration, and the same route activates the AUDD-specific transfer path with a funded wallet.

## Practical grant fit

This layer aligns directly with the grant categories:

- payments: merchant and invoice settlement
- on-chain settlement: wallet-signed AUDD transfers with chain proof
- treasury management: governed reserve and supplier motions
- programmable finance: policy-bound payout and route logic
- merchant tools: request intake and billing rehearsal from the browser

The result is not a slide-deck concept. It is a shipped treasury surface that can be pointed at AUDD as the settlement asset.

## Reviewer path

Recommended review order:

1. Open `https://privatedao.org/services/testnet-billing-rehearsal/`
2. Connect a Solana Testnet wallet.
3. Select `AUDD merchant settlement lane` or `AUDD treasury management lane`.
4. Sign the wallet transaction with the official AUDD mint configured and a funded AUDD wallet connected.
5. Open the explorer link and inspect the memo, transfer, and runtime logs.
6. Continue into `/services`, `/judge`, `/proof/?judge=1`, and the treasury reviewer packet.

## Current boundary

PrivateDAO now ships the browser route, treasury configuration, payout profiles, and wallet-signed SPL transfer construction for AUDD.

The remaining activation input is the official AUDD Solana mint plus a funded wallet for live asset-specific settlement. The product lane itself is already present and reusable across merchant settlement, treasury management, and programmable finance flows.
