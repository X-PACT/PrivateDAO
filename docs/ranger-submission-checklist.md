# Ranger Submission Checklist

## Mandatory assets

- pitch video
- strategy documentation
- verifiable code repository
- on-chain wallet or vault address used during the hackathon window

## Eligibility checks

- base asset is `USDC`
- target APY is `>= 10%`
- tenor is `3 months`
- tenor is rolling
- no ponzi-like YBS exposure
- no junior tranche / insurance pool design
- no DEX LP vault exposure
- no looping design below `1.05` health rate

## Risk checks

- drawdown limit stated
- position sizing limit stated
- venue concentration limit stated
- rebalance policy stated
- emergency stop path stated

## Verification checks

- build-window activity address recorded
- explorer links collected
- live or backtest evidence attached
- Drift proof attached if submitting to Drift Side Track

## Repo commands

Validate the strategy package:

```bash
npm run validate:ranger-strategy -- docs/ranger-strategy-config.sample.json
```

Open the governance proof:

```bash
npm run live-proof
```
