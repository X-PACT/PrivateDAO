# PrivateDAO Bot Wallet Recovery Audit

Generated: 2026-07-01T01:02:24Z

## Scope

Target wallet:
`7kQPBNCwaXkKDT6UjSfUKi1gBRLmmJNvLHYzuKVGEwvq`

Telegram user:
`7254012270`

Current stored bot wallet:
`AZQrRpjTTuaaMgGyvaRJ1soKbUM2dJsPmBjAD5NfrAbe`

This report records public keys, file paths, line numbers, counts, and redacted hashes only. It does not include private keys, encrypted key values, seed material, or raw candidates.

## Findings

- Target wallet balance check returned `0.341412143 SOL`.
- Supabase `bot_wallets` has no row for the target wallet.
- Supabase has one current row for Telegram user `7254012270`, opening `AZQrRpjTTuaaMgGyvaRJ1soKbUM2dJsPmBjAD5NfrAbe`.
- Local encrypted backup entries open these public keys only:
  - `9ncHKoP6WUzyhdRZGhhgiR1Fz6hZuj4PaG8WcEfeoQca`
  - `AZQrRpjTTuaaMgGyvaRJ1soKbUM2dJsPmBjAD5NfrAbe`
  - `4iKEupeApHUZDrMmAYvcz6g2V4R1mexY1MmyYPA2b6Md`
  - `FHmAp79hvLejPxs2hVVuF37JE1otpmc9RTv67sCB5kaw`
  - `HaRDKyyuR5DzgegDsLQDr1y6toUSMZBuuQKQgD3mwyK7`
- No local candidate opened the target wallet.

## Evidence

- Telegram export shows the target wallet was issued by the bot:
  `/home/x-pact/Downloads/Telegram Desktop/DataExport_2026-07-01/chats/chat_016/messages.html:871`
  Timestamp: `30.06.2026 20:49:03 UTC+02:00`
- Telegram export later records the current persisted wallet:
  `/home/x-pact/Downloads/Telegram Desktop/DataExport_2026-07-01/chats/chat_016/messages.html:1447`
  Timestamp: `30.06.2026 21:12:11 UTC+02:00`
- Recovery mode message confirms target balance and current wallet:
  `/home/x-pact/Downloads/Telegram Desktop/DataExport_2026-07-01/chats/chat_016/messages.html:1591`
- Manual withdraw attempts referenced the target wallet:
  `/home/x-pact/Downloads/Telegram Desktop/DataExport_2026-07-01/chats/chat_016/messages.html:2263`
  `/home/x-pact/Downloads/Telegram Desktop/DataExport_2026-07-01/chats/chat_016/messages.html:2451`

## Scans

Project and Telegram export scan:

- Roots:
  - `/data/PrivateDAO-BOTS/trading-bot`
  - `/home/x-pact/Downloads/Telegram Desktop`
- Files discovered: `652`
- Files scanned: `652`
- Files mentioning target: `4`
- Files with candidates: `18`
- Candidate values detected and tested in-process: `45`
- Candidate values opening a Solana public key: `13`
- Target signer matches: `0`

Codex and agent session scan:

- Roots:
  - `/home/x-pact/.codex`
  - `/home/x-pact/.agents`
- Files discovered: `6344`
- Files scanned: `6340`
- Files mentioning target: `3`
- Files with candidates: `768`
- Candidate values detected and tested in-process: `4731`
- Candidate values opening a Solana public key: `13`
- Target signer matches: `0`

## Root Cause

The previous wallet storage path allowed replacement risk:

- `db/supabase.js` used `upsert` by Telegram user without checking whether an existing wallet belonged to a different public key.
- `handlers/wallet.js` trusted the loaded session only; if the session did not include a wallet, `/deposit` could create a new wallet instead of reloading from storage first.
- The target wallet was created before the currently verified encrypted local backup for `AZQrRpj...` existed.

## Fixes

- `saveBotWallet` now refuses to replace an existing wallet unless `allowReplace: true` and `replacementReason` are supplied.
- `/deposit` now reloads the existing wallet from storage before creating a wallet.
- Wallet creation still appends an encrypted local backup before the remote write and again after persistence verification.
- Recovery binding paths use explicit admin replacement reasons.
- `/rescue_withdraw` was added and only runs if the stored encrypted signer opens the exact target wallet.
- `scripts/localRecoveryAudit.js` was added for redacted local recovery scans.
- `scripts/walletPersistenceSelfTest.js` now uses an isolated temporary encrypted backup file for future tests.

## Status

The target signer was not recovered from the scanned local sources. No transfer was executed because no stored or scanned signer opened the target wallet.
