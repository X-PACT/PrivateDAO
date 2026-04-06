# PrivateDAO RPC Architecture

PrivateDAO does not treat one browser RPC endpoint as a sufficient production architecture.

## Current architecture

### Write path

- wallet signs in the browser
- the signed transaction is sent over the active RPC path
- the UI keeps retry and fallback logic for:
  - blockhash expiry
  - endpoint failure
  - transient network faults

### Read path

- preferred: backend read node and indexer
- fallback: direct browser RPC

## RPC pool

The read node resolves a Devnet pool from:

- `SOLANA_RPC_URL`
- `ALCHEMY_DEVNET_RPC_URL` or `ALCHEMY_API_KEY`
- `HELIUS_API_KEY`
- `QUICKNODE_DEVNET_RPC`
- `EXTRA_DEVNET_RPCS`
- public Devnet RPC

## Why the split matters

- proposal lists are heavier than individual wallet-signed writes
- runtime panels and reviewer surfaces create repeated reads
- wallet UX should stay focused on signing, not on carrying all indexing pressure

## Mainnet recommendation

For mainnet readiness, use:

1. same-domain frontend and read node
2. pooled authenticated RPCs behind the read node
3. direct frontend RPC as emergency fallback only
4. monitoring over:
   - rate limits
   - stale blockhash incidents
   - slot lag
   - request latency

## Not in scope

This read node is not:

- a signer
- a treasury operator
- a custody surface
- a hidden execution relay

It is a read-heavy resilience layer designed to keep governance UX and reviewer surfaces stable under load.
