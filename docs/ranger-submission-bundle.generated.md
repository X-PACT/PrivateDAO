# Ranger Submission Bundle

## Strategy Identity

- Name: PrivateDAO Governance-Controlled USDC Strategy
- Tracks: main-track, drift-side-track
- Base asset: USDC
- Target APY: 12%
- Tenor: 3 months rolling
- Yield sources: basis, delta_neutral, funding_rate

## Governance-Control Plane

PrivateDAO provides the governance and risk-control layer for this strategy:

- private committee approvals
- commit-reveal voting
- timelocked execution
- veto and cancellation paths
- explorer-verifiable governance proof

## Risk Controls

- Max drawdown: 8%
- Max position size: 25%
- Max venue exposure: 45%
- Rebalance cadence: daily-with-emergency-override
- Emergency stop: enabled
- Health-rate floor: 1.1

## Evidence Surface

- Pitch video: provided
- Strategy documentation: provided
- Code repository: provided
- Live performance: not provided
- Backtest evidence: provided

## On-chain Verification

- Verification address: REPLACE_WITH_REAL_HACKATHON_WALLET
- Build-window verified: no
- Live governance proof: docs/live-proof.md
- Program: https://solscan.io/account/5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx?cluster=devnet
- Live app: https://x-pact.github.io/PrivateDAO/

## Supporting Docs

- Config source: ranger-strategy-config.sample.json
- Ranger strategy documentation: docs/ranger-strategy-documentation.md
- Ranger checklist: docs/ranger-submission-checklist.md
- Judge audit note: docs/judge-technical-audit.md
- Main Track memo: docs/ranger-main-track.md
- Drift Track memo: docs/ranger-drift-track.md

## Notes

This generated bundle is meant to reduce inconsistency between strategy claims, risk framing, and proof links. It should be regenerated whenever the strategy config changes.
