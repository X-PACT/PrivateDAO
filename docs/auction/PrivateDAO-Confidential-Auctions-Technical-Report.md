# PrivateDAO Confidential Auctions
## Technical Report | MagicBlock Devnet E2E

**Prepared:** 5 September 2026  
**Product:** PrivateDAO Sealed Auctions  
**Environment:** Solana Devnet + MagicBlock Devnet TEE  
**Status:** Devnet production-path evidence complete; Mainnet release not claimed

## Executive Summary

PrivateDAO Confidential Auctions lets an organizer collect bids without exposing live bidding pressure, then close the auction, select a winner, commit the result, and issue a durable Solana receipt. The private execution lane uses MagicBlock delegation and TEE execution. A separate Groth16 outcome-proof layer binds a private bid witness to the finalized auction result commitment.

The latest clean run completed the full path with two independent temporary bidder wallets:

`initialize -> authorize -> activate -> delegate -> private permission -> private bids -> close -> finalize -> commit/undelegate -> receipt`

## System Components

### On-chain auction program

- Program: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Source: `programs/privatedao-auction/src/lib.rs`
- Network tested: Solana Devnet
- Core accounts: auction configuration, delegated auction session, bidder authorization, settlement receipt
- Result commitment: SHA-256 commitment over auction identity, rules, policy, winner commitment, winning amount, bid count, and deadline

### MagicBlock execution lane

- TEE endpoint: `https://devnet-tee.magicblock.app`
- Validator used: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`
- SDK recorded in the repository: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2`
- The session is delegated from the base layer, made private through the permission program, executed in the TEE, and committed back before undelegation.

### Groth16 outcome proof

- Circuit: `private_dao_auction_outcome`
- Maximum witness size: eight bids
- Public signals: auction ID, rules digest, policy digest, winner commitment, winning amount, bid count, deadline, result commitment
- Private witness: bidder commitments and bid amounts
- API generation: `POST /api/auctions/sealed/outcome-proof`
- API verification: `POST /api/auctions/sealed/outcome-proof/verify`
- Proof system: Circom + Groth16 + `snarkjs`

The circuit proves that the disclosed winner is present in the private witness, has the disclosed winning amount, is the unique maximum, and that inactive slots are empty. The application recomputes the exact on-chain result commitment before accepting the proof.

## Certification Blocker And Resolution

The observed blocker was stale client metadata, not a required weakening of the Rust account contract. The old IDL referenced a previous program identity, included obsolete `config` accounts for close/finalize, and marked `magic_context` read-only. Those mismatches caused TEE errors such as `A mut constraint was violated` and account discriminator failures.

The resolution was to align the deployed client metadata with the current source:

1. Use program `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`.
2. Use only `session + authority` for close and finalize.
3. Mark `magic_context` writable for commit/undelegate.
4. Keep bidder authorization and private-bid account semantics unchanged.
5. Keep temporary bidder funding configurable and outside the repository.

This preserves the intended account validation instead of hiding the problem by making unrelated accounts mutable.

## Verified E2E Evidence

- Auction: `AV2nNtJvjLxM1ZUxsTn6YSbyrLNcGpap3dPuCuf9byZk`
- Receipt account: `BfZcGZR23P9HTeEAYioRmxK7oYLE4T3L7iAM9UDbhMj7`
- Commit signature: `2v3sM6fYNqQgBCTWmW6MsS3j8UzykZeh5mAoTT66a3VhKWKVGsNfWABxtZzPApFwdV4N15JvE8RKbfy87iDQ1Hf3`
- Receipt finalization signature: `2QMZHgTr458SYis4cD9aiGYDzj4kvaiQk21ipPFsaeH6KSw4joHeGgEPLDCER79DvjtR9eioMCkDT99Vs2PvoBYY`
- Commitment status: `finalized`
- TEE attestation: verified
- Public receipt account: present
- Private bids: two submitted successfully
- Reconciliation: successful

The actual outcome witness was checked against the receipt commitment, then Groth16 proving and verification succeeded. A tampered public signal was rejected with `Invalid proof`.

## Security And Privacy Boundaries

- Bid amounts and salts are not included in the public receipt.
- Temporary bidder keypairs are created outside the repository and removed after the E2E run.
- The ZK proof exposes commitments and outcome claims, not the private bid witness.
- Receipt verification checks durable account state and transaction finality rather than trusting client-submitted JSON.
- No Mainnet funds, token transfers, swaps, or treasury authority changes were used in this certification run.

## Repository Deliverables

- `programs/privatedao-auction/src/lib.rs`
- `apps/web/src/lib/auction-outcome-proof.ts`
- `apps/web/src/app/api/auctions/sealed/outcome-proof/route.ts`
- `apps/web/src/app/api/auctions/sealed/outcome-proof/verify/route.ts`
- `scripts/run-auction-devnet-e2e.mjs`
- `scripts/run-auction-devnet-e2e.sh`
- `scripts/zk/generate-auction-outcome-from-witness.mjs`
- `zk/circuits/private_dao_auction_outcome.circom`

## Release Boundary

This is a verified Devnet implementation and a MagicBlock runtime certification path. It is not a Mainnet launch claim, an on-chain Groth16 verifier claim, or an independent security audit. Before Mainnet, the program and client metadata require a formal release review, fresh deployment verification, negative-test expansion, operational monitoring, and external security review.

## References

- PrivateDAO auction product: https://privatedao.org/auctions
- Public receipt verifier: https://privatedao.org/verify/auction
- MagicBlock TEE authorization: https://docs.magicblock.gg/pages/tools/tee/authorization
- MagicBlock program implementation: https://docs.magicblock.gg/pages/tools/tee/program-implementation
