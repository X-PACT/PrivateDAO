# PrivateDAO.xyz Cutover Status

## Current status

- Root live surface: `https://x-pact.github.io/PrivateDAO/`
- Intended custom domain: `https://privatedao.xyz/`
- Repository-side custom domain file: present at repo root as `CNAME`
- Legacy GitHub Pages URL should remain usable after cutover

## What was verified

- The live surface is already published from the repository root using the Next.js export.
- The repository now declares `privatedao.xyz` as the intended GitHub Pages custom domain.
- Query and route handling for the live surface already works on the current GitHub Pages path.

## What is still blocked

The connected Cloudflare account currently does **not** expose a zone for `privatedao.xyz`.

That means the remaining steps are external to the repository:

1. Add or connect the `privatedao.xyz` zone to the correct Cloudflare account
2. Create the DNS records for GitHub Pages
3. Wait for DNS propagation
4. Confirm GitHub Pages validates the custom domain
5. Re-test:
   - `https://privatedao.xyz/`
   - `https://privatedao.xyz/proof/?judge=1`
   - `https://x-pact.github.io/PrivateDAO/`

## DNS target plan

For GitHub Pages, the typical plan is:

- apex `A` / `AAAA` records for GitHub Pages
- `www` CNAME to `x-pact.github.io`

Cloudflare proxying choice should be made carefully during activation.

## Truth boundary

This document does **not** claim that `privatedao.xyz` is already live.

It records that the repository is now prepared for the custom domain, while DNS ownership and zone configuration remain pending in Cloudflare.
