# Domain Mirror Strategy

PrivateDAO keeps the current review URL stable:

- Current review URL: `https://x-pact.github.io/PrivateDAO/`

The production-facing domain can be added as a mirror:

- Planned mirror domain: `https://app.privatedao.xyz/`

## Mirror-Safe Rule

The current GitHub Pages URL remains valid during review and does not get replaced in-repo by the mirror domain.

This avoids breaking:

- reviewer bookmarks
- previously shared links
- proof-center entrypoints
- Devnet evidence links already attached to the current review surface

## Deployment Model

The safe rollout path is:

1. Keep `x-pact.github.io/PrivateDAO/` unchanged as the canonical review URL.
2. Deploy the same frontend bundle to `.xyz` as a mirror.
3. Verify that both URLs open the same interface and same asset set.
4. Only after review, decide whether to promote `.xyz` as the primary production domain.

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

- root entry redirects to `./docs/` while preserving query params and hash fragments
- the live frontend updates canonical / Open Graph / Twitter URL metadata from the active origin
- self-links inside the app no longer assume only `x-pact.github.io/PrivateDAO/`
- copied evidence packets can now reference the active frontend origin instead of a hardcoded review host

This means the same frontend bundle can be served from:

- `https://x-pact.github.io/PrivateDAO/`
- `https://app.privatedao.xyz/`

without rewriting the UI logic itself.

Execution checklist:

- [`docs/xyz-mirror-cutover-checklist.md`](xyz-mirror-cutover-checklist.md)

## Current Recommendation

During review:

- keep `https://x-pact.github.io/PrivateDAO/` active
- add `.xyz` only as a parallel mirror
- do not replace the current URLs in reviewer-facing artifacts until the mirror is verified end-to-end
