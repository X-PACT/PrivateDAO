# Legacy MagicBlock Private Payments

The repository contains an older MagicBlock private-payments corridor that
predates the standalone `privatedao-auction` product. It is retained for
rollback and for existing PrivateDAO runtime references, but it is not part of
the auction product, its execution path, or its public product claims.

## Status

- Auction implementation: active under `programs/privatedao-auction/`.
- Legacy payments scripts and evidence: preserved in place for compatibility.
- Legacy payments UI route: historical and not a dependency of the auction.
- New auction runtime: uses the dedicated auction program and the
  `@magicblock-labs/ephemeral-rollups-sdk` dependency.

The legacy files must only be removed after a separate dependency and rollback
review confirms that no existing PrivateDAO service uses them.
