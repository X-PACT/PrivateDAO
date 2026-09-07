# Confidential Auction Devnet Certification

Status: `DEVNET POC PASS; FULL CERTIFICATION PENDING`

## Latest validated PoC

The self-contained delegated-session workaround passed a real Devnet flow on
2026-08-11. Two independent bidder wallets submitted bids through the TEE;
close, finalize, commit/undelegate, receipt persistence, and the tamper check
completed successfully. Full certification remains pending until the browser
receipt surface, negative-test suite, and deterministic certification command
are run against this revision.

Evidence: `docs/magicblock/MAGICBLOCK_AUCTION_POC_20260811.md`.

## Verified local implementation

- `programs/privatedao-auction/src/lib.rs` now declares `SubmitPrivateBid.config` read-only.
- `target/idl/privatedao_auction.json` was regenerated with `config` read-only for `submit_private_bid`.
- The standalone SBF build succeeds after cleaning `target/sbpf-solana-solana`.
- Local artifact: `target/deploy/privatedao_auction.so`.
- Local artifact size: `435920` bytes.
- Local artifact SHA-256: `e049ce9ef5b074746f0a0e635e78b37730dd379d5039d0afc7ba1d005af7546c`.
- Deployed program: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`.
- The Devnet dump contains the complete local artifact as its prefix and 704 bytes of existing account padding; `cmp -n 435920` passes.
- SDK: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2` / Rust `ephemeral-rollups-sdk@0.16.2`.

## Differential evidence

Fresh auction/session state was created for each run. The same account order was used:

1. bidder: signer, read-only
2. config: read-only
3. session: writable
4. authorization: read-only

Base Layer simulation with that exact read-only configuration succeeds:

```text
Instruction: SubmitPrivateBid
consumed 6658 of 200000 compute units
success
```

TEE execution through both `https://devnet-tee.magicblock.app` and the official regional `https://devnet-tee-as.magicblock.app` fails before the handler:

```text
Anchor error code: 2000
Error message: A mut constraint was violated
```

The same TEE session successfully completes delegation, authentication, `InitPermission`, permission polling, and `set_private`; permission data progresses from 68 to 167 bytes. TEE attestation and permission creation pass.

As a control, a temporary diagnostic transaction that changes only `config` to writable reaches the TEE handler and returns the real business error `DeadlinePassed` after the test window elapsed. This proves the TEE is interpreting the read-only metadata differently from Base; the diagnostic was removed from the normal E2E path.

## External blocker

MagicBlock Devnet TEE currently interprets the exact read-only `config` metadata as violating a mutable account constraint for `SubmitPrivateBid`, while Solana Devnet Base Layer accepts it and the local source/IDL agree. No further Rust metadata change is justified without weakening the intended account contract.

Evidence: `docs/magicblock/MAGICBLOCK_TEE_SUBMIT_PRIVATE_BID_BLOCKER_20260810.md`.

## Not certified

The following remain unverified because private bid execution cannot start:

- two-wallet private bid flow
- bid replay/unauthorized negative tests
- close/finalize/commit/undelegate after bids
- final Solana receipt reconciliation
- walletless public receipt verification
- complete Devnet certification

Do not claim Forge readiness or Mainnet readiness.
