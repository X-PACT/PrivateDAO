# PrivateDAO Confidential Auction - MagicBlock Devnet PoC

Date: 2026-08-11
Status: DEVNET POC PASS

## Scope

This is a real development-network execution of the standalone
`privatedao-auction` program. It is not a Mainnet deployment and is not a
production certification.

## Runtime

- Base RPC: `https://api.devnet.solana.com`
- Private TEE RPC: `https://devnet-tee.magicblock.app`
- TEE validator: `MTEWGuqxUpYZGFJQcp8tLN7x5v9BSeoFHYWQQ3n3xzo`
- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Deployed artifact SHA-256: `cf9ae793d6c944793845c76899c601c56bba9dff2b73dc9404ccf5bb2d97e54f`
- Deployed artifact size: `435856` bytes
- MagicBlock SDK: `@magicblock-labs/ephemeral-rollups-sdk@0.16.2`
- TEE attestation: `verified`

## Successful flow

1. Creator initialized a fresh auction.
2. Two independent bidder wallets were authorized.
3. The session was delegated to the official Devnet TEE validator.
4. Permission was created and changed to private.
5. Bidder A submitted a private bid.
6. Bidder B submitted a different private bid.
7. Close and result computation executed inside the TEE.
8. The final session was committed and undelegated.
9. The commit reached `finalized` confirmation.
10. A durable on-chain settlement receipt was created.
11. The public base-layer session remained delegated-owned during bidding.
12. The tamper check returned `INVALID`.

## Evidence

- Auction PDA: `5PZLPjDcrWLTtbipbH54C3SuVZjA8PS3AgSPDPMd9XuW`
- Receipt PDA: `JCMbhEHR7gQZHDkkFWobgRw7PRwqaudVYDZg9j7vX5d2`
- Final commit signature: `43pPbfsTFvWCEutdyxEuHzvk7x5uGWEf59MrxnMJZC7bunLhhwYS2t9kk5jJBdYpcTMk4ogsCJESAXQMXSq4vVwW`
- Final receipt signature: `42x3CdyLRbQEnP1c62WbscfJtrBkjVNeXjhKdDcnUmqpfCCSvqNmfjNCsLA5UiMz8Jmrvv71ZC1gNnPDDs2HzmHh`
- Final slot: `249731566`
- Commit confirmation: `finalized`
- Bidder A signature: `4WTxSC5MNvDBtXEUn7YJhZd7iv4zMnp9X9cD25iWFg1jUWyeZVmbrdBRgWCejubdNTCcpCYodzjCSXJSbNqSzFLC`
- Bidder B signature: `xEuLv9k4qEXKqE86vTYPDMnY7rTcAjJhoeyue62PtkdbDC2PwZbh4kewNuM1AtQvJZjx9xMiC8GqmDCkaP3BZnb`
- Permission signature: `7WxQKDaD3CKmmsci8ySczCqgbtt4oQZ9WSwbRKSMLYH22SpSNab4dZ7D8Z5RzywHTUEiqYv1LPABJru55dPcEyk`
- Private permission update: `54rFCxRa1uenJPgoqDJGPhgqcReJQ9Ui3qGr2JBq8XikVpAfGtSexGD95nuYqrPEpPwN8x14A6gJkpLK3XbCr8gc`

Explorer links:

- [Final commit](https://explorer.solana.com/tx/43pPbfsTFvWCEutdyxEuHzvk7x5uGWEf59MrxnMJZC7bunLhhwYS2t9kk5jJBdYpcTMk4ogsCJESAXQMXSq4vVwW?cluster=devnet)
- [Final receipt](https://explorer.solana.com/tx/42x3CdyLRbQEnP1c62WbscfJtrBkjVNeXjhKdDcnUmqpfCCSvqNmfjNCsLA5UiMz8Jmrvv71ZC1gNnPDDs2HzmHh?cluster=devnet)
- [Auction account](https://explorer.solana.com/address/5PZLPjDcrWLTtbipbH54C3SuVZjA8PS3AgSPDPMd9XuW?cluster=devnet)
- [Receipt account](https://explorer.solana.com/address/JCMbhEHR7gQZHDkkFWobgRw7PRwqaudVYDZg9j7vX5d2?cluster=devnet)

## Code changes in this PoC

- Copied immutable auction values into the delegated session at initialization.
- Removed `config` from `submit_private_bid` accounts.
- Made private close and result computation session-only.
- Added authority binding to the delegated session.
- Marked MagicBlock `magic_context` writable for the commit CPI.
- Regenerated the Anchor IDL after each account-metadata change.
- Added commit error diagnostics to the E2E runner.

## Remaining limitations

- No Mainnet deployment was performed.
- The current script proves the runtime path but is not yet a complete CI
  certification gate.
- A public hosted receipt URL still needs to be wired to the existing web
  receipt surface.
- Private payment escrow was not included in this PoC.
- Groth16 outcome proof was not included; PER/TEE privacy and ZK verifiability
  remain separate features.
- No hosted public receipt URL was deployed in this step; the on-chain receipt
  and Explorer links above are the current public evidence.
- A stray experimental Devnet deployment under `F4qypn...` was created by an
  earlier command using the wrong local keypair. It is not referenced by the
  product and must not be presented as the auction program.
