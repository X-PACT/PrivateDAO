# Ranger Build-A-Bear Hackathon — Main Track Positioning

## Thesis

PrivateDAO is the private governance and risk-control layer for a production-minded USDC vault strategy on Solana.

## What judges should see immediately

- live frontend
- live devnet program
- real on-chain governance lifecycle
- explorer-linked proof
- repository-native tests for lifecycle and treasury safety
- explicit statement of what is already implemented versus what still belongs to the vault strategy layer

## Why this belongs in Main Track

The strongest Main Track case is not "DAO tooling". It is:

**strategy operations with private approvals, disciplined execution, and audit-friendly proof**

This repo is not a thin UI layer. It is protocol logic with a full product surface:

- on-chain Rust program
- operator scripts
- frontend proof surface
- Android-native product surface
- live transaction evidence
- competition-grade documentation

## Strongest reviewer angle

Most vault stacks focus on execution logic and underinvest in approval integrity. PrivateDAO fixes the part that becomes dangerous once real capital exists:

- sensitive decisions leak live intent too early
- public committees create signaling and coordination problems
- treasury and risk actions need more than a chat room and one hot wallet

PrivateDAO changes that at the protocol level while preserving execution safety and operational clarity.

## Core proof points

- commit-reveal voting
- proposal-scoped delegation
- keeper-assisted reveal
- timelocked execution
- treasury validation for recipients and token mints
- live devnet proof with transaction links
- wallet-connected web and Android-native action surfaces

## Submission emphasis

Lead with:

1. the vault-operations problem
2. the hidden-consensus advantage
3. the real devnet lifecycle proof
4. the honest statement that a Ranger-seeded vault still needs the strategy adaptor and performance layer on top
