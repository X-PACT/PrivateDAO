# Protocol Reform Backlog 2026

## Scope

This backlog covers Solana program structure, instruction safety, account validation, and audit-readiness.

## Now

### 1. Split oversized program modules

Target:

- break `lib.rs` and other oversized files into:
  - `dao`
  - `voting`
  - `treasury`
  - `privacy`
  - `errors`

Done when:

- instruction entrypoints remain readable
- domain logic is no longer collapsed into one file

### 2. Centralize protocol errors

Target:

- move scattered error messages into one explicit error layer

Done when:

- each user-visible failure maps to one canonical error variant

### 3. Remove duplicated instruction variants

Target:

- replace duplicated instruction paths with policy-driven or feature-gated behavior where possible

Done when:

- duplicated logic drops
- safety review surface becomes smaller

## Next

### 4. Tighten account validation

Target:

- explicit ownership checks
- signer/writable expectations
- PDA derivation clarity
- Token vs Token-2022 correctness

### 5. Anchor migration plan

Target:

- produce an explicit migration checklist for Anchor `v0.30+`

Done when:

- migration steps, risks, and validation commands are documented before code churn

### 6. Lifecycle traits only where they simplify logic

Target:

- evaluate small traits around proposal and vote lifecycle only if they reduce duplication without obscuring execution

## Later

### 7. External audit handoff refinement

Target:

- reduce the audit scope into review-friendly domains:
  - governance core
  - treasury execution
  - privacy extensions

### 8. Privacy model formalization

Target:

- formalize nullifier and reveal identity-separation direction without overclaiming deployment status

## Validation

Minimum:

```bash
cd /home/x-pact/PrivateDAO
git diff --check
```

If Rust or program interfaces changed, add the smallest meaningful program/test validation available in the workspace.
