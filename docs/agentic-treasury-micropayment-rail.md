# Agentic Treasury Micropayment Rail

## Purpose

The Agentic Treasury Micropayment Rail turns one approved treasury instruction into many small settlement events without breaking the PrivateDAO control story.

This rail is designed for:

- reviewer rewards
- operator task settlement
- per-action API payouts
- gaming or tournament reward batches
- future agent commerce where each approved action settles small value on-chain

## Why it exists

PrivateDAO already handles:

- proposal lifecycle
- private vote flow
- governed execution
- proof and reviewer telemetry

The missing layer was a high-frequency settlement rail that can fan out from one approved policy into many small payouts while staying easy to audit.

This rail closes that gap.

## Operating model

1. A treasury or service request is prepared with the `agentic-micropayment-rail` profile.
2. The request keeps the route, quote posture, destination asset, and reviewer path inside the same payload.
3. After approval, an execution agent can trigger a batch of low-value payouts.
4. Every transfer is recorded with:
   - signature
   - explorer link
   - batch index
   - action label
   - recipient
5. The same batch can be reviewed from:
   - `/services`
   - `/govern`
   - `/proof?judge=1`
   - `/analytics`

## Asset model

The rail is stablecoin-ready by design.

- When a stable settlement mint is configured, the rail can execute through SPL token transfers.
- When no stable settlement mint is configured in the current environment, the runner falls back to native SOL on Devnet so the execution rail remains testable and reviewer-visible.

This keeps the feature operational today without pretending a stablecoin mint is already configured.

## Proof surface

The live execution batch writes machine-readable evidence to:

- `docs/agentic-treasury-micropayment-rail.generated.json`
- `docs/agentic-treasury-micropayment-rail.generated.md`

Those artifacts are intended to show:

- total transfer count
- successful transfer count
- settlement asset mode
- total amount settled
- execution wallet
- per-transfer signatures and explorer links

## Judge-first reading

The judge path is simple:

1. Open `/judge/` or `/proof?judge=1`
2. Inspect the agentic micropayment rail panel
3. Open transaction links on Solana Devnet
4. Verify that one governed treasury feature is producing many real settlement events

## Production intent

This rail is not a standalone payments demo.

It is a PrivateDAO execution feature:

- governance-controlled
- treasury-aware
- proof-linked
- reviewer-visible
- suitable for future agentic commerce and usage-based settlement
