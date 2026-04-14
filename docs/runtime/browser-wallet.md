# Browser-Wallet Runtime QA

PrivateDAO treats browser-wallet behavior as a runtime property that must be captured, not inferred from shipped code.

This package defines how browser-wallet captures should be recorded before stronger browser-side runtime claims are made for the live governance lane.

## Why This Exists

The web app now ships live wallet-first governance actions, but that only proves implementation and build correctness.

It does not by itself prove that real injected wallets on real desktop browsers complete the lifecycle correctly.

Browser-wallet runtime QA exists to close that gap without overstating the current surface.

## Canonical Capture Targets

Capture runs should cover at minimum:

- Phantom browser wallet
- Solflare browser wallet
- Backpack browser wallet
- Glow browser wallet

## Required Per-Capture Fields

Each capture should record:

- wallet label
- wallet version when visible
- environment type
- operating system
- browser or client name
- network
- actions covered
- connect result
- signing result
- submission result
- diagnostics snapshot presence
- transaction signature when a Devnet transaction was successfully submitted
- explorer URL when a Devnet transaction was successfully submitted
- error message when any step fails
- evidence refs for screenshots or recordings when available

## Minimum Flow

Each browser-wallet target should attempt:

1. connect wallet
2. confirm diagnostics visibility
3. run at least one live governance action on Devnet
4. record explorer-visible outcome or error

## Registry Source

The source registry for these captures is:

- `docs/runtime/browser-wallet-captures.json`

Starter templates are available in:

- `docs/runtime/templates/phantom-browser-wallet.json`
- `docs/runtime/templates/solflare-browser-wallet.json`
- `docs/runtime/templates/backpack-browser-wallet.json`
- `docs/runtime/templates/glow-browser-wallet.json`
- `docs/runtime/templates/README.md`

The generated reviewer-facing outputs are:

- `docs/runtime/browser-wallet.generated.json`
- `docs/runtime/browser-wallet.generated.md`

## Fast Capture Workflow

1. Run the wallet flow in the live web app on Devnet.
2. Save a small JSON payload for the target.
3. Record it with:

```bash
npm run record:browser-wallet-runtime -- /path/to/capture.json
npm run build:browser-wallet-runtime
npm run verify:browser-wallet-runtime
```

## Clean Capture Baseline

When browser-wallet evidence is captured from `/command-center`, the lane must start from a genuinely clean state.

`Reset session` now clears both:

- `privatedao-governance-session`
- `privatedao:service-handoff`

This matters because the governance session alone was not enough; a persisted handoff could silently rehydrate a payload-driven execution lane and contaminate `Create DAO` browser captures.

## Minimal Capture Payload Example

```json
{
  "id": "phantom-browser-wallet",
  "walletLabel": "Phantom",
  "walletVersion": "example-version",
  "environmentType": "desktop-browser",
  "os": "macOS 15",
  "browserOrClient": "Chrome 136",
  "network": "devnet",
  "actionsCovered": [
    "Create DAO"
  ],
  "connectResult": "success",
  "signingResult": "success",
  "submissionResult": "success",
  "diagnosticsSnapshotCaptured": true,
  "txSignature": "example-devnet-signature-from-browser-wallet-run",
  "errorMessage": null,
  "evidenceRefs": [
    "screenshots/phantom-browser-wallet-create-dao.png"
  ],
  "capturedAt": "2026-04-14T00:00:00.000Z"
}
```

## Honest Boundary

The repository now provides a formal intake, builder, verifier, and reviewer surface for browser-wallet runtime QA.

It does not fabricate successful browser-wallet runs that were not actually captured.
