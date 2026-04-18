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

- `RPCFAST_DEVNET_RPC_URL`
- `RPC_FAST_DEVNET_RPC` (legacy alias)
- `SOLANA_RPC_URL`
- `ALCHEMY_DEVNET_RPC_URL` or `ALCHEMY_API_KEY`
- `HELIUS_API_KEY`
- `QUICKNODE_DEVNET_RPC`
- `EXTRA_DEVNET_RPCS`
- public Devnet RPC

## RPCFast Hackathon/Aperture lane

RPCFast activated Hackathon/Aperture support for PrivateDAO through `2026-05-11`.

This adds:

- Devnet Yellowstone gRPC for live program/account streaming
- Testnet RPC and streaming rehearsal before mainnet claims
- Mainnet Aperture gRPC for data-plane readiness checks
- Mainnet ShredStream gRPC for low-latency monitoring research
- Mainnet Yellowstone gRPC for future production observability

The required network ladder is now:

1. Devnet execution evidence
2. Testnet release-candidate infrastructure rehearsal
3. Mainnet-beta only after custody, audit, monitoring, settlement receipts, and release ceremony evidence are closed

## Why the split matters

- proposal lists are heavier than individual wallet-signed writes
- runtime panels and reviewer surfaces create repeated reads
- wallet UX should stay focused on signing, not on carrying all indexing pressure
- MagicBlock and reviewer surfaces can query runtime state without routing every heavy read through the browser

## Mainnet recommendation

For mainnet readiness, use:

1. same-domain frontend and read node
2. pooled authenticated RPCs behind the read node
3. direct frontend RPC as emergency fallback only
4. monitoring over:
   - rate limits
   - stale blockhash incidents
   - slot lag
   - gRPC stream reconnects
   - Testnet rehearsal health
   - request latency
   - read-node route metrics

## Not in scope

This read node is not:

- a signer
- a treasury operator
- a custody surface
- a hidden execution relay

It is a read-heavy resilience layer designed to keep governance UX and reviewer surfaces stable under load.
