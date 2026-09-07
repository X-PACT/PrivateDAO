# Selective Disclosure Operating Surface

PrivateDAO does not treat privacy as an all-or-nothing switch.

The live product now exposes a selective disclosure surface so operators, reviewers, partners, and auditors can inspect the exact evidence window they need without flattening the protected workflow into a public spreadsheet.

## What stays private

- vote intent before reveal
- sensitive payout reasoning
- internal operator notes
- committee-only execution context that does not need public distribution

## What becomes visible

- transaction signatures
- explorer-visible hashes
- runtime logs
- reviewer packets
- custody and authority state when that proof is required

## Live review lanes

- Auditor review: `/documents/canonical-custody-proof/`
- Committee oversight: `/judge/`
- Partner due diligence: `/services/privacy-sdk-api-starter/`
- Incident response lane: `/documents/privacy-and-encryption-proof-guide/`

## Why this matters

This surface is the institutional bridge between strong privacy and high-trust review.

It lets PrivateDAO present:

- confidentiality for operators
- enough proof for judges and grant reviewers
- a narrower disclosure lane for enterprise and audit discussions
- a product-safe explanation of what the chain proves today on Devnet
