# Privacy And Encryption Proof Guide

## What this guide answers

This is the simplest explanation of how PrivateDAO proves privacy and encryption **without** turning the product into a black box.

The core idea is:

- the sensitive part stays protected
- the blockchain still records the proof that the operation happened
- the reviewer can open the hash, the logs, and the product route immediately

This guide stays practical. No math lecture. No cryptography theater.

## The simplest mental model

PrivateDAO treats privacy as **stage control**, not as invisibility.

That means:

1. a sensitive action can stay hidden while it would be harmful to reveal it too early
2. the chain still records the commitment, reveal, settlement, or execution transaction
3. a reviewer opens those public records when the workflow reaches the correct proof stage

So the question is not:

> "Can I see the secret data on-chain?"

The real question is:

> "Can I see enough on-chain evidence to trust that the protected action happened correctly?"

For PrivateDAO, the answer is yes.

## What is protected and what becomes public

| Product lane | What stays protected first | What becomes public later | Where to verify |
| --- | --- | --- | --- |
| Governance vote | vote intent before reveal | commit, reveal, finalize, execute signatures | `/govern`, `/judge`, `/proof` |
| ZK review layer | proof logic and witness details | proposal-bound proof anchors and reviewer artifacts | `/documents/zk-capability-matrix`, `/documents/frontier-integrations` |
| Confidential settlement | payout intent, recipient context, settlement posture | deposit, settle, and execute transactions | `/security`, `/documents/confidential-payout-evidence-packet`, `/documents/settlement-receipt-closure-packet` |
| Mobile wallet usage | wallet-native browser flow and user approvals | the same Devnet signatures and explorer checks | `/documents/real-device-runtime` |

## 1. Governance secrecy: commit first, reveal later

PrivateDAO uses a commit-reveal governance path.

That means:

- the vote is committed on-chain first
- the vote choice is revealed later
- execution only happens after the lifecycle is complete

This protects fairness during the sensitive decision window.

### Real proof

