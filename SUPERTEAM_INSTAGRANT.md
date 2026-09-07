# PrivateDAO — Superteam Instagrant Draft

## Project

PrivateDAO

## One-line Description

PrivateDAO is a Solana governance protocol for private voting with commit-reveal, timelocked execution, and treasury safety checks.

## What The Project Does

PrivateDAO helps DAOs avoid public live voting pressure by replacing visible in-progress tallies with a commit-reveal lifecycle.

The product supports:

- hidden vote commitments during the voting window
- later reveal with `(vote, salt)`
- deterministic finalization after reveal
- timelocked treasury execution
- treasury recipient and mint validation
- proposal-scoped delegation
- keeper-assisted reveal
- migration-oriented support for Realms-style DAO operators

## Why This Matters For Solana

Solana has strong DAO and wallet infrastructure, but governance privacy is still a weak point in practical DAO operation.

PrivateDAO focuses on a concrete governance failure:

- whale pressure from public live votes
- vote buying around visible tallies
- treasury signaling before governance is final

The goal is not to replace the whole DAO stack. The goal is to make one painful part of governance meaningfully better while staying compatible with real operator workflows.

## Current State

This is a real devnet beta product.

Live components include:

- deployed devnet program
- GitHub Pages frontend
- operator CLI flows
- SDK helpers
- proposal listing tooling
- RPC health and contract inspection tooling
- migration helper for Realms-oriented DAO flows

## Links

- GitHub repository: https://github.com/X-PACT/PrivateDAO
- Live frontend: https://privatedao.org/
- Devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`
- Current PR: https://github.com/X-PACT/PrivateDAO/pull/6

## Why It Is A Good Fit For Superteam

PrivateDAO fits Superteam because it is:

- a real Solana builder project
- open-source
- dev tooling and governance infrastructure oriented
- useful as public goods style DAO infrastructure
- suitable for continued iteration after hackathon review

## What Support Would Accelerate

Support would be used to:

- complete stronger end-to-end verification on a fully provisioned Anchor environment
- deepen test coverage around lifecycle and treasury edge cases
- polish operator and frontend flows for devnet adoption
- continue Realms-oriented migration and DAO onboarding improvements

## Honest Scope Note

PrivateDAO should be described today as a serious devnet beta product.

It should not yet be described as audited or mainnet-ready until full verification, external review, and operational hardening are completed.
