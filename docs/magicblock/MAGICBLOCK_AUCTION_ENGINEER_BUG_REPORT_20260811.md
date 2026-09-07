# MagicBlock Confidential Auction Integration Report

To: MagicBlock protocol engineering
From: PrivateDAO
Date: 2026-08-11
Severity: Integration/runtime compatibility
Status: Workaround validated on Devnet; upstream clarification requested

## Product

- Program: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- SDK: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2`
- TEE validator: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`
- TEE endpoint: `https://devnet-tee.magicblock.app`
- Final deployed artifact SHA-256: `cf9ae793d6c944793845c76899c601c56bba9dff2b73dc9404ccf5bb2d97e54f`

## Original failure

The original `SubmitPrivateBid` instruction included:

```text
bidder       signer=true  writable=false
config       signer=false writable=false
session      signer=false writable=true
authorization signer=false writable=false
```

Solana Devnet accepted the exact instruction and simulation reached the
handler. The TEE rejected it with an account mutability error:

```text
Anchor error code: 2000
A mut constraint was violated
```

A diagnostic transaction that changed only the `config` meta to writable
reached the handler and returned the expected business error `DeadlinePassed`.
This indicated a difference in private-runtime account interpretation rather
than a malformed bid or invalid auction state.

## Workaround tested

The auction session is now self-contained for the private lifecycle:

- auction ID
- authority
- rules digest
- policy digest
- bidding start/deadline
- bid update policy
- winning amount disclosure policy

`SubmitPrivateBid`, `CloseBidding`, and `FinalizePrivateResult` no longer pass
the non-delegated `config` account into the private execution path. They use
only the delegated `session`, bidder authorization, and signer where needed.

The commit CPI also required `magic_context` to be declared writable. The IDL
was regenerated after that change; using the stale IDL reproduced the same
Anchor mutability error locally.

## Reproduction and result

With a fresh auction and two independent bidder wallets, the corrected path
successfully completed:

```text
initialize
authorize bidder A
authorize bidder B
delegate to TEE
init permission
set private
submit private bid A
submit private bid B
close bidding
finalize result
commit and undelegate
finalize receipt
```

Evidence:

- Bidder A: `4WTxSC5MNvDBtXEUn7YJhZd7iv4zMnp9X9cD25iWFg1jUWyeZVmbrdBRgWCejubdNTCcpCYodzjCSXJSbNqSzFLC`
- Bidder B: `xEuLv9k4qEXKqE86vTYPDMnY7rTcAjJhoeyue62PtkdbDC2PwZbh4kewNuM1AtQvJZjx9xMiC8GqmDCkaP3BZnb`
- Commit: `43pPbfsTFvWCEutdyxEuHzvk7x5uGWEf59MrxnMJZC7bunLhhwYS2t9kk5jJBdYpcTMk4ogsCJESAXQMXSq4vVwW`
- Receipt: `42x3CdyLRbQEnP1c62WbscfJtrBkjVNeXjhKdDcnUmqpfCCSvqNmfjNCsLA5UiMz8Jmrvv71ZC1gNnPDDs2HzmHh`
- Commit status: `finalized`
- TEE attestation: `verified`

The final Devnet PoC also produced a durable receipt and passed the tamper
check. The current public evidence is on-chain; the hosted walletless receipt
page has not been deployed yet.

## Questions for MagicBlock

1. Is the self-contained delegated-session pattern the recommended PER model
   when immutable configuration is needed during private execution?
2. Is the TEE expected to reject a non-delegated read-only account when the
   same account is accepted by the Solana base layer?
3. Is `magic_context` required to be writable for `commit_and_undelegate` in
   SDK `0.16.2`, and is this documented as a stable contract?
4. Is there any cache/delegated-state invalidation step required after an
   upgrade of the delegated program?
5. Should this integration upgrade to a newer SDK/runtime version before a
   production deployment?

## Request

Please review the account-meta behavior and confirm whether the workaround is
canonical or whether the protocol recommends a different account/delegation
layout. No private keys or secrets are included in this report.
