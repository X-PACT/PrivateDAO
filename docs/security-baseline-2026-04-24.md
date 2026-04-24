# Security Baseline — 2026-04-24

## Scope

- Repository: `X-PACT/PrivateDAO`
- Gate run: `~/.codex/ops/bin/codex-security-gate.sh /home/x-pact/PrivateDAO`
- Date: 2026-04-24

## Current Findings

1. **Dependency risk remains open**
- `npm audit` reports unresolved vulnerabilities in transitive Solana packages (`@solana/web3.js` chain).
- Immediate `npm audit fix --force` is breaking for current stack; upgrade requires controlled migration branch.

2. **Secret-handling discipline needed**
- Local `.env` style files must never enter commits.
- Risk is operational (accidental staging), even when files are not currently tracked.

3. **Release noise from generated artifacts**
- Large generated static and mirror trees can hide real source changes during review.

## Mitigations Applied In This Phase

1. **Env protection hardened**
- `.gitignore` updated to block local environment files explicitly:
  - `.env.local`
  - `.env.*` (except `.env.example`)
  - `apps/web/.env.local`
  - `apps/web/.env.*` (except `.env.example`)

2. **Security baseline documentation added**
- This file is now the canonical checkpoint for current security state and risk ownership.

3. **Track delivery discipline made explicit**
- Track execution board and submission index are now linked in `README.md`.

## Open Security Work (Next Tranche)

1. Create a dedicated dependency-upgrade branch for Solana package chain and rerun full CI + runtime verification.
2. Add CI secret scanning (`gitleaks` or equivalent) as blocking check.
3. Split generated artifacts from source-truth branch to reduce review blind spots.

## Truth Boundary

- Security baseline is **improved**, not “fully closed”.
- Dependency vulnerabilities are **known and documented** pending controlled upgrade.
