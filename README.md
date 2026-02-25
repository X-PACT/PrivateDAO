# PrivateDAO

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/" target="_blank">
    <img src="docs/assets/frontend-hero.png" alt="PrivateDAO interactive frontend preview" width="900" />
  </a>
</p>

[![Live Frontend](https://img.shields.io/badge/Live%20Frontend-Open-00e5ff?logo=solana)](https://x-pact.github.io/PrivateDAO/)
[![Frontend](https://img.shields.io/badge/Frontend-docs%2Findex.html-0b7285)](docs/index.html)
[![CI](https://img.shields.io/github/actions/workflow/status/X-PACT/PrivateDAO/ci.yml?branch=main&label=CI)](https://github.com/X-PACT/PrivateDAO/actions/workflows/ci.yml)
[![Judge Quick Links](https://img.shields.io/badge/Judges-Quick%20Links-ff4d6d)](https://github.com/X-PACT/PrivateDAO/issues/5)
[![Solana](https://img.shields.io/badge/Solana-Devnet-14F195)](https://solana.com)
[![Anchor](https://img.shields.io/badge/Anchor-0.31.1-blue)](https://www.anchor-lang.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Submission](https://img.shields.io/badge/Colosseum-Submission%20Ready-ff9f1c)](SUBMISSION.md)

<p align="center">
  <a href="https://x-pact.github.io/PrivateDAO/"><strong>Open Interactive Frontend</strong></a> ·
  <a href="docs/index.html"><strong>Open Local Frontend File</strong></a>
</p>

Production-grade private governance for Solana DAOs using commit-reveal voting, timelocked execution, and treasury safety checks.

Built for Solana Graveyard Hackathon 2026 with focus on real security controls, Realms migration, and operational readiness.

---

## Deployment Status (Devnet)

- Status: Deployed
- Program ID: `62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm`
- Network: Solana Devnet
- Last deployed slot: `444565780` (`2026-02-25T11:47:34Z`)
- Upgrade authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Explorer: https://solscan.io/account/62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm?cluster=devnet

---

## Executive Summary

Most DAO stacks reveal votes and interim tally in real time. That creates three high-risk dynamics:

- Vote buying during live tally swings.
- Whale intimidation and herd behavior.
- Treasury front-running once proposal direction is obvious.

PrivateDAO removes live tally visibility through commit-reveal and enforces delayed, auditable treasury execution.

---

## Core Capabilities

- Commit-reveal voting with hidden tally during voting phase.
- Voting modes:
  - Token-weighted
  - Quadratic
  - Dual-chamber (capital + community thresholds)
- Keeper-authorized reveal for voter liveness protection.
- Timelock and veto window before treasury execution.
- Treasury action validation (`SendSol`, `SendToken`, `CustomCPI`).
- Realms-compatible voter-weight record support.
- Migration helper from existing Realms governance setup.

---

## Security Posture

Key protections currently implemented:

- Commitment preimage binding:
  - `sha256(vote_byte || salt_32 || voter_pubkey_32)`
  - prevents replay across voters.
- Weight snapshot at commit time:
  - reduces post-vote token movement manipulation.
- Recipient and mint integrity checks for treasury execution:
  - blocks recipient substitution and mint mismatch.
- Token account ownership and authority checks before token transfers.
- Rent-safe reveal rebate logic:
  - rebate is transferred only if proposal account remains rent-exempt.
- Timelocked execution with explicit veto window.

---

## Protocol Flow

```text
1) Commit (voting open)
   - voters submit commitment hash only
   - tally remains hidden (YES=0 / NO=0)

2) Reveal (after voting_end)
   - voter or approved keeper reveals (vote, salt)
   - program verifies commitment and updates tally

3) Finalize (after reveal_end)
   - permissionless finalization computes result
   - if passed, execution unlock timestamp is set

4) Execute (after timelock)
   - permissionless execution fires treasury action
```

---

## Repository Layout

```text
programs/private-dao/src/lib.rs      Core Anchor program
tests/demo.ts                        Full lifecycle demo test
tests/full-flow-test.ts              End-to-end integration test
tests/private-dao.ts                 Unit/integration behavior tests
scripts/                             Operational and devnet scripts
migrations/migrate-realms-dao.ts     Realms migration tooling
docs/                                GitHub Pages documentation
```

---

## Local Development

### Prerequisites

- Rust stable toolchain
- Solana CLI
- Anchor CLI `0.31.1`
- Node.js + Yarn

### Build and test on local validator

```bash
yarn install
solana-test-validator --reset
anchor build
anchor test
```

Run only the full demo scenario:

```bash
anchor test -- --grep "demo"
```

---

## Devnet Deployment

### 1) Configure wallet and RPC

```bash
export ANCHOR_WALLET=~/.config/solana/id.json
export ALCHEMY_API_KEY="<your-alchemy-key>"
solana config set --keypair "$ANCHOR_WALLET" --url "https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
```

You can also set `ALCHEMY_DEVNET_RPC_URL` directly. If no Alchemy settings exist, scripts fallback to Helius (`HELIUS_API_KEY`) and then public devnet.

Optional additional providers: `QUICKNODE_DEVNET_RPC`, `EXTRA_DEVNET_RPCS` (comma-separated), and `RPC_AUTH_HEADER` for header-authenticated endpoints.

### 2) Fund wallet (RPC rotation + retries)

```bash
bash scripts/fund-devnet.sh 2
bash scripts/check-rpc-health.sh
```

If health checks fail with `CONNECT tunnel failed, response 403`, your network proxy is blocking outbound RPC access.
Set `NO_PROXY` for RPC hosts or run from an unfiltered network before deploy/funding.
For controlled CI environments, set `RPC_HEALTH_ALLOW_NETWORK_FAIL=1` to treat pure network/proxy failures as non-blocking while still printing diagnostics.

### 3) Optional custom faucet endpoint

If you run your own faucet service, the funding script can call it first:

```bash
export CUSTOM_FAUCET_URL="https://your-faucet-domain/api/airdrop"
export CUSTOM_FAUCET_METHOD="POST"
bash scripts/fund-devnet.sh 2
bash scripts/check-rpc-health.sh
```

### 4) Deploy

```bash
anchor build
anchor deploy --provider.cluster devnet
```

### 5) Validate deployed programs or addresses

```bash
bash scripts/check-contracts.sh 62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm
```

---

## CI and Quality Gates

Current CI enforces:

- Toolchain verification
- Anchor build
- Anchor test
- Non-real-code scan (non-production artifacts)

Manual verification locally:

```bash
bash scripts/verify.sh tools
bash scripts/verify.sh fmt
bash scripts/verify.sh lint
bash scripts/verify.sh build
bash scripts/verify.sh test
bash scripts/verify.sh scan
bash scripts/verify.sh rpc
bash scripts/verify.sh rpc-health-unit
bash scripts/verify.sh rpc-health
```

Containerized reproducible environment (Ubuntu 24.04 + Rust + Solana + Anchor):

```bash
docker build -t privatedao-dev .
docker run --rm -it -v "$PWD":/workspace -w /workspace privatedao-dev bash
yarn install --frozen-lockfile
bash scripts/verify.sh tools
bash scripts/verify.sh fmt
bash scripts/verify.sh lint
bash scripts/verify.sh build
```

---

## Global Grant Targets (2026)

These programs are highly relevant for security-focused DAO infrastructure, privacy tooling, and open-source public goods.

| Program | Why it fits PrivateDAO | Official link |
|---|---|---|
| Solana Foundation Grants | Solana-native infra, public goods, security tooling | https://solana.org/grants |
| Superteam Earn Grants | Regional Solana grants for shipping teams | https://earn.superteam.fun/grants |
| Gitcoin Grants Program | Public-goods funding with strong OSS visibility | https://www.gitcoin.co/program |
| Ethereum Foundation ESP | Grants for open-source infra, tooling, and research | https://esp.ethereum.foundation/ |
| NLnet Funding / NGI0 | Privacy and open internet digital commons grants | https://nlnet.nl/funding.html |
| Filecoin Foundation Grants | Open-source infra, research, and protocol-level tooling | https://fil.org/grants |

Submission windows and eligibility change frequently. Verify open calls and scope before applying.

---

## Ecosystem Mentions (Relevant Organizations)

The following companies and organizations are relevant to PrivateDAO's stack, infra, or distribution. This is an ecosystem mention list, not a claim of partnership or endorsement.

- Solana Foundation
- Anza
- Coral (Anchor framework)
- Alchemy
- Helius
- QuickNode
- Triton One
- Dialect
- Squads Labs
- Solflare
- Phantom
- Backpack
- Jupiter
- Sanctum
- Pyth Network
- Switchboard
- Chainlink
- Circle
- Wormhole Foundation
- Superteam
- Colosseum

---

## Documentation and Demo Assets

- Web documentation entry: `docs/index.html`
- Logo assets: `docs/assets/logo.png`
- Program source: `programs/private-dao/src/lib.rs`

---

## License

MIT License

Copyright (c) 2026 Eslam Kotb (X-PACT)

## Intellectual Property and Branding

- Source code license: MIT (see `LICENSE`).
- Design assets under `docs/assets/` are licensed separately (see `docs/assets/LICENSE`) and are not open for unrestricted reuse.
- Project marks and branding are reserved (see `TRADEMARKS.md`).
- IP policy and enforcement boundaries are documented in `IP_POLICY.md`.
- Trademark filing prep pack: `LEGAL/TRADEMARK_FILING_PREP.md`
- Patent evaluation brief: `LEGAL/PATENT_EVALUATION_BRIEF.md`
- Private service split plan: `LEGAL/PRIVATE_SERVICE_SPLIT_PLAN.md`
- Evidence pack generator: `scripts/ip/generate-evidence-pack.sh`

Generate legal evidence pack:

```bash
bash scripts/ip/generate-evidence-pack.sh
```

## Ownership

Project owner and maintainer: Eslam Kotb (X-PACT).
Primary code ownership policy is enforced via `.github/CODEOWNERS`.
