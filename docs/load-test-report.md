# Devnet Load Test Report

## Overview

- profile: 50-wallet
- number of wallets: 50
- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- total tx count: 145
- average latency ms: 1542.99
- zk participation summary: 5 zk tester wallets, 0 zk proof artifacts

## Summary Snapshot

- total wallets: 50
- successful commits: 40
- successful reveals: 0
- rejected invalid reveals: 0
- finalize success: 0
- execute success: 0
- confidential payout success: 0
- replay rejections: 0
- authority mismatch rejections: 8
- total tx count: 145
- average latency ms: 1542.99

## DAO Bootstrap Results

- DAO: `Ae87EESnJwA6q9okUmemJXSAthynQjvKnxaNKyD4o7qz`
- Treasury: `GsMD4rTaqsJY9ngn5tw93NRet3U355RGbpVun8Fxnms1`
- Proposal: `7TKCbcUsrAaQhu3XuCLmXUPo2KCbjDtFF8sxtY6QmuVx`
- create-dao tx: `32ka4VehdihxUExu7XE2nq3VRNnyygXWDXRz65QwAja8nvtneMSVPeGYZBWesXYUwv2WJngVG4Esd8cZXuVgYsvt`
- deposit tx: `44h9e5thpBfcH8Tx2Z5EEt8prNWbPbfGqE9FRAmoZuUU8nn5gtymvCrmHYEqYqHN4h1sP9K5hBCtESBEP2pNNwYo`
- create-proposal tx: `sHcNjRUXfbsocDPoeAqdhhfLgQKZ5BrwaTYiCkqHUnBdvUMnAmagLGi5Czr44hyZ17qLyT2GNupRgbGtCDvuHVy`

## Commit Wave Results

- total commit-capable wallets: 40
- successful commits: 40
- adversarial commit rejections: 10
- wave size: 10

## Reveal Results

- successful reveals: 0
- late reveal attempts: 5
- replay and invalid reveal rejections: 0

## Finalize Results

- finalize success tx count: 0
- duplicate finalize rejections: 0

## Execute Results

- execute success tx count: 0
- pre-unlock execute rejections: 0
- treasury miswiring rejections: 0
- duplicate execute rejections: 0

## ZK Verification Results

- verification mode: off-chain Groth16 companion layer
- on-chain verifier integration: not present in the current protocol
- zk proof entries: 0
- vote proof entries: 0
- tally proof entries: 0
- delegation proof entries: 0

## Adversarial Results

- total adversarial scenarios: 10
- rejected as expected: 10
- unexpected successes: 0

## Performance Metrics

- total execution time ms: 648360
- average tx latency ms: 1542.99
- failure rate: 6.54%
- retry rate: 0.00%

## Explorer Links

- https://solscan.io/account/7TKCbcUsrAaQhu3XuCLmXUPo2KCbjDtFF8sxtY6QmuVx?cluster=devnet
- https://explorer.solana.com/tx/32ka4VehdihxUExu7XE2nq3VRNnyygXWDXRz65QwAja8nvtneMSVPeGYZBWesXYUwv2WJngVG4Esd8cZXuVgYsvt?cluster=devnet
- https://explorer.solana.com/tx/44h9e5thpBfcH8Tx2Z5EEt8prNWbPbfGqE9FRAmoZuUU8nn5gtymvCrmHYEqYqHN4h1sP9K5hBCtESBEP2pNNwYo?cluster=devnet
- https://explorer.solana.com/tx/sHcNjRUXfbsocDPoeAqdhhfLgQKZ5BrwaTYiCkqHUnBdvUMnAmagLGi5Czr44hyZ17qLyT2GNupRgbGtCDvuHVy?cluster=devnet

## Failure Causes

- 3 × AnchorError caused by account: voter_record. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: A seeds con
- 3 × AnchorError caused by account: delegation_marker. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: A seed
- 2 × AnchorError caused by account: voter_token_account. Error Code: ConstraintRaw. Error Number: 2003. Error Message: A raw
- 2 × AnchorError thrown in programs/private-dao/src/lib.rs:1094. Error Code: DelegationOverlap. Error Number: 6041. Error Mes

## Interpretation

This run demonstrates that PrivateDAO can execute a full Devnet governance lifecycle with 50 persistent wallets under wave-based submission, while preserving deterministic reviewer artifacts and explorer-verifiable transaction evidence. The successful commit, reveal, finalize, and execute paths remained reproducible, and the negative-path scenarios were rejected without advancing proposal lifecycle state or bypassing treasury controls.
