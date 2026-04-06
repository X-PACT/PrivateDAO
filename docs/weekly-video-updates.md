# PrivateDAO Weekly Video Updates

These weekly videos are designed for hackathon update submissions on YouTube, Loom, or Vimeo.

## Format

- landscape 16:9
- silent by default
- under one minute each
- direct, judge-friendly update structure
- 36 seconds each
- ready for YouTube, Loom, or Vimeo upload

## Week 2

- file: `docs/assets/weekly-updates/private-dao-week-2-update.mp4`
- focus:
  - live governance product
  - commit-reveal lifecycle
  - `zk_enforced` hardening
  - runtime and backend read path
  - private governance positioned as a real operating surface

## Week 3

- file: `docs/assets/weekly-updates/private-dao-week-3-update.mp4`
- focus:
  - confidential payroll and bonus approvals
  - `MagicBlock` private payment corridors
  - `REFHE`-gated settlement
  - backend read node and operator metrics
  - preparation for scale and audit-oriented review

## Week 4

- file: `docs/assets/weekly-updates/private-dao-week-4-update.mp4`
- focus:
  - 350-wallet wave plan
  - reviewer-visible evidence surfaces
  - go-live blockers
  - mainnet direction and product maturity
  - honest boundary between in-repo completion and external execution

## Desktop Export

The same videos are also copied into:

- `/home/x-pact/Desktop/PrivateDAO-Weekly-Updates`

The Desktop folder contains:

- `private-dao-week-2-update.mp4`
- `private-dao-week-2-update-poster.png`
- `private-dao-week-3-update.mp4`
- `private-dao-week-3-update-poster.png`
- `private-dao-week-4-update.mp4`
- `private-dao-week-4-update-poster.png`

## Render Command

```bash
cd /home/x-pact/PrivateDAO
bash scripts/render-weekly-update-videos.sh
```

## Verification Command

```bash
cd /home/x-pact/PrivateDAO
npm run verify:weekly-updates
```
