# PrivateDAO — Superteam Builder Post

## Short Version

PrivateDAO is a Solana devnet governance product built for private voting.

It replaces public live tallies with a commit-reveal flow, keeps treasury execution behind a timelock, and adds recipient and mint validation for treasury actions.

Live today:

- repo: https://github.com/X-PACT/PrivateDAO
- frontend: https://privatedao.org/
- devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

We are looking for feedback from Solana builders, DAO operators, and ecosystem contributors working on governance, Realms integrations, and migration paths.

## Full Version

PrivateDAO is a Solana governance product focused on one practical problem: public live voting.

Most DAO governance exposes the vote while voting is still active. That creates whale pressure, vote buying, and treasury signaling before governance is final.

PrivateDAO uses a commit-reveal lifecycle instead:

- `commit`: voters submit a hidden vote commitment
- `reveal`: voters later reveal `(vote, salt)`
- `finalize`: proposal result settles after the reveal window
- `execute`: treasury actions remain delayed behind a timelock

The product also hardens the treasury path:

- `SendSol` validates the configured recipient
- `SendToken` validates mint alignment
- token-account ownership and authority assumptions are checked

What makes this more than a contract demo is the full operating surface around it:

- deployed devnet program
- live docs/frontend
- operator CLI flows
- SDK helpers
- proposal-listing and RPC health tooling
- migration-oriented Realms support

Links:

- GitHub: https://github.com/X-PACT/PrivateDAO
- Live frontend: https://privatedao.org/
- Current PR: https://github.com/X-PACT/PrivateDAO/pull/6

This is presented honestly as a real devnet beta product, not as an audited mainnet governance system.

If you are building in Solana governance, DAO operations, or public goods infrastructure, feedback is very welcome.
