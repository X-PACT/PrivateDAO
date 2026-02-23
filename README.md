# PrivateDAO

<<<<<<< ours
PrivateDAO is a Solana/Anchor governance protocol that uses commit-reveal voting to keep ballots private until reveal time.

## Live demo
- GitHub Pages: https://x-pact.github.io/PrivateDAO/
- Frontend runtime config: `docs/config.json`

## What it is
PrivateDAO provides:
- hidden commit phase (`sha256(vote || salt || voter_pubkey)`)
- reveal phase with proof verification
- proposal finalization and timelocked execution
- DAO/proposal state accounts on Solana

## Why it matters
Public live voting enables vote buying, intimidation, and treasury front-running. Commit-reveal removes live tally visibility during voting.

## Architecture
- **Program**: `programs/private-dao/src/lib.rs`
- **Tests**: `tests/*.ts`
- **Frontend dApp**: `docs/index.html` + `docs/app.js`
- **Root HTML entry**: `privatedao-frontend.html`
- **Frontend config source of truth**: `docs/config.json`

## One-time GitHub setup (for automatic devnet deploy)
1. Generate a burner keypair locally:
   ```bash
   solana-keygen new --outfile devnet-deployer.json
   ```
2. Encode to base64:
   ```bash
   base64 -w 0 devnet-deployer.json
   ```
3. In GitHub repo settings:
   - Go to **Settings → Secrets and variables → Actions**
   - Create secret: `DEVNET_DEPLOYER_KEYPAIR_B64`
   - Paste the base64 output

## How to trigger deploy
- Open **Actions → Devnet Deploy → Run workflow**, or push changes to `main` under `programs/**`.
- Workflow installs pinned Solana/Anchor, builds, deploys, prints program ID, and updates `docs/config.json`.

## Where Program ID appears
- In Devnet Deploy workflow logs (`Program Id: ...`)
- In committed file `docs/config.json`
- In the demo header (`program: ...`)

## Demo guide
1. Open https://x-pact.github.io/PrivateDAO/
2. Connect Phantom.
3. Verify cluster is `devnet` and program status is `deployed`.
4. Browse DAO and proposal accounts.
5. Use real actions:
   - `create_proposal`
   - `commit_vote`
   - `reveal_vote`
   - `finalize_proposal`
   - `execute_proposal`
6. Each action returns a transaction signature with explorer link.

## Quickstart (local devnet)
```bash
yarn install
anchor build
anchor test
```

## Security considerations
- Never commit private keys.
- Use **GitHub Secrets** for deploy key material.
- Use a burner wallet for devnet deploy automation.
- Production governance should include key management policy and upgrade controls.

## Limitations
- Frontend commit/reveal salt is saved in browser local storage.
- `create_proposal` requires connected wallet to be DAO authority.
- Execution account routing for token transfers requires correct token accounts.

## Contributing
See `CONTRIBUTING.md`.

## Release process
See `RELEASE.md`.