- Governance route: [Run governance flow](https://privatedao.org/govern/)
- Verification route: [Open judge route](https://privatedao.org/judge/)
- Proof center: [Open proof center](https://privatedao.org/proof/)

Live Devnet references:

- Reveal transaction: [5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5](https://solscan.io/tx/5L3cxZZgwMRnJTxNXLQCyjQMXSAi6bwoskFoKsfaQ7JycYUPuGCkWAkr7qA18WkddfNdSPB5qHt3FVSiHq2eDGh5?cluster=devnet)
- Finalize transaction: [4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG](https://solscan.io/tx/4JSPRJQuSY5es74TcChBTzuGMMCr4RknHkmr6vFmtmbav4TRABDAnapmtgipYioEZzh4wmKfg2PMzZHCfJ7UruLG?cluster=devnet)
- Execute transaction: [x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9](https://solscan.io/tx/x1vhP6H3Regi6WHYx6LUGbeo4CCbJxWwtUVucPVjonnymyccpM8mpb7t3UpQpqksXBU7PYGPd86cPnZLYwRzBn9?cluster=devnet)

### What this proves

It proves that:

- governance happened on-chain
- the protected vote phase was respected
- the decision was later revealed and executed in a public verification lane

It does **not** mean that PrivateDAO dumps the vote intent on-chain too early.

That is the point.

## 2. ZK proof layer: proof anchors on-chain, proof logic reviewable

PrivateDAO's current ZK layer is real, but it is also truth-bounded.

What is true today:

- the repository contains real circuits and proofs
- the reviewer path contains real verification commands and artifacts
- proposal-bound proof anchors are recorded on Devnet

What is **not** claimed:

- full verifier-CPI enforcement on-chain
- anonymous private treasury execution
- a fake “fully trustless everything” marketing claim

### Real proof

- ZK matrix: [Open ZK capability matrix](https://privatedao.org/documents/zk-capability-matrix/)
- Integration packet: [Open integration evidence](https://privatedao.org/documents/frontier-integrations/)

Devnet anchor references:

- Vote proof anchor: [4fLregTXXGC98ba8VKqvbQTeC7JjwakmVv1E3oZzbiJc7Sv5tmmMqSJoCp5eS5eVcq2PXHehwH8CAxeWu4LCeahu](https://explorer.solana.com/tx/4fLregTXXGC98ba8VKqvbQTeC7JjwakmVv1E3oZzbiJc7Sv5tmmMqSJoCp5eS5eVcq2PXHehwH8CAxeWu4LCeahu?cluster=devnet)
- Delegation proof anchor: [y3nJ5Tu67sikEbgr1zj13iYNT1UhPEmUkuT8fLbbCyir6tJCAAGWue1W8i3nMBobarEdN8jnNsjhiBFK9cbztE2](https://explorer.solana.com/tx/y3nJ5Tu67sikEbgr1zj13iYNT1UhPEmUkuT8fLbbCyir6tJCAAGWue1W8i3nMBobarEdN8jnNsjhiBFK9cbztE2?cluster=devnet)
- Tally proof anchor: [3hwA2kjJQfhTNHANdDdHhJ7AkwuMpDdGbJadUpYKmLJ6UDKgtyBzR5qKbesmP6bDSBYQDZBQ9ygoEH2pZHPJj97m](https://explorer.solana.com/tx/3hwA2kjJQfhTNHANdDdHhJ7AkwuMpDdGbJadUpYKmLJ6UDKgtyBzR5qKbesmP6bDSBYQDZBQ9ygoEH2pZHPJj97m?cluster=devnet)

### What this proves

It proves that the privacy layer is not just prose.

The chain contains anchor transactions tied to the proposal context, and the repository contains the verification path that explains what those anchors mean.

## 3. Confidential payouts: protected intent, public settlement trail

PrivateDAO uses a confidential operations corridor for sensitive payout and treasury motion.

The sensitive part is:

- payout intent
- recipient context
- settlement posture

The public part is:

- deposit hash
- settlement hash
- execute hash
- reviewer packet that explains the trust boundary

### Real proof

- Confidential operations route: [Open security corridor](https://privatedao.org/security/)
- Payout packet: [Open confidential payout evidence packet](https://privatedao.org/documents/confidential-payout-evidence-packet/)
- Receipt boundary: [Open settlement receipt closure packet](https://privatedao.org/documents/settlement-receipt-closure-packet/)

Devnet settlement references:

- MagicBlock deposit: [3FV1LENXhfzktPUQh6rK1mRhEk4aJf2snFhfMSK3nLM4au2y4n1smbEGCEWr5x8kJ7t86ZcAivB5HhsMqMWpkRJC](https://solscan.io/tx/3FV1LENXhfzktPUQh6rK1mRhEk4aJf2snFhfMSK3nLM4au2y4n1smbEGCEWr5x8kJ7t86ZcAivB5HhsMqMWpkRJC?cluster=devnet)
- MagicBlock private-transfer corridor: [662meytSDxGaCpkkkvMwqo6ZLFNvbC8jswHUw4sCaJmaYpov1995Xoik97CoWUHu6vvYigNdvfWSGBMfktzwbRr4](https://solscan.io/tx/662meytSDxGaCpkkkvMwqo6ZLFNvbC8jswHUw4sCaJmaYpov1995Xoik97CoWUHu6vvYigNdvfWSGBMfktzwbRr4?cluster=devnet)
- MagicBlock settle: [56zD3JYxYssgAkSsmxoh2zGzs11SakCXmUviMF53rdHy1HHcNQGqq72Jo9cbww2m67k7XsD5gqTB42HXMC8YEHHM](https://solscan.io/tx/56zD3JYxYssgAkSsmxoh2zGzs11SakCXmUviMF53rdHy1HHcNQGqq72Jo9cbww2m67k7XsD5gqTB42HXMC8YEHHM?cluster=devnet)
- MagicBlock execute: [LoNED2YKkYWxaQbFV4y8fCzqGi5YrpPSruJYppqfvcTyAJ2zU5HM92QEsPNydQb26abE7qp2kB7hCNPJFbVUUPA](https://solscan.io/tx/LoNED2YKkYWxaQbFV4y8fCzqGi5YrpPSruJYppqfvcTyAJ2zU5HM92QEsPNydQb26abE7qp2kB7hCNPJFbVUUPA?cluster=devnet)

### What this proves

It proves that the confidential path still leaves a real settlement trail on-chain.

It does **not** mean the chain exposes the full sensitive payload.

That would defeat the point of the confidential corridor.

## 4. Mobile browser proof: even wallet-native users can verify it

PrivateDAO is not limited to a desktop developer setup.

The product now has real-device evidence from a Samsung Android phone inside the Solflare mobile wallet browser.

That path proves:

- wallet-native connect
- wallet-native sign
- DAO creation
- proposal creation
- commit-vote submission
- same-device explorer verification

### Real proof

- Real-device runtime: [Open real-device runtime evidence](https://privatedao.org/documents/real-device-runtime/)

## 5. What a judge or non-technical reviewer should do

If you only have a few minutes:

1. Open [Verification Route](https://privatedao.org/judge/)
2. Open [Proof Center](https://privatedao.org/proof/)
3. Open [ZK Capability Matrix](https://privatedao.org/documents/zk-capability-matrix/)
4. Open [Confidential Payout Evidence Packet](https://privatedao.org/documents/confidential-payout-evidence-packet/)
5. Open one reveal or settle transaction in Solscan

That is enough to understand the model:

- privacy first
- proof still public
- execution still verifiable
- no terminal or protocol-engineer workflow required

## 6. What this guide does **not** claim

This guide does not claim:

- that all privacy logic is enforced by an on-chain verifier CPI today
- that external source-verifiable settlement receipts are fully closed
- that mainnet custody and launch gates are already finished

It does claim, truthfully, that:

- the privacy model is real
- the encryption and confidential-settlement direction is real
- the blockchain proof is real
- the reviewer can verify the public part easily

## Canonical linked routes

- `/judge`
- `/proof`
- `/govern`
- `/security`
- `/documents/zk-capability-matrix`
- `/documents/frontier-integrations`
- `/documents/confidential-payout-evidence-packet`
- `/documents/settlement-receipt-closure-packet`
- `/documents/real-device-runtime`
