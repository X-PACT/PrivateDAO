<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Browser Automation Audit

PrivateDAO now includes a lightweight browser-smoke gate for the live static frontend. The goal is not to replace real wallet QA; it is to prevent reviewer-facing UI regressions before real-device capture.

## Scope

The automated browser audit covers:

- loading the published root Next.js surface through a local static HTTP server
- rendering through a Chrome-compatible headless browser
- confirming the Confidential Treasury Command Center is present in the DOM
- confirming the guided flow actions and evidence-copy surface exist
- capturing a browser screenshot and rejecting unexpectedly small output

The gate is intentionally read-only. It does not sign transactions, does not use wallet secrets, and does not claim real-device wallet coverage.

## Command

```bash
npm run verify:browser-smoke
```

This command is also included in:

```bash
npm run verify:all
```

## Browser Runtime

The local machine currently exposes a Chrome-compatible executable at:

```text
/usr/bin/google-chrome
```

That path resolves to the installed Brave browser instead of a separately downloaded Google Chrome build. This keeps the automation stable without adding a large browser installation during active development.

If the environment changes, set:

```bash
export CHROME_PATH=/path/to/chrome-compatible-browser
```

## Required Frontend Evidence

The automated smoke check fails if the rendered DOM does not include the core Command Center evidence:

- `CONFIDENTIAL TREASURY COMMAND CENTER`
- `One guided path from private approval to evidence-gated execution.`
- `Start Guided Flow`
- `Copy Judge Evidence Packet`
- `openConfidentialTreasuryWizard`
- `copyConfidentialTreasuryEvidencePacket`
- `Paste real hashes before signing.`
- `mainnet-blocked`

## Security Boundary

This audit proves that the browser can load and render the guided reviewer/operator surface. It does not prove:

- Phantom, Solflare, Backpack, or Glow signing behavior
- Android Mobile Wallet Adapter behavior
- successful Devnet wallet transaction execution from a real browser
- production monitoring readiness
- external audit completion
- real-funds mainnet launch readiness

Those remain covered by the real-device runtime intake, wallet E2E plan, launch-ops checklist, and mainnet blockers.

## Related Evidence

- [`wallet-e2e-test-plan.md`](wallet-e2e-test-plan.md)
- [`runtime/real-device.md`](runtime/real-device.md)
- [`runtime/real-device.generated.md`](runtime/real-device.generated.md)
- [`launch-ops-checklist.md`](launch-ops-checklist.md)
- [`mainnet-blockers.md`](mainnet-blockers.md)
