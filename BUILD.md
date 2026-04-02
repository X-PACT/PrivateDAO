<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Build & Deploy Notes

This file is for the boring failures that waste time.

## Known-good baseline

- Solana CLI in your `PATH`
- Rust stable
- Anchor CLI `0.31.1`
- Node.js + Yarn
- Program ID in this repo: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

Official Solana references:

- RPC methods and commitment behavior: https://solana.com/docs/rpc

For this repository in particular, the practical RPC surface is small and explicit:

- `getVersion` for RPC health checks
- `getAccountInfo` for contract/account inspection
- `getProgramAccounts` for proposal discovery
- `getSlot` and `getBlockTime` for phase timing in the docs frontend and devnet operator views

Commitment guidance worth following from the Solana docs:

- `confirmed` is the default operational sweet spot when the app is tracking progress
- `finalized` is the safer read when you care more about rollback resistance than speed

## Clean local build

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

yarn install
anchor build
```

If you want the full local flow:

```bash
solana-test-validator --reset
anchor test
```

## Verify toolchain before digging deeper

```bash
bash scripts/verify.sh tools
```

## Common failures

### `anchor build` cannot find Solana build tooling

Usually your Solana install is present but not exported into `PATH`.

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### Anchor version drift

This repo is pinned to `0.31.1`.

```bash
anchor --version
yarn list @coral-xyz/anchor
```

If your CLI or JS package is materially newer or older, fix that first.

### RPC/faucet instability on devnet

Use the repo scripts instead of guessing:

```bash
bash scripts/fund-devnet.sh 2
bash scripts/check-rpc-health.sh
```

If your network is proxying RPC traffic badly, set `NO_PROXY` for the RPC hosts or switch networks.

If `solana` CLI is not installed, some repository tooling still works:

- `bash scripts/check-rpc-health.sh` uses direct JSON-RPC over HTTP
- `bash scripts/check-contracts.sh <ADDRESS>` now falls back to JSON-RPC account inspection instead of requiring `solana account`

If you do need the full Solana toolchain, install the CLI before debugging Anchor-specific failures. This repo still assumes the CLI is present for local validator, deploy, and several shell workflows.

### Build passes, deploy fails

Check wallet and RPC explicitly:

```bash
solana config get
anchor keys list
```

Then either:

```bash
anchor deploy --provider.cluster devnet
```

or:

```bash
./deploy.sh
```

## Program ID discipline

This repository already has a deployed devnet program and published references to its address. Do not casually rotate the program ID just because a local deploy produced a new one.

If you intentionally deploy a fresh program for your own environment, treat that as an environment-specific override, not as a silent documentation update.

## What Deployment Means Here

"Deploying to Solana" in this repository means deploying the Anchor program binary to a Solana cluster such as devnet.

It does not mean:

- uploading the whole GitHub repository on-chain
- storing the docs frontend on-chain
- moving your scripts, SDK, or markdown files into Solana accounts

What stays off-chain:

- the repository and source history
- the docs/frontend hosting
- the CLI scripts and migration helpers
- operator workflows and CI

What goes on-chain:

- the compiled program
- the accounts created and managed by the program during DAO operation

## Helpful checks

```bash
bash scripts/verify.sh fmt
bash scripts/verify.sh lint
bash scripts/verify.sh build
bash scripts/verify.sh test
bash scripts/verify.sh scan
```
