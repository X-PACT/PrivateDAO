# PrivateDAO: private voting infrastructure for Solana DAOs

PrivateDAO is a working Solana devnet governance product built around commit-reveal voting.

Core idea:

- votes are committed privately during the voting window
- tally stays hidden during commit phase
- voters reveal later with `(vote, salt)`
- proposals finalize after the reveal window
- treasury execution stays behind an explicit timelock

What is live today:

- deployed devnet program:
  `62qdrtJGP23PwmvAn5c5B9xT1LSgdnq4p1sQsHnKVFhm`
- live docs frontend:
  https://x-pact.github.io/PrivateDAO/
- repo:
  https://github.com/X-PACT/PrivateDAO
- open PR with the current hardening and productization work:
  https://github.com/X-PACT/PrivateDAO/pull/6

What makes the project interesting:

- commit-reveal voting for Solana DAO governance
- timelocked treasury execution
- recipient and mint checks for treasury actions
- proposal-scoped private delegation
- keeper-assisted reveal path
- Realms-oriented migration path
- voter-weight record support for Realms-style integration work

Why this matters:

Public voting creates whale pressure, vote buying, and treasury signaling problems. PrivateDAO focuses on removing live tally visibility without pretending the rest of governance disappears.

What has been improved recently on the current branch:

- stronger lifecycle and treasury validation coverage
- cleaner devnet-beta product positioning
- better operator CLI flows
- live proposal listing tools
- JSON-RPC based health and contract inspection flows
- improved docs around Solana RPC requirements and deployment model

Important note:

This is presented as a real devnet beta product, not as an audited mainnet governance system.

Happy to hear feedback from builders working on:

- DAO tooling
- Realms integrations
- migration workflows
- governance safety
- Solana developer UX
