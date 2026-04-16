# Domain Mirror Strategy

PrivateDAO keeps the canonical review URL stable:

- Current review URL: `https://privatedao.org/`

## Mirror-Safe Rule

The current GitHub Pages URL remains valid during review and does not get replaced in-repo by the mirror domain.

This avoids breaking:

- reviewer bookmarks
- previously shared links
- proof-center entrypoints
- Devnet evidence links already attached to the current review surface

## Deployment Model

The safe rollout path is:

1. Keep `https://privatedao.org/` as the canonical review URL.
2. Only maintain alternate hosts as non-canonical mirrors if they are still needed operationally.
3. Verify that any alternate host opens the same interface and same asset set.

## Why This Matters

PrivateDAO is under active review. A destructive domain cutover would create unnecessary doubt around:

- frontend integrity
- reviewer reproducibility
- URL stability
- submitted evidence references

The mirror approach preserves continuity while still allowing a stronger production-facing domain.

## Frontend Expectations

Both surfaces should resolve to the same repo-native frontend behavior:

- DAO bootstrap
- treasury deposit
- proposal creation
- commit / reveal / finalize / execute
- Proof Center
- Security page
- Diagnostics page
- ZK companion evidence
- cryptographic integrity evidence

## Application-Layer Hardening Already Applied

The repo now includes mirror-safe frontend behavior at the application layer:

- the repo root now serves the Next.js export directly instead of redirecting into `docs/`
- the root surface preserves legacy `?page=` entrypoints through the new Next.js compatibility layer
- the live frontend updates canonical / Open Graph / Twitter URL metadata from the active origin
- self-links inside the app no longer assume a GitHub Pages origin
- copied evidence packets can now reference the active frontend origin instead of a hardcoded review host

This means the same frontend bundle can be served from the canonical production domain without rewriting the UI logic itself.

Execution checklist:

- [`docs/xyz-mirror-cutover-checklist.md`](xyz-mirror-cutover-checklist.md)

## Current Recommendation

During review:

- keep `https://privatedao.org/` as the canonical review URL
- only use alternate mirrors if they are needed for continuity
- keep reviewer-facing artifacts anchored to the canonical production domain
