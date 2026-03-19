# PrivateDAO — Outreach Message Pack

## Short Outreach Message

PrivateDAO is a Solana devnet governance product built for private voting.

It replaces public live tallies with a commit-reveal flow, keeps treasury execution behind a timelock, and adds recipient and mint validation for treasury actions.

Project links:

- repo: https://github.com/X-PACT/PrivateDAO
- frontend: https://x-pact.github.io/PrivateDAO/
- demo reel: https://github.com/X-PACT/PrivateDAO/blob/main/docs/assets/demo-reel.gif
- devnet program: `62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm`

We would value feedback from Solana builders, DAO operators, and governance infrastructure reviewers.

## Longer Outreach Message

PrivateDAO is a working Solana devnet governance product focused on one practical governance problem: public live voting.

Most DAO votes are visible while voting is still in progress. That creates whale pressure, vote buying, and treasury signaling before the vote is final.

PrivateDAO uses a commit-reveal governance lifecycle instead:

- hidden vote commitment during the voting window
- reveal after voting closes
- finalization only after the reveal window
- execution only after a treasury timelock

The treasury path is also hardened with recipient validation for `SendSol` and mint plus account checks for `SendToken`.

What is live today:

- deployed devnet program
- docs/frontend
- operator CLI flows
- SDK helpers
- proposal-listing and RPC health tooling
- migration-oriented support for Realms-style DAO workflows
- animated demo reel in the repository

Links:

- GitHub: https://github.com/X-PACT/PrivateDAO
- Frontend: https://x-pact.github.io/PrivateDAO/
- Demo reel: https://github.com/X-PACT/PrivateDAO/blob/main/docs/assets/demo-reel.gif
- Current PR: https://github.com/X-PACT/PrivateDAO/pull/6

This should be described honestly as a serious devnet beta product today, not as an audited mainnet governance system.
