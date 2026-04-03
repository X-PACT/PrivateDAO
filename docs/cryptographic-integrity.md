# Cryptographic Integrity

PrivateDAO now ships a cryptographic integrity layer above the existing review and zk surfaces.

The goal is simple: reviewer-facing evidence should be tamper-evident, not just well documented.

## What Exists

- `docs/cryptographic-manifest.generated.json`
- `scripts/build-cryptographic-manifest.ts`
- `scripts/verify-cryptographic-manifest.ts`

## What Is Hashed

The manifest currently records `sha256` digests for the highest-signal artifacts:

- zk circuit source
- zk verification key
- zk sample proof
- zk public inputs
- proof registry
- devnet release manifest
- live proof note
- submission registry
- independent verification guide
- security review
- zk layer note
- verification-gates note

## Why This Matters

These hashes do not replace on-chain verification.

They serve a different purpose:

- prevent silent drift across critical reviewer-facing artifacts
- make zk evidence tamper-evident
- let reviewers verify that the same canonical evidence surface is being referenced everywhere

## How To Use

Rebuild the manifest:

```bash
npm run build:cryptographic-manifest
```

Verify the manifest:

```bash
npm run verify:cryptographic-manifest
```

Run the full verification stack:

```bash
npm run verify:all
```

## Scope

This layer is additive and non-breaking.

It does not:

- change deployed contracts
- change PDA derivations
- change instruction interfaces
- replace existing proof, replay, or lifecycle validation

It strengthens artifact integrity on top of the existing protocol and review surface.
