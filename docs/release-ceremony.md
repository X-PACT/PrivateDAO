# Release Ceremony

PrivateDAO treats any future mainnet cutover or upgrade event as a release ceremony, not as a casual deploy.

## Purpose

This document defines the minimum release discipline expected before any production-bound deployment, upgrade, or authority-sensitive action.

## Ceremony Principles

- freeze one exact commit under review
- bind every deployment step to recorded evidence
- use explicit operator identity and authority handling
- verify primary and fallback RPC assumptions before and after release
- retain post-deploy proof, not just pre-deploy intent

## Mandatory Inputs

- reviewed commit hash
- expected program id
- operator identity
- signer custody decision
- RPC primary and fallback endpoints
- release timestamp

## Mandatory Gates

```bash
npm run verify:live-proof
npm run verify:release-manifest
npm run verify:review-links
npm run verify:review-surface
npm run check:mainnet
```

## Evidence To Preserve

- reviewed commit hash
- deployment transaction or upgrade transaction
- recorded operator identity
- post-deploy verification output
- explorer references
- generated release-ceremony attestation

## Honest Boundary

This ceremony layer improves operational rigor and reviewer confidence.

It does not replace:

- external audit sign-off
- organization-specific custody approvals
- legal or organizational release controls outside the repository
