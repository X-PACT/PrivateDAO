# PrivateDAO — Outreach Message Pack

## Short Outreach Message

PrivateDAO is a Solana Devnet governance and treasury product built for private voting, confidential payroll and bonus approvals, and execution-safe treasury operations.

It replaces public live tallies with a commit-reveal flow, adds `zk_enforced` hardening, keeps treasury execution behind a timelock, and supports REFHE- and MagicBlock-bound confidential payout paths without moving signing authority away from the wallet.

Project links:

- repo: https://github.com/X-PACT/PrivateDAO
- frontend: https://privatedao.org/
- investor reel: https://youtu.be/cwsPpNLiwbo
- devnet program: `5AhUsbQ4mJ8Xh7QJEomuS85qGgmK9iNvFqzF669Y7Psx`

We would value feedback from Solana builders, DAO operators, and governance infrastructure reviewers.

## Longer Outreach Message

PrivateDAO is a working Solana Devnet governance and treasury product focused on a practical operational problem: public live voting and exposed treasury intent.

Most DAO votes are visible while voting is still in progress. That creates whale pressure, vote buying, and treasury signaling before the vote is final.

PrivateDAO uses a commit-reveal governance lifecycle and extends it into confidential treasury operations:

- hidden vote commitment during the voting window
- reveal after voting closes
- finalization only after the reveal window
- execution only after a treasury timelock
- confidential payroll and bonus plans with encrypted manifests
- proposal-level `zk_enforced` and reviewer-visible proof surfaces
- REFHE and MagicBlock settlement gates for sensitive payout execution

The treasury path is hardened with recipient validation for `SendSol`, mint plus account checks for `SendToken`, and a read-only backend indexing layer for responsive runtime diagnostics and proposal inspection.

What is live today:

- deployed Devnet program
- live frontend product surface
- backend read node
- operator CLI flows
- confidential payout and MagicBlock corridor tooling
- runtime diagnostics and reviewer artifacts
- migration-oriented support for Realms-style DAO workflows
- a repo-native investor reel and weekly updates

Links:

- GitHub: https://github.com/X-PACT/PrivateDAO
- Frontend: https://privatedao.org/
- Investor reel: https://youtu.be/cwsPpNLiwbo
- Current PR: https://github.com/X-PACT/PrivateDAO/pull/6

This should be described honestly as a serious Devnet beta product with reviewer-visible operational depth today, not as an audited mainnet governance system.

## Direct Contact Links

- Primary email: [fahd.kotb@tuta.io](mailto:fahd.kotb@tuta.io)
- Secondary email: [i.kotb@proton.me](mailto:i.kotb@proton.me)
- Backup email: [eslamkotb.fmt@gmail.com](mailto:eslamkotb.fmt@gmail.com)
- WhatsApp: [Direct chat](https://wa.me/201124030209)

Discord direct link requires a valid Discord invite, username, or numeric user ID.
