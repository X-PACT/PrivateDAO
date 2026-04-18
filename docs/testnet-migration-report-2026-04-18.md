# Testnet Migration Report - 2026-04-18

This report records the current Testnet migration state for PrivateDAO. It is intentionally factual: Devnet evidence remains the verified product proof until the Testnet deployment and lifecycle rehearsal complete.

## Current Network Ladder

1. Devnet: verified product execution, wallet UX, governance lifecycle, and reviewer evidence.
2. Testnet: active migration target for release-candidate rehearsal, RPCFast-backed infrastructure validation, and pre-mainnet monitoring.
3. Mainnet-beta: not claimed until custody, audit, monitoring delivery, settlement receipts, and release ceremony evidence are closed.

## Snapshot Before Migration

- Anchor CLI previously observed on default PATH: `0.31.1`
- AVM current Anchor version available: `0.32.1`
- Solana CLI: `3.1.8`
- Rust: `1.94.0`
- Preserved program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deploy authority wallet: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Deployment keypair path: `target/deploy/private_dao-keypair.json`
- IDL path: `target/idl/private_dao.json`
- TS type path: `target/types/private_dao.ts`

## Changes Applied

- `Anchor.toml` now targets `testnet` by default and includes a `[programs.testnet]` entry for the preserved program ID.
- Anchor Rust dependencies moved from `0.31.1` to `0.32.1`.
- TypeScript Anchor dependency moved from `^0.31.1` to `^0.32.1`.
- Package scripts now route build/deploy through AVM's Anchor 0.32.1 path.
- Added `npm run setup:testnet`.
- Added `npm run deploy:devnet` and `npm run deploy:testnet`.
- Public site status banner now states that Testnet transition is in progress without claiming Mainnet readiness.

## Verification Completed

- `npm install --package-lock-only --ignore-scripts` completed and updated dependency resolution.
- `cargo update -p anchor-lang --precise 0.32.1` completed.
- `cargo update -p anchor-spl --precise 0.32.1` completed.
- `npm run anchor:version` returned `anchor-cli 0.32.1`.
- `npm run build` completed with Anchor 0.32.1.

Build warning boundary:

- The build still emits known `unexpected cfg` warnings from Anchor/Solana macro expansion. They did not block build output.

## Testnet Funding And Deploy Attempt

- Initial observed Testnet deployer balance: `0 SOL`
- CLI airdrop attempt: failed due faucet/rate-limit response.
- Manual funding received: `10 SOL`
- `npm run setup:testnet` confirmed Testnet RPC `https://api.testnet.solana.com` and deployer balance `10 SOL`.
- `npm run deploy:testnet` started and created a deploy buffer.
- Deploy attempt failed with: `25 write transactions failed`.
- Post-attempt deployer balance: `0.1551256 SOL`
- Testnet program account readout: `AccountNotFound`

Existing Testnet deploy buffer:

- Buffer address: `9vwrTpLeCeKjH6jFPyKiMPPDeGD9FkYtTcPGZxhkUvS8`
- Buffer authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Buffer balance: `9.8328444 SOL`

The buffer is not lost. It should either be reused to complete deployment or closed if a clean redeploy is chosen.

## Testnet Deploy Completion

Second funding received:

- Additional funding: `10 SOL`
- Pre-deploy observed balance: `10.1549656 SOL`

Deployment result:

- Command: `npm run deploy:testnet`
- Cluster: `https://api.testnet.solana.com`
- Program ID: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Deploy signature: `4a2gsFSJ6EpgqZjVaMSZx72LVvz2o1XfXBzJ8PHLz5Q8YStNYmdhk6YBDoMe2fjxb6TPrr8s5mydqeFQwPgHnqdy`
- Status: `Deploy success`
- IDL account: `BKV4bWESswfKteav82yZWPdN6wCd172UryGkaN8mxfGR`

Post-deploy program readout:

- Owner: `BPFLoaderUpgradeab1e11111111111111111111111`
- ProgramData address: `CeggEn3sNVbiuJHLKDaCPMH4uLczu1Dr3ZGKKcaKBqeN`
- Upgrade authority: `4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD`
- Last deployed slot: `402746196`
- Data length: `1412592` bytes
- Program account balance: `9.8328444 SOL`
- Deployer wallet balance after deploy readout: `10.0050118 SOL`
- Remaining buffers for deploy authority: none shown by `solana program show --buffers --buffer-authority 4Mm5YTRbJuyA8NcWM85wTnx6ZQMXNph2DSnzCCKLhsMD --url testnet`

## Immediate Next Step

Testnet deployment is complete. The next step is Testnet lifecycle rehearsal.

## Commands To Resume

```bash
npm run setup:testnet
solana program show 5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx --url testnet
solana account BKV4bWESswfKteav82yZWPdN6wCd172UryGkaN8mxfGR --url testnet
```

If public Testnet RPC continues to drop write transactions, set a supported Testnet RPC endpoint in host secrets:

```bash
export RPCFAST_TESTNET_RPC_URL="https://..."
npm run setup:testnet
npm run deploy:testnet
```

No RPC API keys should be committed to Git.

## Testnet Lifecycle Rehearsal Still Pending

Do not refresh external submissions as Testnet-proven until these actions are actually complete and linked:

- regenerate and sync IDL/types after final deploy
- recreate required DAO/governance state on Testnet
- create DAO
- create proposal
- commit vote
- reveal vote
- execute proposal
- verify treasury action
- capture transaction hashes and explorer links
- refresh reviewer/business/security packets against the new Testnet truth
