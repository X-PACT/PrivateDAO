# Privacy And Encryption Proof Guide

## What this guide answers

This is the simplest explanation of how PrivateDAO proves privacy and encryption **without** turning the product into a black box.

The current operating state is Solana Testnet under Anchor `1.0.1`, with the canonical proof route now recorded in:

- `docs/cryptographic-onchain-matrix-2026-05-25.md`
- `docs/testnet-encrypted-integrations-activation-2026-05-23.md`
- `docs/test-wallet-live-proof-v3.generated.md`
- `docs/operation-ledger.generated.md`

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
| ZK review layer | proof logic and witness details | local Groth16 verification, standalone Testnet verifier receipt, and staged Squads-governed integration path | `/documents/zk-capability-matrix`, `/documents/cryptographic-onchain-matrix-2026-05-25` |
| Confidential settlement | payout intent, recipient context, REFHE/MagicBlock settlement posture | REFHE configure/settle, MagicBlock configure/settle, evidence-gated payout execution | `/security`, `/documents/testnet-encrypted-integrations-activation-2026-05-23`, `/documents/cryptographic-onchain-matrix-2026-05-25` |
| Mobile wallet usage | wallet-native browser flow and user approvals | the same Testnet signatures and explorer checks | `/documents/real-device-runtime` |

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

Current Testnet references live in the V3 packet and cryptographic matrix:

- Program: `EP9xE8MJZ6FfyEwLqns6HDdUZBknEa7WGYs1Jzsecuva`
- Reveal V3: `4M37eyDYdQQtEpGpneKoTXT3g24ocN7CCsNvJLKkmRYEmS1DnN9oJWhVejmMjhmmJpztavMcxSY6fYKkBv5KnuSh`
- Finalize V3: `5NNZVNo7Yho9BZfZZ7PSXjc8NtBfTurJLHnoB79JMdTJUwPsEk45y3YK1ZfX9ennXGxV9ZSWpTGo18RDzYwdTXBy`
- Execute V3: `2a8sHWgiVCZkstybMff2M9R6DVU4Y96Rfsg8mqYs7K3xcYSEG1zMcq2iSTNwLD6FgfXvxxxWpwEP9Tbyin47RXvE`

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
- a standalone ZK verifier program is deployed on Solana Testnet
- program-integrated verifier work is staged behind Squads proposal index `3`

What is **not** claimed:

- full verifier-CPI enforcement on-chain
- anonymous private treasury execution
- a fake “fully trustless everything” marketing claim

### Real proof

- ZK matrix: [Open ZK capability matrix](https://privatedao.org/documents/zk-capability-matrix/)
- Integration packet: [Open integration evidence](https://privatedao.org/documents/frontier-integrations/)

Testnet verifier references:

- Standalone verifier program: `5H7Afyqdh5yPekkZJ5UM2j3HNB2bRvU8aVv8XoqeAW1j`
- Standalone verifier receipt: `zwqNsA3kNP1mgcaS6zNdR92LLdssFULXfsRdkMK3UxraKLM6wYDoPaWCwV3J9PqApK5xJJH8TpxsGyCRcdEah67`
- Current integrated binary buffer: `HXcaUbT7Q8euufUbDKuhoRkSSYQPwUwmhw69TdePV6uY`
- Squads timelock release target: `2026-05-27T02:25:39Z`

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

Current Testnet settlement references:

- Configure REFHE envelope: `3fygnmHzFpRQEbHq9q6u3djBnkTEcYz9y1TSwxDmbnuemshrMwLmy9CqpjifjRb7SmW3DbmXrkyq35cnjU7mMSPi`
- Settle REFHE envelope: `5TmS2AcpAmifcoG97U63Unzy7wt7B2NfyhBRs8Z6C4r1eqcWthEqf3GLcZXQ33sVYHf9YwfvBNhZD8ZZdt4HRwEY`
- Configure MagicBlock corridor: `4UiUumtuGeDciojDA26PkQby7RFiTNb12UG4ACcvGMGfQj24PUPxK5Apeno7EY8mbCvq8nR6h6nfxDcBpjPvGvPj`
- Settle MagicBlock corridor: `22XW8XVhWwQtChNQK2aEqXv5BVBbckxUmu4NsisoZQW21KA5ii87gVNUTcNoZ9e1vYKnHmm62qP1girpzVXWN1WY`
- Execute evidence-gated payout V3: `2a8sHWgiVCZkstybMff2M9R6DVU4Y96Rfsg8mqYs7K3xcYSEG1zMcq2iSTNwLD6FgfXvxxxWpwEP9Tbyin47RXvE`

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

- that all privacy logic is enforced by an integrated on-chain verifier CPI today
- that funded IKA dWallet DKG or final 2PC-MPC signing has executed in this run
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
- `/documents/cryptographic-onchain-matrix-2026-05-25`
- `/documents/testnet-encrypted-integrations-activation-2026-05-23`
- `/documents/frontier-integrations`
- `/documents/confidential-payout-evidence-packet`
- `/documents/settlement-receipt-closure-packet`
- `/documents/real-device-runtime`
