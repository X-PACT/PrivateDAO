# Devnet Load Test Report

## Overview

- profile: 50-wallet
- number of wallets: 50
- network: devnet
- program id: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- governance mint: `AZUkprJDfJPgAp7L4z3TpCV3KHqLiA8RjHAVhK9HCvDt`
- total tx count: 185
- average latency ms: 2573.74
- zk participation summary: 5 zk tester wallets, 7 zk proof artifacts

## Summary Snapshot

- total wallets: 50
- successful commits: 40
- successful reveals: 35
- rejected invalid reveals: 17
- finalize success: 1
- execute success: 1
- confidential payout success: 0
- replay rejections: 6
- authority mismatch rejections: 9
- total tx count: 185
- average latency ms: 2573.74

## DAO Bootstrap Results

- DAO: `CC65ZFSQmT1K3ScBFHrtq4Cxpt8y84Yqr3Sq5rGD1TYx`
- Treasury: `8XV4DUCKH1H8XxK6Kp19Arq533uZCCPEvYm6zqT9GJry`
- Proposal: `G76rRCe9MXbroK7CPC9jia1JCbuUtcV55S2hd1GCpUzL`
- create-dao tx: `25xJsSWU9SJY7ewEGvMqX6qjDvAk7y12sPwv8LeQgEaNpQ1bwcnQTNXwBe8hacD4fgurMMwxc1LG3Bcw1QRefw7E`
- deposit tx: `btQ8QBxszLitToztJvMiu3mTmN3cWivfK63kkNnYibKhpkDnTCZdSQSdSDYMAWi3tVeK525gaWHVKF5R99bhsWK`
- create-proposal tx: `5t5XmtvrrYjYsJPe4dG4n81NAQTNkLZyWb4tQDnhCbFL31pi1cTJNcfpbdAnebBm2bLXQdTF5Ps89dygD1FHRUy5`

## Commit Wave Results

- total commit-capable wallets: 40
- successful commits: 40
- adversarial commit rejections: 10
- wave size: 10

## Reveal Results

- successful reveals: 35
- late reveal attempts: 5
- replay and invalid reveal rejections: 17

## Finalize Results

- finalize success tx count: 1
- duplicate finalize rejections: 1

## Execute Results

- execute success tx count: 1
- pre-unlock execute rejections: 1
- treasury miswiring rejections: 1
- duplicate execute rejections: 1

## ZK Verification Results

- verification mode: off-chain Groth16 companion layer
- on-chain verifier integration: not present in the current protocol
- zk proof entries: 7
- vote proof entries: 5
- tally proof entries: 1
- delegation proof entries: 1

## Adversarial Results

- total adversarial scenarios: 33
- rejected as expected: 32
- unexpected successes: 0

## Performance Metrics

- total execution time ms: 5682986
- average tx latency ms: 2573.74
- failure rate: 15.09%
- retry rate: 0.00%

## Explorer Links

- https://solscan.io/account/G76rRCe9MXbroK7CPC9jia1JCbuUtcV55S2hd1GCpUzL?cluster=devnet
- https://explorer.solana.com/tx/25xJsSWU9SJY7ewEGvMqX6qjDvAk7y12sPwv8LeQgEaNpQ1bwcnQTNXwBe8hacD4fgurMMwxc1LG3Bcw1QRefw7E?cluster=devnet
- https://explorer.solana.com/tx/btQ8QBxszLitToztJvMiu3mTmN3cWivfK63kkNnYibKhpkDnTCZdSQSdSDYMAWi3tVeK525gaWHVKF5R99bhsWK?cluster=devnet
- https://explorer.solana.com/tx/5t5XmtvrrYjYsJPe4dG4n81NAQTNkLZyWb4tQDnhCbFL31pi1cTJNcfpbdAnebBm2bLXQdTF5Ps89dygD1FHRUy5?cluster=devnet
- https://explorer.solana.com/tx/25ELK4ivcB7H4Yh4UrPv7iAfzrPLmzejMvr2ZX5CXmb16RmKURhAe2xj925zjFtiGygDDsHby1cBG3ir9Rb5CKQK?cluster=devnet
- https://explorer.solana.com/tx/4LRoMeGxwBHJi89tPTGM8CmZPyyqqYD9AkjLumxmcHnMWmtL7ncmhJQ1WJy8rqiGChJU99xrRRaE72JVLgzLZpw?cluster=devnet

## Failure Causes

- 5 × AnchorError thrown in programs/private-dao/src/lib.rs:870. Error Code: RevealClosed. Error Number: 6011. Error Message:
- 4 × AnchorError thrown in programs/private-dao/src/lib.rs:877. Error Code: NotAuthorizedToReveal. Error Number: 6018. Error
- 4 × AnchorError thrown in programs/private-dao/src/lib.rs:880. Error Code: CommitmentMismatch. Error Number: 6015. Error Mes
- 4 × AnchorError thrown in programs/private-dao/src/lib.rs:872. Error Code: AlreadyRevealed. Error Number: 6014. Error Messag
- 3 × AnchorError caused by account: voter_record. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: A seeds con
- 3 × AnchorError caused by account: delegation_marker. Error Code: ConstraintSeeds. Error Number: 2006. Error Message: A seed
- 2 × AnchorError caused by account: voter_token_account. Error Code: ConstraintRaw. Error Number: 2003. Error Message: A raw
- 2 × AnchorError thrown in programs/private-dao/src/lib.rs:706. Error Code: DelegationOverlap. Error Number: 6041. Error Mess

## Interpretation

This run demonstrates that PrivateDAO can execute a full Devnet governance lifecycle with 50 persistent wallets under wave-based submission, while preserving deterministic reviewer artifacts and explorer-verifiable transaction evidence. The successful commit, reveal, finalize, and execute paths remained reproducible, and the negative-path scenarios were rejected without advancing proposal lifecycle state or bypassing treasury controls.
