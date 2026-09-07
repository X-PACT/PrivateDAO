# PrivateDAO.xyz Cutover Status

## Current status

- Root live surface: `https://privatedao.org/`
- Canonical production domain: `https://privatedao.org/`
- Repository-side custom domain file: present at repo root as `CNAME`
- Legacy GitHub Pages URLs are no longer treated as canonical review surfaces

## What was verified

- The live surface is already published from the repository root using the Next.js export.
- The repository now aligns to `https://privatedao.org/` as the canonical public domain.
- Query and route handling for the live surface already works on the current GitHub Pages path.

## What is still blocked

The remaining work is no longer a domain-bootstrap problem.

It is an operational continuity problem:

1. keep `https://privatedao.org/` serving the canonical product shell
2. preserve proof and reviewer routes on the same host
3. confirm future hosting moves do not change reviewer-facing URLs
4. re-test:
   - `https://privatedao.org/`
   - `https://privatedao.org/proof/?judge=1`
   - `https://privatedao.org/documents/reviewer-fast-path/`

## Domain target plan

The production target should keep:

- `https://privatedao.org/` as the canonical host
- proof and reviewer routes on the same origin
- any legacy mirrors as non-canonical only

## Truth boundary

This document does **not** claim that every future hosting transition is already complete.

It records that `https://privatedao.org/` is the canonical live domain and that any future infrastructure changes should preserve that reviewer path.
