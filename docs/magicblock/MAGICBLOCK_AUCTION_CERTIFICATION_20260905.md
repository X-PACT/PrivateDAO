# PrivateDAO Auction Certification Evidence - 2026-09-05

## Scope

Devnet-only production-path evidence for the PrivateDAO sealed auction program. The game, website routes, treasury, and unrelated products were not changed.

## Root Cause And Fix

The runtime blocker was stale client metadata, not the current Rust account constraints. The checked-in IDL still referenced the old program identity `F4qypnqqAN59H9N7DN3MmRfZ2ECkpqEUXQT2FkfqHh1d`, included obsolete `config` accounts for close/finalize, and marked `magic_context` read-only. The current program is `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`.

The IDL and auction client were aligned with the deployed source: close/finalize use `session + authority`, and commit/undelegate marks `magic_context` writable. The E2E harness now funds temporary bidders with `AUCTION_BIDDER_FUNDING_SOL` (default `0.01`) and does not retain their keys.

## Verified Devnet Run

- Program: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Auction: `AV2nNtJvjLxM1ZUxsTn6YSbyrLNcGpap3dPuCuf9byZk`
- Receipt: `BfZcGZR23P9HTeEAYioRmxK7oYLE4T3L7iAM9UDbhMj7`
- Final commit: `2v3sM6fYNqQgBCTWmW6MsS3j8UzykZeh5mAoTT66a3VhKWKVGsNfWABxtZzPApFwdV4N15JvE8RKbfy87iDQ1Hf3`
- Receipt finalization: `2QMZHgTr458SYis4cD9aiGYDzj4kvaiQk21ipPFsaeH6KSw4joHeGgEPLDCER79DvjtR9eioMCkDT99Vs2PvoBYY`
- Commitment: `finalized`
- Public receipt account: present
- TEE attestation: verified
- Two private bids: submitted successfully
- Close and private finalize: successful
- Reconciliation: successful

## ZK Outcome Proof

`private_dao_auction_outcome` is a Groth16 circuit for a fixed maximum of eight bids. The real Devnet witness was bound to the receipt's result commitment, proved with the generated WASM/zkey, and verified with the circuit verification key. A tampered public signal was rejected with `Invalid proof`.

The proof currently verifies server-side with `snarkjs` and is bound to the existing on-chain result commitment. This is not an on-chain Groth16 verifier program; deploying one would be a separate protocol change.

## Files

- `zk/circuits/private_dao_auction_outcome.circom`
- `apps/web/src/lib/auction-outcome-proof.ts`
- `apps/web/src/app/api/auctions/sealed/outcome-proof/route.ts`
- `apps/web/src/app/api/auctions/sealed/outcome-proof/verify/route.ts`
- `scripts/zk/generate-auction-outcome-from-witness.mjs`
- `scripts/run-auction-devnet-e2e.sh`
- `scripts/run-auction-devnet-e2e.mjs`

## Limits

This evidence is Devnet runtime certification for the current MagicBlock path. It does not claim Mainnet readiness, an on-chain Groth16 verifier, or an external security audit.
