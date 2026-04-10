# PrivateDAO Weekly Video Updates

These weekly videos are designed for hackathon update submissions on YouTube, Loom, or Vimeo.

## Format

- landscape 16:9
- silent by default
- under one minute each
- direct, judge-friendly update structure
- 36 seconds each
- ready for YouTube, Loom, or Vimeo upload

## Week 1

- file: `docs/assets/weekly-updates/private-dao-week-1-update.mp4`
- upload title:
  - `Week 1 - PrivateDAO Frontier Hackathon - Private Governance Foundation`
- ready script:
  - [`docs/weekly-update-week-1-colosseum.md`](weekly-update-week-1-colosseum.md)
- focus:
  - private DAO governance thesis
  - public-vote leakage problem
  - commit-reveal Solana foundation
  - live frontend and PDAO Devnet identity
  - reviewer-ready product direction

## Week 2

- file: `docs/assets/weekly-updates/private-dao-week-2-update.mp4`
- upload title:
  - `Week 2 - PrivateDAO Frontier Hackathon - Live Private Governance And ZK Hardening`
- focus:
  - live governance product
  - commit-reveal lifecycle
  - `zk_enforced` hardening
  - runtime and backend read path
  - private governance positioned as a real operating surface

## Week 3

- file: `docs/assets/weekly-updates/private-dao-week-3-update.mp4`
- upload title:
  - `Week 3 - PrivateDAO Frontier Hackathon - Confidential Treasury Operations`
- focus:
  - confidential payroll and bonus approvals
  - `MagicBlock` private payment corridors
  - `REFHE`-gated settlement
  - backend read node and operator metrics
  - preparation for scale and audit-oriented review

## Week 4

- file: `docs/assets/weekly-updates/private-dao-week-4-update.mp4`
- upload title:
  - `Week 4 - PrivateDAO Frontier Hackathon - Audit Readiness And Mainnet Path`
- focus:
  - 50-wallet Devnet rehearsal
  - additive Governance Hardening V3 and Settlement Hardening V3 proof
  - reviewer-visible evidence surfaces
  - go-live blockers
  - mainnet direction and product maturity
  - honest boundary between in-repo completion and external execution

## Desktop Export

The same videos are also copied into:

- `/home/x-pact/Desktop/PrivateDAO-Weekly-Updates`

The Desktop folder contains:

- `Week 1 - PrivateDAO Frontier Hackathon - Private Governance Foundation.mp4`
- `Week 1 - PrivateDAO Frontier Hackathon - Private Governance Foundation - Poster.png`
- `Week 2 - PrivateDAO Frontier Hackathon - Live Private Governance And ZK Hardening.mp4`
- `Week 2 - PrivateDAO Frontier Hackathon - Live Private Governance And ZK Hardening - Poster.png`
- `Week 3 - PrivateDAO Frontier Hackathon - Confidential Treasury Operations.mp4`
- `Week 3 - PrivateDAO Frontier Hackathon - Confidential Treasury Operations - Poster.png`
- `Week 4 - PrivateDAO Frontier Hackathon - Audit Readiness And Mainnet Path.mp4`
- `Week 4 - PrivateDAO Frontier Hackathon - Audit Readiness And Mainnet Path - Poster.png`

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
