# Devnet 350-Wallet Wave Plan

This plan extends the existing PrivateDAO Devnet load harness into a reviewer-readable saturation profile without replacing the canonical 50-wallet package.

## Run Shape

- profile: `350`
- command: `npm run test:devnet:350`
- wallets: `350`
- waves: `7`
- wallets per wave: `50`
- funding: pre-done before commit and reveal waves
- retries: bounded and logged
- pauses: short pause between waves to avoid Devnet burst-spam

## Coverage Model

The `350` profile is not a pure happy-path run. It must preserve mixed-path coverage inside the same execution package.

### Happy Path

- successful commits across committed wallets
- successful reveals across valid reveal wallets
- finalize success
- execute success
- zk companion proof generation

### Negative Path

- wrong reveal attempts distributed across waves
- late reveal attempts distributed across waves
- duplicate execute attempts
- authority or treasury binding mismatch attempts
- replay attempts

## Output Requirements

The generated summary for this profile must end with:

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

## Safety Model

- Devnet only
- no replacement of canonical 50-wallet reviewer artifacts
- profile-specific artifacts only
- same transaction registry format as the baseline package
- no hidden retries or silent recovery

## Operator Notes

- Use `350` when the goal is saturation-style evidence with still-readable wave boundaries.
- Keep `50` as the baseline reviewer package.
- Keep `500` for the most aggressive RPC and throughput pressure only after `350` is stable.
