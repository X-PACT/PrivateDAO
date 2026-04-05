# ZK-Enforced Runtime Evidence

`zk_enforced` should not become the stronger production-grade recommendation until runtime evidence exists for the actual end-to-end path.

## Required Runtime Path

Each successful capture should prove:

1. wallet connects on Devnet
2. proposal is selected
3. receipts exist for vote, delegation, and tally
4. `Enable ZK-Enforced` succeeds
5. proposal finalizes through the `zk_enforced` path
6. explorer links and proposal state reflect the upgraded path

## Wallet Matrix

Required environments:

- Phantom desktop
- Solflare desktop
- Backpack desktop
- Glow desktop
- Android runtime

## Required Evidence

Each successful runtime record should include:

- wallet label
- environment
- proposal public key
- policy PDA
- tx signature for mode activation
- tx signature for finalize
- explorer links

## Current Boundary

The repository already has:

- diagnostics
- wallet compatibility matrix
- runtime evidence
- real-device capture intake

What still remains is the actual `zk_enforced` runtime capture set, not more speculative documentation.
