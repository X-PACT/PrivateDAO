# Product Execution Playbook

This playbook keeps PrivateDAO aligned with the current external review cycle without drifting into inaccurate claims or random feature work.

It is complementary to the main product-opportunity readiness note:

- `frontier-competition-readiness-2026.md` answers: which product lanes matter most and why
- `competition-execution-playbook.md` answers: how development should stay aligned with those lanes

It should now also be read with the current operating brief:

- `colosseum-frontier-2026-operating-brief.md`

because the current operating cycle changed the baseline around:

- product impact
- signer and governance security
- migration discipline
- runtime and incident posture

## Non-negotiable constraints

- Do not weaken the protocol story to chase a trend.
- Do not touch the contracts or protocol layout unless explicitly required.
- Do not overstate audit, custody, or mainnet readiness.
- Do not claim encrypted AI, partner integrations, or operational support that is not already real.
- Do not frame PrivateDAO as "audit-complete therefore safe"; after Drift, operating posture must remain visible.

## Always preserve these foundations

- `ZK`
- `REFHE`
- `MagicBlock`
- `Fast RPC`
- `Governance Hardening V3`
- `Settlement Hardening V3`
- `Live proof`
- `Live proof V3`
- `Mainnet blockers`

These are not optional decorations. They are the differentiation layer.

## Product-level priorities

### 1. Privacy-first strength

Push hardest where PrivateDAO is naturally strongest:

- private voting
- reviewer-visible proof
- confidential operations
- additive hardening
- explicit trust boundaries

### 2. RPC and infrastructure strength

Keep investing in:

- hosted reads
- diagnostics
- runtime evidence
- API-facing surfaces
- operator and buyer packaging

### 2b. Operating-security strength

Keep reinforcing:

- signer posture
- timelock visibility
- explicit launch blockers
- wallet runtime honesty
- durable-nonce-aware security framing
- STRIDE-style operational maturity

### 3. Consumer and wallet strength

Keep improving:

- wallet onboarding
- route clarity
- mobile and Android affordances
- simpler first-run decisions

### 4. Product clarity

Each surface should answer one of these quickly:

- what is PrivateDAO?
- why is it hard to copy?
- what is already live?
- what still needs external completion?
- why does this fit the target operating lane?

## Required surface consistency

If the product story changes, consider whether the same change must appear in:

- Next.js route structure
- `/story`
- `/start`
- `/services`
- `/command-center`
- `/security`
- curated documents
- README
- demo and deck materials

## Default implementation bias

When multiple improvements are possible, prefer this order:

1. better live UX
2. cleaner operational routing
3. stronger wallet-first experience
4. stronger operating-security readability
5. stronger reviewer readability
6. stronger reviewer-specific positioning
7. only then add new speculative corridors

## Product-lane emphasis

### Privacy operations lane

Lead with:

- `PrivateDAO Core`
- `Gaming DAO Corridor`
- `ZK Capability Matrix`
- `Cryptographic Confidence Engine`

### Runtime infrastructure lane

Lead with:

- `Read API + RPC`
- diagnostics
- hosted read surfaces

### Consumer governance lane

Lead with:

- cleaner navigation
- clearer onboarding
- `/start`
- command center
- wallet-first interaction

### Wallet-first live application lane

Lead with:

- real wallet UX
- live operational flow
- infrastructure partner corridor
- story video, `/start`, and the wallet-first product route

### Core judging posture

Lead with:

- product impact
- startup-grade polish
- visible operating discipline
- proof and trust continuity
- security posture that survives the post-Drift environment

### Product quality lane

Lead with:

- integrated product coherence
- polished operational shell
- evidence-backed readiness

## Validation

For reviewer-facing frontend work, finish with:

```bash
cd /home/x-pact/PrivateDAO/apps/web
npm run lint
npm run build

cd /home/x-pact/PrivateDAO
npm run web:bundle:root
npm run web:publish:root
npm run web:verify:live:root
npm run verify:submission-registry
npm run verify:test-wallet-live-proof:v3
```

If the work touched reviewer or proof surfaces, also verify the relevant docs and generated artifacts remain consistent.
