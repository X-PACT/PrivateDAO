# Forge Evidence Pack

This file is the evidence index for the standalone Confidential Auction product. It must be populated only from executed development-network runs.

Required evidence:

- compiled program path, byte size, and SHA-256
- deployed program ID and deployment transaction
- delegation and permission transactions
- independent creator, bidder A, and bidder B wallet addresses
- proof that base-layer state does not expose private bid amounts while active
- finalization and commit/undelegation transactions
- receipt account and public walletless verification URL
- signature status, slot, cluster, and explorer links
- negative-test output for authorization, deadline, replay, duplicate, and forged receipt cases
- Groth16 status: `NOT_ENABLED` until a dedicated auction circuit is proven

No evidence entry may be filled with a simulated signature or a documentation-only claim.

## Verified development evidence

- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Cluster: Solana Devnet
- Deployment transaction: `2ssA3mcqnFt4JFSTjxDx2v4XhT4rPfnxs4w87N3hCqTKoumc9QbEhJSJrtqXPMYfoQ7Lt6GdixkyxdFsvBiNsAmA`
- Deployment explorer: https://explorer.solana.com/tx/2ssA3mcqnFt4JFSTjxDx2v4XhT4rPfnxs4w87N3hCqTKoumc9QbEhJSJrtqXPMYfoQ7Lt6GdixkyxdFsvBiNsAmA?cluster=devnet
- Deployed program data length observed from Devnet: `522400` bytes
- Current optimized local artifact: `target/deploy/privatedao_auction.so`, `436624` bytes, SHA-256 `115bf6b2e8497f08986d6f067e76fb65435ecdf062b796a43ac16315c8b06449`.
- Confirmed runtime observation: fresh Devnet runs complete initialize, authorization, activation, delegation, strict TEE attestation, and wallet authentication. The explicit init-permission wire instruction is preserved through signing, but the TEE reports it as `SubmitPrivateBid` and fails with `InvalidWritableAccount`.

## Differential reproduction result

`scripts/reproduce-magicblock-init-permission.mjs` created a fresh auction/session and sent the same `InitPermission` instruction to Base simulation and the authenticated TEE. Both sides received discriminator `420e99fabb24b3ec`, program ID `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`, and identical ordered account metas. Base logged `Instruction: InitPermission`; TEE logged `Instruction: InitPermission`, created the ephemeral permission account, and returned success. This differential test found no current TEE dispatch blocker.

The product remains `NOT_CERTIFIED` until the separate two-wallet private-bid, finalization, commit/undelegation, receipt, and walletless verification gates pass.
