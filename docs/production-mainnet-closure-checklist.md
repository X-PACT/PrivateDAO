# Production Mainnet Closure Checklist

Last updated: 2026-04-12

This checklist separates what is already closed inside the repository and live Devnet posture from what still requires real production custody and mainnet execution.

## Already Closed

- `PDAO live metadata cutover`
  - closed on Devnet
  - `npm run verify:pdao-live` passes
- `brand search verification`
  - Google Search Console verified
  - Google sitemap submitted successfully
  - Bing Webmaster imported from Google and verified
  - Bing sitemap submitted
- `Devnet rehearsal multisig`
  - address: `EqbW1xQRABPNmPM4TMkdygp6j94i7A3DSbgFKTpqXvJE`
  - threshold: `2-of-3`
  - live creation signature retained
- `launch checkup local ready`
  - internal engineering checks pass

## Still Required Before Honest Mainnet Production Claim

- create the production multisig on `mainnet-beta`
- harden signer custody to `cold-or-hardware`
- configure and record the `48+ hour` timelock
- execute and retain authority-transfer signatures
- record post-transfer authority readouts
- close the mainnet cutover ceremony

## Deploy Funding Boundary

- recommended deploy-only funding:
  - `20 SOL`
- this is not the only remaining step yet
- it becomes the only remaining step only after the production custody and cutover items above are closed

## Canonical Evidence

- `docs/mainnet-external-closure-packet.md`
- `docs/production-style-custody-closure-plan.md`
- `docs/multisig-setup-intake.json`
- `docs/multisig-setup-intake.md`
- `docs/mainnet-blockers.json`
- `docs/mainnet-blockers.md`
- `docs/brand-search-ops.md`
