<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Devnet Feature Sweep - 2026-04-06

This note records the CLI/on-chain Devnet sweep for the current PrivateDAO confidential operations stack. It intentionally excludes private keys and plaintext compensation data.

## Environment

- Network: Devnet
- Program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- DAO: `9yi2TGLcENufbRPVbEJH3BWJWrqsGxLfG6G7qJmUS8r6`
- Governance mint: `9RqMo8zzCwH3XDCJq6STJSzrVS39MkWz4q7zXsYznsdC`
- Treasury: `9o592knjUisbN5pFbecfuDfUiBKpENgffYXfBbfmffgK`
- MagicBlock API: `https://payments.magicblock.app`
- MagicBlock validator: `MAS1Dt9qreoRMQ14YQuhg8UTZMMzDdKhmkZMECCzk57`
- MagicBlock transfer queue: `FgUh7pocATTbVxJeorMb5iZwMQWcoVAAzy1PcCz2suZT`

## Fixes Applied During Sweep

- Corrected signer account ordering for direct execute and confidential payout execute paths after a self-recipient execute path exposed `AccountNotSigner`.
- Switched the MagicBlock default API base to `https://payments.magicblock.app`.
- Normalized MagicBlock numeric request amounts before sending JSON bodies.
- Serialized MagicBlock object-shaped errors instead of emitting opaque `[object Object]`.
- Rebuilt MagicBlock route hashes with Node `sha256` byte output to avoid invalid route-hash material.
- Prevented CLI argument parsing from coercing long hash strings into unsafe JavaScript numbers.
- Increased the frontend DAO builder reveal-window default from `5s` to `180s`.

## Encryption Boundary

The confidential payout test now uses an AES-256-GCM encrypted manifest artifact:

- Encrypted artifact: `docs/runtime/confidential-manifests/devnet-stable-magicblock-refhe.enc.json`
- Algorithm: `aes-256-gcm`
- Manifest hash: `8a86a995e53f11f70285f8339236cabd499a449558aaa4f40a068dfe96f12531`
- Ciphertext hash: `243859fb964a105d6bb581d5ef01543e558a6a85fa387d23417a1581f1faa186`

The plaintext fixture and key were kept outside git. The committed artifact contains ciphertext, IV, auth tag, and hashes only. `npm run verify:confidential-manifest` checks that the committed artifact is structurally encrypted and does not leak the known plaintext terms used by the test fixture.

## Successful Simple Governance Path

- Proposal: `7UEiPzwnpT6vkCepr2MmGjvT828vgtoZZREmm9UnCwv7`
- Commit txs:
  - `4vbBYRv8hh5ybn1qiS84dogbbZzBcv6D8CAj8pMvKkeog4euEnEny7RzTF7eas4xwDxjR6x94pXZSb1EGVgn6H6k`
  - `2vsoKvRJAEwMRZxQ69TTxSz8Gffe57Uwvp7MeaQfH7ffi88siJ7PiXQmXtWsrJx2kuaXBiKWXoqNVw54ZKkdeBn7`
  - `2dQsYzi2xy3ocPiZDN9YxBpAy3RWLLBgVs2dbizhyoSTNB43AqEuSj6G1gE55LsHH7Tc4Mg5hNb48XNwozPWVNkm`
- Reveal txs:
  - `56zf5NGAfnyY6fF4mXJ9HjKV4p3BkRdBH6JvNFfhwPZGhmARggb6dqMnqHqNFqDKJGPFEBvuKrVU2VMRBeoNFVjK`
  - `5ZTPdtrXcjS5sWti5hcTNEWvGQAAZtph3ZLZAzvLsCBWVqJR4Rzxb5cCxHdzufYHLmhjZM6RBSM41HnMSe7PgjvY`
  - `ABiHEHSei7VcRfS9LbfUMZudqZEYXs8rrvXLFRWAVVMRz7kvNvFPuYijYepS8y68zBiDW26msjWaqd3UHyuQjbD`
- Finalize tx: `4cQQhAfpRYWWiCoRySia2Qmi9LBMwKyqMCYJauRYjZooW6v8L3dSZvUrMDCQ1mQnHRQKomn3Lwhg2iNFoK74i8n3`
- Execute tx: `5UYACiN5oe437ay17kLkRiJtwyuibcDAbh2Zf2YHBevNXMnrzuqPNzLRjc6PDc3JoiDg23jhiwBHBgpJprjURhqL`
- Replay result: rejected with `Treasury action already executed`.

