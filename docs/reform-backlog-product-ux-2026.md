# Product UX Reform Backlog 2026

## Scope

This backlog covers homepage clarity, guided governance flow, mobile/operator usability, Arabic UX, and wallet-first execution surfaces.

## Now

### 1. Finish the live governance cycle UX

Target:

- make `Create DAO -> Create Proposal -> Commit -> Reveal -> Finalize -> Execute` stable and legible from the public product path

Done when:

- a normal operator can complete the cycle without needing reviewer-only surfaces

### 2. Keep `/start` and `/govern` action-first

Target:

- continue removing route noise, hidden dead ends, and reviewer density from the first-run product path

### 3. Normalize wallet-state messaging

Target:

- every wallet error should identify the real stop point:
  - wrong wallet
  - missing governance token
  - duplicate DAO name
  - not landed on Devnet
  - reveal window closed/not yet open

## Next

### 4. Arabic and RTL support

Target:

- introduce deliberate RTL support for core product flows instead of partial text-level localization only

### 5. Mobile notification and reminder posture

Target:

- reveal and execution reminder model for mobile and Android operator flows

### 6. Ecosystem integration surfaces

Target:

- present Kamino, Jupiter, Solflare, and related ecosystem lanes only where they are tied to real user value and truthful evidence

## Later

### 7. Gaming and payment product lanes

Target:

- refine them into credible commercial corridors rather than secondary narrative fragments

### 8. Docs and in-product educational flow

Target:

- explain the stack through product operations, not abstract theory

## Validation

Minimum:

```bash
cd /home/x-pact/PrivateDAO
git diff --check
```

For public route changes:

```bash
cd /home/x-pact/PrivateDAO/apps/web
npx tsc --noEmit --pretty false
```

And visually verify the affected route if possible.
