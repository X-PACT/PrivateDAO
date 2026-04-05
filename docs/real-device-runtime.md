# Real-Device Runtime QA

PrivateDAO treats wallet compatibility as a runtime property, not a documentation claim.

This package defines how real-device wallet QA must be captured before any strong mainnet-readiness language should be used.

## Why This Exists

Repository-side diagnostics, wallet matrices, and Devnet canaries are useful, but they do not prove that real wallet releases behave correctly on real browsers, operating systems, and mobile environments.

Real-device runtime QA exists to close that gap.

## Canonical Capture Targets

Capture runs should cover at minimum:

- Phantom on desktop browser
- Solflare on desktop browser
- Backpack on desktop browser
- Glow on desktop browser
- Android-native or mobile browser path when available

## Required Per-Capture Fields

Each capture should record:

- wallet label
- wallet version when visible
- environment type
- operating system
- browser or client name
- network
- connect result
- signing result
- submission result
- diagnostics snapshot presence
- transaction signature when a Devnet transaction was successfully submitted
- explorer URL when a Devnet transaction was successfully submitted
- error message when any step fails
- evidence refs for screenshots or recordings when available

## Minimum Flow

Each runtime target should attempt:

1. connect wallet
2. confirm diagnostics visibility
3. sign or send a transaction on Devnet
4. record explorer-visible outcome or error

## Registry Source

The source registry for these captures is:

- `docs/real-device-runtime-captures.json`

The generated reviewer-facing outputs are:

- `docs/real-device-runtime.generated.json`
- `docs/real-device-runtime.generated.md`

## Honest Boundary

The repository now provides a formal intake, builder, verifier, and reviewer surface for real-device wallet QA.

It does not fabricate successful device runs that were not actually captured.
