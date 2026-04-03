# PDAO Token Surface

PrivateDAO now documents and publishes a live Devnet governance voting token profile for reviewer and product surfaces.

## Token Metadata

- Name: `PDAO`
- Network: `Devnet`
- Utility: `Governance Voting Token`
- Platform: `DeAura`

## Live Devnet Deployment

- Mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- Program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` (`Token-2022`)
- Decimals: `9`
- Metadata URI: `https://x-pact.github.io/PrivateDAO/assets/pdao-token.json`
- Verification wallet / mint authority / update authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Associated token account: `F4q77ZMJdC7eoEUw3CCR7DbKGTggyExjuMGKBEiM2ct4`
- Current initial supply: `1,000,000 PDAO`
- Published metadata asset: `docs/assets/pdao-token.json`

## Program Identity Boundary

- PrivateDAO governance program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Token-2022 program: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`

These are intentionally different:

- the PrivateDAO governance program id is the on-chain protocol identity
- the Token-2022 program id is the mint program used by the live PDAO token surface

The presence of both ids does not indicate a duplicate PrivateDAO deployment.

## Verified Devnet Transactions

- `create-token`: `5zGeSePpx2q3dFTNBi8Vmn8ucd9B3jEW6MKqrCUWtQQa3FipwDPFVKRrAoWQhJagBVqKMfUcWxVfpA6Q2vymanA6`
- `create-account`: `45gM6Jo3SSbwxzqyGRSMhTmz47r8wsaAMikdkbSQ2AyoXMEA3JAJM9X6eufjwnKY5QYU6QCFTjAfR9cVExKu2rhn`
- `initialize-metadata`: `4kgVoRGATdVAWVoYAYGqWnJBpDHiiRmFyQ3rgRz2uWEGdsx3Hosg5Ro7JGY7xSygD1vUUsGCduseCMWYx4MbXgur`
- `mint-initial-supply`: `7LF3U3kooWfnRwaziceyRzKrHKhFQ6q6hfYeR6vU5gudjTPKYbw6kmXCxvvfurnQBnCBTCWH54rabcDqx1TBbLA`

## Generated Attestation

- Machine-readable attestation: `docs/pdao-attestation.generated.json`

These transactions are finalized on Solana Devnet and were executed from the verification wallet above.

## Intended Role In PrivateDAO

`PDAO` is the designated governance voting token profile for the current Devnet-facing PrivateDAO surface.

It is intended to represent:

- governance participation
- token-gated proposal creation
- token-gated voting rights
- a clearer user-facing governance token identity across docs and frontend surfaces

## What This Does Not Change

This token note does not change the deployed protocol surface:

- no contract interfaces are changed
- no PDA derivations are changed
- no account layouts are changed
- DAO-level governance mint logic remains the on-chain source of truth

PrivateDAO still supports DAO-configured governance mints at the protocol level. `PDAO` is the designated Devnet governance token profile shown in the current product and reviewer surface.

## Reviewer Interpretation

Reviewers should read this note as:

- a formal token identity for the Devnet governance surface
- not a claim of a protocol-native fee token
- not a claim of speculative tokenomics
- not a replacement for DAO-specific governance-mint enforcement on-chain
- not a claim that every DAO in the protocol must use this mint

## Product Positioning

`PDAO` is intentionally framed as a governance voting token, not a monetization token.

That keeps the token surface aligned with what PrivateDAO actually does today:

- proposal participation
- voting rights
- governance execution control
- private governance coordination

## Verification Commands

```bash
spl-token -C /tmp/pdao-solana-config.yml display --program-2022 AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt --output json-compact
curl -fsSL https://x-pact.github.io/PrivateDAO/assets/pdao-token.json
solana confirm --url devnet 5zGeSePpx2q3dFTNBi8Vmn8ucd9B3jEW6MKqrCUWtQQa3FipwDPFVKRrAoWQhJagBVqKMfUcWxVfpA6Q2vymanA6
solana confirm --url devnet 45gM6Jo3SSbwxzqyGRSMhTmz47r8wsaAMikdkbSQ2AyoXMEA3JAJM9X6eufjwnKY5QYU6QCFTjAfR9cVExKu2rhn
solana confirm --url devnet 4kgVoRGATdVAWVoYAYGqWnJBpDHiiRmFyQ3rgRz2uWEGdsx3Hosg5Ro7JGY7xSygD1vUUsGCduseCMWYx4MbXgur
solana confirm --url devnet 7LF3U3kooWfnRwaziceyRzKrHKhFQ6q6hfYeR6vU5gudjTPKYbw6kmXCxvvfurnQBnCBTCWH54rabcDqx1TBbLA
```