## Successful Confidential MagicBlock + REFHE Path

- Proposal: `52UpWHJodPWQzpR8u2qqpgwo3jRB7mvjgwCnf8oSJuXX`
- Payout plan: `ELG1u6ZCmZeQsudRfqGfg4jBgfMSsU1vc9r9aZcTB9Ka`
- MagicBlock corridor: `8YH5f29UX363oMM1mqsXDyyBtyu4Y1b1BBuikV4xkAys`
- REFHE envelope: `75QH1NdLyWcpcuKSDD1n3hLDG4VHPANGf2zDQZsiesFo`
- Proposal tx: `3t9RDeRJsZiWWQfm1LTj8i5KMCcyZ8v7yUnCGXDMFN3YLnYUQrezsq6hZWPi7F4w79aDLDo6eJHnYF2TChp3S34f`
- Payout config tx: `AN95vnzyUe4B5Xs4438euseizdRwjbqmjmUuLtcHbJZddQZKMpxF9hFXBm7AVFzjjKbZ46Htk8uiX4MZLcHGffb`
- MagicBlock config tx: `uK1sYSVMsFDZUEofyjAuL7XdrUsHi9XsANRZnrUD8WoRJHrMPbTSQ1T24DhV75nf2eFTq14F6frpm4JgzNzxSx4`
- REFHE config tx: `52GEG7cK8XUgmE2fKWsimvdxkxQ9MWh39kSBFZH4rpyBaywecqzw6dTaPsweaz7E7hcyhqw7pNLJEAGKdhUtLh2k`
- Commit tx: `5BgXt79swqxZ74F8X1eBFpqEZq2SadNeqU8rTTGGoXPZ6LRADpwTnn2WmiE8Laqs3oqSkCQuwLkZ8ZCBEXeMKqEY`
- MagicBlock deposit tx: `3FV1LENXhfzktPUQh6rK1mRhEk4aJf2snFhfMSK3nLM4au2y4n1smbEGCEWr5x8kJ7t86ZcAivB5HhsMqMWpkRJC`
- MagicBlock private transfer tx: `662meytSDxGaCpkkkvMwqo6ZLFNvbC8jswHUw4sCaJmaYpov1995Xoik97CoWUHu6vvYigNdvfWSGBMfktzwbRr4`
- MagicBlock withdraw tx: `23VxsHqP9aDWTLCdPmRep5UxRXzj9mpvR9B5HGDC8Nt9tKNrVxiwCHCpzm7BLHg8TrChdpmx4awtHyUEW1QPdEBC`
- REFHE settle tx: `2LX58NEfCtA6TNYpQQ1hpBe7MqmDtU8o2KesujmBvmp34F9JN3tZwP8niiFvc1u1aqTHAvCcq8P3JQPqh4pW3VHt`
- MagicBlock settle tx: `56zD3JYxYssgAkSsmxoh2zGzs11SakCXmUviMF53rdHy1HHcNQGqq72Jo9cbww2m67k7XsD5gqTB42HXMC8YEHHM`
- Reveal tx: `qMHR64PLpa9be6yhGWgPL4aHyK2VWG8NEAsJPZ3CgJuHCiSzZJgqMKr4N5wxEeHfJ83fhdsYdz4Hirbh4purzky`
- Finalize tx: `4jkBREvqGei17W5L6oG3ECAPtV662TiA9ga9VC3Fwbr7W32qFU6qYPi9LbXdmMusoxz5zqmysPWp3YiUxxDwwPLS`
- Execute tx: `LoNED2YKkYWxaQbFV4y8fCzqGi5YrpPSruJYppqfvcTyAJ2zU5HM92QEsPNydQb26abE7qp2kB7hCNPJFbVUUPA`
- Replay result: rejected with `Treasury action already executed`.

## Operational Findings

- `20s` voting windows are too short for advanced proposal setup because proposal creation, confidential payout configuration, MagicBlock configuration, and REFHE configuration are separate Devnet transactions. `240s` was used for the successful encrypted-manifest-bound run.
- `180s` reveal windows were sufficient for the successful CLI flow. The frontend default was updated accordingly for normal users.
- Browser wallet diagnostics remain pending for Phantom/Solflare/Backpack/Glow/mobile captures. This sweep proves the CLI/on-chain path; it does not claim browser-specific wallet capture coverage.
