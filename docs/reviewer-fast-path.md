# Reviewer Fast Path

This is the shortest high-signal path for a judge, auditor, or technical reviewer.

## Two-Minute Review

1. Open the live Security surface:
   - `https://x-pact.github.io/PrivateDAO/security/`
2. Open the live Proof Center:
   - `https://x-pact.github.io/PrivateDAO/proof/`
3. Open the dedicated V3 proof packet when you want the additive hardening path specifically:
   - `docs/test-wallet-live-proof-v3.generated.md`
   - `docs/governance-hardening-v3.md`
   - `docs/settlement-hardening-v3.md`
4. Open the custody truth path:
   - `docs/canonical-custody-proof.generated.md`
   - `docs/custody-proof-reviewer-packet.generated.md`
   - `docs/launch-trust-packet.generated.md`
5. Confirm the canonical devnet identity:
   - Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
   - Verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
6. Read the audit summary:
   - `docs/security-review.md`

## Five-Minute Review

1. Read the formal threat framing:
   - `docs/threat-model.md`
2. Read the threat-to-test mapping:
   - `docs/security-coverage-map.md`
3. Read failure-path expectations:
   - `docs/failure-modes.md`
4. Read replay resistance analysis:
   - `docs/replay-analysis.md`
5. Inspect the strict custody ingestion route:
   - `docs/production-custody-ceremony.md`
   - `docs/multisig-setup-intake.md`
   - `npm run apply:custody-evidence-intake`
6. Inspect the strongest lifecycle tests:
   - `tests/private-dao.ts`
   - `tests/full-flow-test.ts`

## Verification Commands

If you want one command:

```bash
npm run verify:all
```

If you want the verification breakdown:

- `docs/verification-gates.md`

## Live Proof Anchors

- `docs/live-proof.md`
- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/governance-hardening-v3.md`
- `docs/settlement-hardening-v3.md`
- `docs/devnet-release-manifest.md`
- `docs/proof-registry.json`
- `docs/independent-verification.md`

## Reviewer Bundle

If you want a packaged handoff surface:

```bash
npm run build:review-bundle
```
