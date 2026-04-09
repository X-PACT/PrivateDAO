# Wallet Runtime Compatibility

PrivateDAO is prepared for real wallet-based review and operator use on Devnet, but wallet compatibility is treated as a runtime property that must be observable rather than assumed.

## Supported Runtime Surface

The current browser surface detects and works with injected Solana wallet providers such as:

- Phantom
- Solflare
- Backpack
- Glow
- compatible injected providers exposed through `window.solana`

## Why This Matters

For a governance product, wallet behavior is part of the security surface.

If provider detection, signing, or transaction broadcast paths are brittle, reviewers will correctly treat the product as operationally weak even if the protocol logic is solid.

## Current Browser-Side Protections

The current frontend hardening includes:

- provider-specific detection and fallback resolution
- connection-path fallback across `connect`, `request`, and `enable`
- wallet public-key extraction across multiple provider response shapes
- delayed public-key readiness polling after connection so injected providers have time to expose the selected account
- transaction-path fallback across:
  - `sendTransaction`
  - `signAndSendTransaction`
  - `signTransaction`
- runtime session rehydration
- disconnect and account-change handling
- interactive diagnostics for provider and RPC visibility

## Diagnostics Entry Point

Use the live diagnostics page:

- `https://x-pact.github.io/PrivateDAO/?page=diagnostics`

This surface exposes:

- connected provider identity
- connected public key
- detected provider states
- runtime wallet capabilities
- browser capability flags
- current RPC health
- canonical program and PDAO anchors

## Compatibility Matrix

The repository now also publishes a generated wallet compatibility matrix:

- `docs/wallet-compatibility-matrix.generated.md`
- `docs/wallet-compatibility-matrix.generated.json`

This makes the supported wallet surface reviewer-visible in a structured way instead of leaving it implied by scattered UI text.

## Real-Device Runtime Intake

Repository-side diagnostics are no longer the only runtime-facing proof surface.

PrivateDAO now publishes a real-device runtime intake package:

- `docs/runtime/real-device.md`
- `docs/runtime/real-device-captures.json`
- `docs/runtime/real-device.generated.md`
- `docs/runtime/real-device.generated.json`

This keeps desktop and mobile wallet QA tied to a canonical capture registry instead of leaving that work as an informal future note.

## Sustained Runtime Signal

The repository also publishes a read-only Devnet operational canary:

- `docs/devnet-canary.generated.md`
- `docs/devnet-canary.generated.json`

This canary is intentionally lighter than the multi-wallet stress harness. It exists to provide a sustainable operational signal for RPC health and canonical Devnet anchor visibility between heavier stress runs.

## Runtime Connection To Additive Hardening

Wallet compatibility matters even more for the additive hardening path, because the stricter proposal lifecycle still depends on normal wallet-based signing and broadcast.

When validating that stricter path, pair wallet runtime evidence with:

- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/governance-hardening-v3.md`
- `docs/settlement-hardening-v3.md`

This keeps runtime QA connected to the exact governance and settlement hardening flows rather than treating wallet checks as a separate surface.

## Honest Boundary

The repository can harden wallet logic and diagnostics, but it cannot claim universal compatibility for every wallet release on every platform without real runtime testing.

That is why the browser surface now exposes diagnostics directly instead of hiding wallet assumptions behind static text.
