# Anchor 1 Migration Evidence - 2026-04-30

## Summary

PrivateDAO was migrated from the Anchor 0.32 line to Anchor 1.0.1 at the Rust program/toolchain layer. The migration is not a cosmetic version bump: the program source was updated for Anchor 1 CPI API changes, the IDL build path was repaired, the program ID was regenerated to a clean unused Testnet deploy target, and active web/Android client constants were updated.

## Current Program

- Program ID: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Cluster: Testnet
- Explorer: `https://solscan.io/account/EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva?cluster=testnet`
- Deploy signature: `2HucNtqnL3fxAvW911b6poj3hJWTUg2EN344EhRruhPyxxHmt8P4ba3gnnHxmRnjBU3Kps3V1hevt61W9Lik1bvm`
- ProgramData: `FKyt5DcmRQcCF8kzMGjCvfGb3ZPHMQnH1SqiG9Mi8xEc`
- Upgrade authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`

## Toolchain Evidence

- `avm list`: `1.0.1 (latest)`
- `cargo search anchor-lang`: latest crate `anchor-lang = "1.0.1"`
- `Anchor.toml`: `anchor_version = "1.0.1"`
- `Cargo.toml`: `anchor-lang = "1.0.1"` and `anchor-spl = "1.0.1"`
- `npm view @coral-xyz/anchor version`: `0.32.1`

The JavaScript client remains pinned to the latest published npm package, while Rust program crates use Anchor 1.0.1.

## Build Evidence

Command:

```bash
PATH="$HOME/.avm/bin:$PATH" anchor build
```

Result:

- SBF release build completed.
- Anchor IDL/test crate build completed.
- Generated artifacts now match `declare_id!("EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva")`.

## Deployment Status

Deployment completed on Testnet after the successful Anchor 1.0.1 build.

- `2oq56CUPwsnxbHAdmbQswFR3DWAQ3EBinrNDNSAJMTTS` could not be used as the program address because it was already created as a funded System account.
- A fresh unused program keypair was generated for `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`.
- The final deployment used public hosted asset listed above as fee payer and upgrade authority.
- RPC write mode hit retry limits during buffer writes, so the successful deployment used QUIC transport.

Successful command:

```bash
solana program deploy target/deploy/private_dao.so \
  --program-id target/deploy/private_dao-keypair.json \
  --buffer target/deploy/private_dao-buffer-keypair.json \
  --keypair local Testnet operator keypair (not committed) \
  --fee-payer local Testnet operator keypair (not committed) \
  --upgrade-authority local Testnet operator keypair (not committed) \
  --url testnet \
  --use-quic \
  --skip-feature-verify \
  --max-sign-attempts 20 \
  --verbose
```

`solana program show` readout:

```text
Program Id: EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva
Owner: BPFLoaderUpgradeab1e11111111111111111111111
ProgramData Address: FKyt5DcmRQcCF8kzMGjCvfGb3ZPHMQnH1SqiG9Mi8xEc
Authority: 4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD
Last Deployed In Slot: 405189011
Data Length: 1356304 (0x14b210) bytes
Balance: 9.44107992 SOL
```

## Active Client Updates

Updated active program constants in:

- `Anchor.toml`
- `programs/private-dao/src/lib.rs`
- `apps/web/src/lib/dao-bootstrap.ts`
- `apps/web/src/lib/custody-evidence.ts`
- `apps/web/src/lib/onchain-parity.generated.ts`
- `apps/web/src/lib/technical-eligibility.ts`
- `apps/android-native/app/src/main/java/io/xpact/privatedao/android/config/PrivateDaoConfig.kt`
- `scripts/verify-program-id-consistency.ts`
- `scripts/build-onchain-ui-parity.ts`

## Known Follow-Ups

- Migrate deprecated `AccountInfo` fields to `UncheckedAccount`.
- Fix pre-existing web typecheck alias/generated-file failures.
- Fix pre-existing lint findings.
- Re-run full live-style test suite after tuning test durations under Anchor 1.0.1.
