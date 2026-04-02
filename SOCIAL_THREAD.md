# PrivateDAO — Social Thread

## Short Post

PrivateDAO is a Solana devnet governance product built for private voting.

It replaces public live tallies with a commit-reveal flow, keeps treasury actions behind a timelock, and adds recipient / mint checks for treasury execution.

Live now:

- repo: https://github.com/X-PACT/PrivateDAO
- frontend: https://x-pact.github.io/PrivateDAO/
- devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

## Full Thread

### Post 1

PrivateDAO is a Solana devnet governance product built for one practical goal:
private voting without breaking real DAO operations.

Repo:
https://github.com/X-PACT/PrivateDAO

Frontend:
https://x-pact.github.io/PrivateDAO/

### Post 2

The core problem is simple:
most DAO voting is public while the vote is still live.

That creates whale pressure, vote buying, and treasury signaling before governance is actually settled.

### Post 3

PrivateDAO uses a commit-reveal lifecycle:

- commit: submit a hidden vote commitment
- reveal: disclose the vote after the voting window closes
- finalize: settle the result after reveal
- execute: enforce a timelock before treasury execution

### Post 4

This means:

- no reveal before commit
- no finalize before reveal ends
- no execution before timelock
- no double execute
- no delegation double-use

### Post 5

Treasury safety is also built in:

- `SendSol` validates the configured recipient
- `SendToken` validates mint alignment
- token-account ownership and authority assumptions are checked

### Post 6

What is live today:

- deployed devnet program
- docs/frontend
- SDK helpers
- operator CLI for create, commit, reveal, finalize, execute, deposit, and migration
- proposal listing and RPC health tooling

### Post 7

PrivateDAO is presented honestly as a real devnet beta product.

Not a mockup.
Not a mainnet-ready audit claim.
A working Solana governance system with clear safety boundaries and real operator flows.

### Post 8

Current devnet program:
`5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

Looking for feedback from:

- Solana builders
- DAO operators
- Realms and governance contributors
- hackathon judges and ecosystem reviewers
