# PrivateDAO Weekly Product Updates

These weekly videos are designed for product updates on YouTube, Loom, or Vimeo.

For public uploads, the canonical path is the narrated `weekly-youtube-ready` build, not the silent raw weekly card export.

## Format

- landscape 16:9
- silent raw exports for internal progress review
- narrated YouTube-ready exports for public upload
- under one minute each
- direct, reviewer-friendly update structure
- 36 seconds each
- ready for YouTube, Loom, or Vimeo upload
- for focused weekly reels, keep the first 30 to 45 seconds aligned with:
  - `docs/track-judge-first-openings.generated.md`
  - `docs/custody-proof-reviewer-packet.generated.md`

## Week 1

- file: `docs/assets/weekly-updates/private-dao-week-1-update.mp4`
- upload title:
  - `Week 1 - PrivateDAO - Private Governance Foundation`
- ready script:
  - [`docs/weekly-update-week-1-colosseum.md`](weekly-update-week-1-colosseum.md)
- focus:
  - private DAO governance thesis
  - public-vote leakage problem
  - commit-reveal Solana foundation
  - live frontend and PDAO Devnet identity
  - reviewer-ready product direction

## Week 2

- raw file: `docs/assets/weekly-updates/private-dao-week-2-update.mp4`
- upload title:
  - `Week 2 - PrivateDAO - Guided Governance And Agentic Treasury Rail`
- narrated upload-ready file:
  - `docs/assets/weekly-youtube-ready/Week 2 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4`
- ready script:
  - [`docs/weekly-update-week-2-colosseum.md`](weekly-update-week-2-colosseum.md)
- focus:
  - live governance product
  - commit-reveal lifecycle
  - agentic treasury micropayment rail
  - judge-first screenshots and runtime proof
  - private governance positioned as a real operating surface

## Week 3

- file: `docs/assets/weekly-updates/private-dao-week-3-update.mp4`
- upload title:
  - `Week 3 - PrivateDAO - Confidential Treasury Operations`
- focus:
  - confidential payroll and bonus approvals
  - `MagicBlock` private payment corridors
  - `REFHE`-gated settlement
  - backend read node and operator metrics
  - preparation for scale and audit-oriented review

## Week 4

- file: `docs/assets/weekly-updates/private-dao-week-4-update.mp4`
- upload title:
  - `Week 4 - PrivateDAO - Audit Readiness And Mainnet Path`
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

- `Week 1 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4`
- `Week 1 - PrivateDAO Frontier Hackathon - YouTube Ready-poster.png`
- `Week 2 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4`
- `Week 2 - PrivateDAO Frontier Hackathon - YouTube Ready-poster.png`
- `Week 3 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4`
- `Week 3 - PrivateDAO Frontier Hackathon - YouTube Ready-poster.png`
- `Week 4 - PrivateDAO Frontier Hackathon - YouTube Ready.mp4`
- `Week 4 - PrivateDAO Frontier Hackathon - YouTube Ready-poster.png`

## Render Command

```bash
cd /home/x-pact/PrivateDAO
bash scripts/render-weekly-update-videos.sh
bash scripts/render-weekly-youtube-ready.sh 2
```

## Judge-First Openings

Use this generated document when recording or editing weekly videos so the opening matches the live judge-first top strip:

- [`docs/track-judge-first-openings.generated.md`](track-judge-first-openings.generated.md)

## Verification Command

```bash
cd /home/x-pact/PrivateDAO
npm run verify:weekly-updates
npm run verify:weekly-youtube-ready
```