## License
MIT License with attribution to the original author.
=======
[![Build](https://github.com/X-PACT/PrivateDAO/actions/workflows/build.yml/badge.svg)](https://github.com/X-PACT/PrivateDAO/actions/workflows/build.yml)
[![Test](https://github.com/X-PACT/PrivateDAO/actions/workflows/test.yml/badge.svg)](https://github.com/X-PACT/PrivateDAO/actions/workflows/test.yml)
[![Verify](https://github.com/X-PACT/PrivateDAO/actions/workflows/verify.yml/badge.svg)](https://github.com/X-PACT/PrivateDAO/actions/workflows/verify.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

Commit-reveal governance for Solana DAOs with Anchor.

**Demo (GitHub Pages):** `https://x-pact.github.io/PrivateDAO/`

## Overview

PrivateDAO prevents live vote manipulation by splitting governance into commit and reveal phases:

1. **Commit:** voters submit a hash of `(vote, salt, voter_pubkey)`.
2. **Reveal:** voters reveal vote and salt for verification.
3. **Finalize + Execute:** proposal passes/fails, then timelock and execution rules apply.

This repository ships:
- On-chain Anchor program (`programs/private-dao`)
- End-to-end tests (`tests/`)
- Devnet scripts (`scripts/`)
- GitHub Pages demo (`docs/index.html`)

## Architecture

```text
Wallet (Phantom)
   ↓
Demo UI / Scripts (TS)
   ↓
Anchor Program (private_dao)
   ├─ DAO account
   ├─ Proposal account
   ├─ VoterRecord account
   └─ Treasury execution (SOL / SPL)
```

Program ID (Devnet): `DnQTB3T6xWenyi7LYRsDADfqrKwGJntAaxStaePVkzhs`

## Quickstart Devnet

### 1) Toolchain

- Solana CLI `2.1.11`
- Anchor CLI `0.32.1`
- Node.js `20.18.0`

### 2) Build

```bash
yarn install --frozen-lockfile
anchor build
```

### 3) Deploy

```bash
solana config set --url devnet
solana airdrop 2
anchor deploy --provider.cluster devnet
```

### 4) Run core flow via scripts

```bash
yarn create-dao -- --name "MyDAO" --quorum 51 --mode quadratic
yarn create-proposal -- --dao <DAO_PDA> --title "Fund initiative" --duration 3600
yarn commit -- --proposal <PROPOSAL_PDA> --vote yes
yarn reveal -- --proposal <PROPOSAL_PDA>
yarn finalize -- --proposal <PROPOSAL_PDA>
yarn execute -- --proposal <PROPOSAL_PDA>
```

## Demo Guide

1. Open GitHub Pages demo.
2. Connect Phantom wallet.
3. Keep network on **Solana Devnet**.
4. Use the live status panel to inspect real account data for the deployed program.

## Security Considerations

- Commit-reveal hides tally during voting, reducing bribery and intimidation.
- Timelock and veto path provide a review window before treasury execution.
- `voter_pubkey` is included in the commitment preimage to prevent commitment replay.
- Quadratic mode requires Sybil mitigation at governance/community level.

## Limitations

- Commit-reveal requires voters (or keeper) to return for reveal.
- Privacy is not zero-knowledge; timing metadata still exists on-chain.
- DAO policy (quorum, thresholds, timelock) must be configured responsibly.

## Deployment Guide

1. Confirm `declare_id!` matches `Anchor.toml` `programs.devnet.private_dao`.
2. Run `anchor build` and `anchor test` locally.
3. Deploy to devnet.
4. Update any public references (docs/footer/Solscan links) if Program ID changes.
5. Publish docs through GitHub Pages from `/docs`.

## Hackathon Submission Pack

### What it is
A private governance primitive for Solana DAOs with treasury execution and migration path from Realms.

### Why it matters
It removes live tally visibility during the vote window, reducing bribery and reactionary voting behavior.

### How it works
Commit hash → reveal preimage → finalize thresholds → timelock → execute treasury action.

### Judges checklist (fast verification)
1. Run `anchor build`.
2. Run `anchor test -- --grep "Full flow"`.
3. Open demo and verify wallet connect + devnet program links.

## Share

- **X / Twitter**
  - `PrivateDAO brings commit-reveal governance to Solana DAOs with real Anchor tests and a live devnet demo. #Solana #Anchor #DAO #Governance`
- **Discord**
  - `PrivateDAO is live: private commit-reveal voting, timelock execution, and Realms migration path. Demo + code in repo.`
- **Solana forums**
  - `We built PrivateDAO to reduce live vote manipulation in Solana governance using commit-reveal voting and practical treasury execution.`
- **Hackathon form short pitch**
  - `PrivateDAO is an Anchor-based Solana governance protocol that hides live vote outcomes with commit-reveal and executes treasury actions after deterministic finalize/timelock logic.`

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md).

## Changelog and Release

- [CHANGELOG.md](./CHANGELOG.md)
- [RELEASE.md](./RELEASE.md)

## License

MIT — Copyright (c) 2026 Eslam Kotb (X-PACT)
>>>>>>> theirs
