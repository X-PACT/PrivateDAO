# Devnet Scale Profiles

PrivateDAO maintains one canonical multi-wallet reviewer run and two larger scale profiles for extended stress work.

## Canonical Reviewer Profile

- profile: `50`
- command: `npm run test:devnet:all`
- purpose: reviewer-facing, explorer-verifiable baseline
- artifact set:
  - `docs/devnet-wallet-registry.json`
  - `docs/devnet-bootstrap.json`
  - `docs/devnet-tx-registry.json`
  - `docs/adversarial-report.json`
  - `docs/zk-proof-registry.json`
  - `docs/performance-metrics.json`
  - `docs/load-test-report.md`

This profile is the published baseline because it is easier to inspect quickly while still covering:

- proposal bootstrap
- wave-based commits
- valid and invalid reveals
- finalize and execute enforcement
- adversarial rejection paths
- zk companion proofs

## Extended Stress Profiles

### `100` Wallet Profile

- command: `npm run test:devnet:100`
- target use: stronger RPC and wave-behavior validation without replacing the canonical 50-wallet evidence
- artifacts:
  - `docs/devnet-wallet-registry.profile-100.json`
  - `docs/devnet-bootstrap.profile-100.json`
  - `docs/devnet-tx-registry.profile-100.json`
  - `docs/adversarial-report.profile-100.json`
  - `docs/zk-proof-registry.profile-100.json`
  - `docs/performance-metrics.profile-100.json`
  - `docs/load-test-report.profile-100.md`

### `350` Wallet Profile

- command: `npm run test:devnet:350`
- target use: production-style saturation run with the same harness shape as the reviewer package while keeping Devnet pressure disciplined
- wave model:
  - `50` wallets x `7` waves
  - short pause between waves
  - funding completed before commit/reveal waves
  - bounded retries and full transaction logging
- required coverage inside the same run:
  - happy path:
    - commit
    - reveal
    - finalize
    - execute
    - zk companion flow
  - negative path:
    - wrong reveals
    - late reveals
    - duplicate execute attempts
    - authority or treasury binding mismatches
    - replay attempts
- artifacts:
  - `docs/devnet-wallet-registry.profile-350.json`
  - `docs/devnet-bootstrap.profile-350.json`
  - `docs/devnet-tx-registry.profile-350.json`
  - `docs/adversarial-report.profile-350.json`
  - `docs/zk-proof-registry.profile-350.json`
  - `docs/performance-metrics.profile-350.json`
  - `docs/load-test-report.profile-350.md`
  - `docs/devnet-350-wave-plan.md`

### `500` Wallet Profile

- command: `npm run test:devnet:500`
- target use: saturation-style Devnet stress with stronger rate-limit discipline and token-aware wallet funding
- artifacts:
  - `docs/devnet-wallet-registry.profile-500.json`
  - `docs/devnet-bootstrap.profile-500.json`
  - `docs/devnet-tx-registry.profile-500.json`
  - `docs/adversarial-report.profile-500.json`
  - `docs/zk-proof-registry.profile-500.json`
  - `docs/performance-metrics.profile-500.json`
  - `docs/load-test-report.profile-500.md`

## Safety Model

- Devnet only
- wave-based execution only
- no aggressive RPC spam
- resumable state persisted per profile
- funding and transaction retries stay idempotent
- canonical reviewer artifacts are not overwritten by extended profiles

## Explorer Visibility

All profiles use the same registry format:

- transaction signature
- explorer URL
- timestamp
- action
- wallet public key

This keeps larger runs reviewer-friendly while preserving the 50-wallet package as the primary evidence surface.

## Summary Fields

All generated profile reports now surface:

- total wallets
- successful commits
- successful reveals
- rejected invalid reveals
- finalize success
- execute success
- confidential payout success
- replay rejections
- authority mismatch rejections
- total tx count
- explorer links
- average latency
- failure causes
