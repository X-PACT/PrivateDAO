# PrivateDAO Bot Ops Console

Run all commands from:

```bash
cd /data/PrivateDAO-BOTS/trading-bot
```

## Daily Console

Interactive console:

```bash
npm run console
```

Direct commands:

```bash
npm run console -- status
npm run console -- logs 200
npm run console -- errors
npm run console -- health
npm run console -- mainnet
npm run console -- restart
```

## What Each Command Does

- `status`: shows whether `node bot.js` is running and which providers are configured, without printing secrets.
- `logs 200`: tails the last 200 lines from `bot-runtime.log`.
- `errors`: filters recent warnings, failures, and exceptions.
- `health`: runs syntax, security, provider, and quote checks.
- `mainnet`: checks live blockhash, PDAO SOL/USDC routes, market data, and ZK attestation.
- `restart`: restarts the Telegram bot process.
- `stop` / `start`: manually stop or start the bot.
- `import-env`: safely imports `/home/x-pact/PrivateDAO_bot.env` into `.env`.

## Safe Secret Import

The source file may contain normal text, URLs, and labels instead of strict `KEY=value`.
Use:

```bash
npm run env:import
```

The importer extracts Jupiter, Helius, Jito, Solana Tracker, and creator wallet values, then writes `.env` with permission `600`. It only prints `<set>` markers.

## Live Log File

Runtime log:

```bash
/data/PrivateDAO-BOTS/trading-bot/bot-runtime.log
```

Quick watch:

```bash
tail -f /data/PrivateDAO-BOTS/trading-bot/bot-runtime.log
```

## Launch Readiness

Run:

```bash
node scripts/securitySelfTest.js
node scripts/walletPersistenceSelfTest.js
node scripts/infraDeepHealthCheck.js
node scripts/zkReadinessCheck.js
node scripts/fullLaunchReadiness.js
```

Production Telegram trading is allowed only when:

```bash
TRADING_BOT_EXECUTE_SWAPS=true
ENABLE_MAINNET_TRADING=true
```

Script-only live tests must stay separately gated. Do not let test gates disable real Telegram user execution when both production env flags are true.

## Security Checklist

STRIDE operating checklist:

- Centralized logging: collect runtime errors, trade rejects, quote failures, and provider failovers.
- Alerting: alert on failed withdraw, repeated failed swap, RPC degradation, and abnormal fee settlement.
- Key storage: keep wallet keys encrypted, never log private keys or encrypted key material.
- Least privilege: Supabase service key should be used only by the backend process.
- Incident response: preserve logs, stop bot, rotate Telegram/Supabase/RPC keys, and audit wallet backup continuity.
- Verifiable builds: keep release commands, package-lock, and syntax/security outputs.
- Circuit breakers: enforce gas reserve, slippage, liquidity, price impact, daily caps, and provider health.
- Dependency audit: run npm audit before public launch windows and after dependency updates.

## Crypto Primitives Roadmap

Use Solana-native primitives where they reduce operational risk:

- ZK ElGamal: confidential balances and future confidential transfer flows.
- BN254 / BLS12-381: proof/signature aggregation where verifier cost matters.
- SHA-512 syscall: receipt hashing or audit hashing when moving hashes on-chain.

Current production trade receipt mode is:

```text
receiptHash + encryptedIntentHash + intentHash + policyHash + routeHash + tx signatures
```

Legacy proof matrix output must not be presented as a fresh mainnet proof unless `zkReadinessCheck` confirms the required proving assets and verification keys.

## QuickNode And Protected Routing

Recommended integrations:

- `QUICKNODE_X402_ENDPOINT` for paid x402 access checks.
- `shredTransactionSubscribe` for lower-level visibility where available.
- Pre-execution visibility for large protected swaps.
- Sandwich protection audits comparing public route risk versus protected route results.

MEV routing priority:

1. Jupiter signed transaction path.
2. Jito / Helius Sender / protected route when configured.
3. Split protection fallback when a protected send is unavailable.

## Optional Tooling

- ChainGuard reports for release-sensitive bot changes.
- Smart Transaction Observatory REST/SDK for transaction risk inspection.
- Presigned transaction bundling for planned split execution.
- Risk inspection before large trades.

## Arcium Blackthorn Future Path

Future private AI mode should keep:

- Confidential AI strategy inference.
- Encrypted prompts and encrypted strategies.
- AI Trader privacy mode where user strategy text is never surfaced in receipts.

## Product UX Rule

The bot should feel non-custodial even though it uses a dedicated execution wallet:

- One Telegram session gets one dedicated execution wallet.
- `/deposit` never replaces an existing funded wallet.
- Withdraw/export/settings-sensitive actions require SIP when enabled.
- Main user flow remains inside Telegram: Trade -> Asset -> Amount -> Mode -> Review -> Execute.
