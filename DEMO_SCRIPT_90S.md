# PrivateDAO — 60 to 90 Second Demo Script

## 60 Second Version

PrivateDAO is a Solana governance protocol for DAOs that want private voting without giving up execution discipline.

The core issue is that most DAO votes are public while voting is still in progress. That creates whale pressure, vote buying, and treasury signaling.

PrivateDAO fixes that with a commit-reveal flow. During voting, voters submit a hidden commitment. After the vote closes, they reveal their vote and salt. Then the proposal can be finalized, and execution is still delayed behind a timelock.

On top of privacy, the treasury path is guarded. `SendSol` validates the configured recipient, and `SendToken` checks mint alignment plus token-account ownership assumptions.

What makes this a product instead of just a contract is the full stack around it: a deployed devnet program, a live docs frontend, operator CLI flows, an SDK, and migration-oriented tooling for DAO operators.

Today, this is a real devnet beta on Solana, built for safer governance execution and more credible private voting.

## 90 Second Version

PrivateDAO is a Solana devnet governance product designed around one specific governance failure: public live voting.

When votes are visible before the vote ends, smaller voters can be pressured by whales, vote buying becomes easier, and treasury intent leaks into the market before governance is final.

PrivateDAO replaces that with commit-reveal voting.

First, voters commit a hidden vote hash.
Second, after the voting window closes, they reveal the vote and salt.
Third, the proposal is finalized only after the reveal window ends.
Fourth, treasury execution still waits for a timelock before it can happen.

That lifecycle gives us important invariants:

- no reveal before commit
- no finalize before reveal ends
- no execution before timelock
- no double execute
- no delegation double-use

The treasury side is also hardened. `SendSol` validates the configured recipient, and `SendToken` validates mint matching plus token-account ownership and authority assumptions.

What is live today is not just a contract. The project includes a deployed devnet program, a GitHub Pages frontend, operator CLI scripts, an SDK, proposal inspection tools, migration-oriented Realms helpers, and RPC tooling.

So the pitch is simple:
PrivateDAO makes private governance on Solana more practical by combining hidden voting, timelocked execution, and treasury safety in a real devnet product.

## Suggested Screen Flow

1. Open the live frontend and show the high-level governance flow.
2. Point to the deployed devnet program ID.
3. Show one proposal in the frontend or via the proposal-listing CLI.
4. Explain commit, reveal, finalize, and timelocked execute.
5. Close on treasury checks and migration path.
