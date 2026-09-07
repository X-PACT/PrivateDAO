# Anchor Toolchain Status - 2026-04-30

## Current Repo Pin

PrivateDAO has been migrated to the Anchor 1.x line:

- `Anchor.toml`: `anchor_version = "1.0.1"`
- `Cargo.toml`: `anchor-lang = "1.0.1"` and `anchor-spl = "1.0.1"`
- `Cargo.lock`: Anchor Rust crates resolved to `1.0.1`
- `package.json`: `@coral-xyz/anchor = "^0.32.1"`

The TypeScript client remains on `@coral-xyz/anchor@0.32.1` because the npm package latest reported by `npm view @coral-xyz/anchor version` is still `0.32.1`.

## Program Identity

- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Cluster: Solana Testnet
- ProgramData: `FKyt5DcmRQcCF8kzMGjCvfGb3ZPHMQnH1SqiG9Mi8xEc`
- Deploy signature: `2HucNtqnL3fxAvW911b6poj3hJWTUg2EN344EhRruhPyxxHmt8P4ba3gnnHxmRnjBU3Kps3V1hevt61W9Lik1bvm`
- Upgrade authority / verification wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`

The mistakenly funded `2oq56CUPwsnxbHAdmbQswFR3DWAQ3EBinrNDNSAJMTTS` address was left as a System account and is not the program identity.

## Local Tooling Check

Observed on 2026-04-30:

- AVM-managed Anchor CLI: `anchor-cli 1.0.1`
- Solana CLI: `solana-cli 3.1.8 (Agave)`
- Cargo: `cargo 1.94.0`
- Rust: `rustc 1.94.0`

Use AVM first in `PATH` for reviewer, release, and deployment builds:

```bash
export PATH="$HOME/.avm/bin:$PATH"
anchor --version
anchor build
```

## Migration Fixes Applied

- Updated Anchor Rust crates to `1.0.1`.
- Updated CPI construction for Anchor 1, where `CpiContext::new` and `CpiContext::new_with_signer` expect a program `Pubkey`.
- Updated the test helper `AccountInfo::new` call shape for the current Solana SDK.
- Regenerated the program ID through `anchor keys sync`.
- Rebuilt the program and IDL successfully with `anchor build`.
- Deployed the upgraded program to Testnet with Solana CLI QUIC transport.

## Remaining Hardening

- Anchor macros still emit upstream `unexpected cfg` warnings for `custom-heap`, `custom-panic`, and `anchor-debug`.
- Several account structs still use deprecated `AccountInfo`; migrate them to `UncheckedAccount` in a follow-up hardening pass.
- The workspace has pre-existing web TypeScript alias/generated-file issues and lint findings unrelated to the Anchor 1 migration.
- Full test suite timing changed under the upgraded toolchain; several long-running live-style tests need timeout/duration tuning before claiming a clean full-suite pass.
