# Artifact Freshness

PrivateDAO publishes a large generated review surface. That surface is only useful if the committed artifacts stay synchronized with the builders that produce them.

## What This Gate Checks

- reviewer-facing generated JSON and Markdown artifacts rebuild without drift
- the packaged review bundle rebuilds without drift
- generated artifacts remain tracked in git rather than existing only in local state

## Why It Matters

- reviewers should not have to guess whether generated evidence is stale
- security attestations and operational summaries should be reproducible from the repository itself
- build output drift should be caught before merge, not after publication

## Commands

```bash
npm run build:devnet:review-artifacts
npm run build:review-bundle
npm run verify:artifact-freshness
```

## Scope

This gate covers deterministic generated reviewer artifacts such as:

- zk attestation
- PDAO attestation
- supply-chain attestation
- release ceremony attestation
- release drill evidence
- packaged reviewer bundle

It does not replace external audit, live production ceremony execution, device-level runtime QA, or live Devnet canary freshness.
