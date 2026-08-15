<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# PrivateDAO

PrivateDAO helps organizations keep sensitive operations private and make
the final outcome independently verifiable.

The public product message is:

> Private decisions. Verifiable outcomes.

The current live website is [privatedao.org](https://privatedao.org/). This
repository is the engineering and evidence repository behind the platform;
it is not the production deployment. Amazon, the live website, and the
current production database are operated separately.

## Current Product Surface

These are the primary product lanes currently presented on the live site:

| Product | Customer outcome | Live entry | Repository status |
| --- | --- | --- | --- |
| **Blind Verification** | Verify that a private policy or claim was satisfied without exposing sensitive inputs. | [Open product](https://privatedao.org/proof-workflows/blind-policy/) | Existing Solana product and proof surface |
| **Private Governance** | Coordinate proposals, approvals, votes, and execution with a reviewable result. | [Open governance](https://privatedao.org/govern/) | Existing Solana governance application |
| **Treasury Coordination** | Review and coordinate treasury actions with clear authorization and evidence. | [Open treasury](https://privatedao.org/treasury/) | Existing product corridor |
| **Workflows** | Turn sensitive business processes into reviewable, evidence-linked outcomes. | [Explore workflows](https://privatedao.org/proof-workflows/) | Product surface assembled from existing capabilities |
| **Confidential Auctions** | Run sealed bidding and publish only the final, verifiable result. | [Open auctions](https://privatedao.org/auctions/) | Devnet implementation; not production-certified |
| **Decision Intelligence** | Give operators better context before approving or signing an action. | [Open intelligence](https://privatedao.org/intelligence/) | Specialist surface; claims must match live evidence |

Supporting routes include [Pricing](https://privatedao.org/pricing/),
[Pilots](https://privatedao.org/engage/),
[Developers](https://privatedao.org/developers/),
[Trust](https://privatedao.org/trust/),
[Docs](https://privatedao.org/documents/), and
[Community](https://privatedao.org/community/).

## What Is Live

The live homepage currently presents PrivateDAO as Solana-based confidential
coordination infrastructure for organizations. Its central workflow is:

1. Choose a workflow.
2. Keep sensitive details private while the work is active.
3. Finish with a clear result, receipt, or on-chain reference.

The live site is the source of truth for public availability and wording.
This repository is the source of truth for the implementation that is
committed here. A feature is not production-supported merely because its code,
route, badge, or documentation exists in this repository.

## Repository Map

| Path | Purpose | Canonicality |
| --- | --- | --- |
| `apps/web/` | Next.js product UI and web API routes | Canonical application source |
| `programs/private-dao/` | Existing PrivateDAO Solana program | Existing protocol source |
| `programs/privatedao-auction/` | Standalone confidential-auction program | New Devnet auction source |
| `idl/` | Checked-in Anchor IDLs used by clients and review | Generated from programs, reviewed before commit |
| `scripts/` | Build, verification, certification, and operational tooling | Executable engineering tooling |
| `docs/` | Architecture, security, evidence, product, and operating documents | Evidence and documentation source |
| `tests/`, `test/` | Protocol and application tests | Validation source |
| `dist/` | Packaged review artifacts required by CI | Generated release artifacts only |
| Root route folders such as `about/` and `proof/` | Historical static mirror output | Generated compatibility surface, not application source |

See [`docs/REPOSITORY_MAP.md`](docs/REPOSITORY_MAP.md) for source ownership,
generated-file rules, and the cleanup boundary.

## Confidential Auctions

The auction implementation is intentionally isolated from the existing large
PrivateDAO program:

- Program: `privatedao-auction`
- Program ID: `4Z7AeFRZHBCok68hhbUgVLC3uFaEP2aDWozsYVksPuQd`
- Runtime target: Solana Devnet and MagicBlock development environment
- Public status: **Devnet implementation; not Mainnet or production-certified**
- UI route in source: `/auctions`
- Walletless verification route in source: `/verify/auction`

The intended lifecycle is:

```text
Create auction
  -> delegate the selected state
  -> submit private bids in the private execution session
  -> close and compute the result
  -> commit the final result to Solana
  -> undelegate/reconcile
  -> publish a durable verification receipt
```

MagicBlock-specific evidence and limitations are kept under
[`docs/magicblock/`](docs/magicblock/). The primary UI should describe the
customer outcome, not internal runtime terminology.

## Development

Prerequisites:

- Node.js 22+
- Rust stable
- Solana CLI
- Anchor CLI compatible with the checked-in workspace
- A local Solana wallet for Devnet testing only

Install web dependencies and run the web app:

```bash
npm --prefix apps/web install
npm --prefix apps/web run dev
```

Build and check the auction program:

```bash
cargo check -p privatedao-auction
bash scripts/build-auction-sbf.sh
```

Run the auction Devnet certification gate only when the required development
wallets and MagicBlock development credentials are available:

```bash
npm run certify:auction:devnet
```

The certification command must never be interpreted as production or Mainnet
certification. It must fail rather than manufacture a signature, receipt, or
runtime session.

## Deployment Boundaries

| Environment | Role | Status in this repository |
| --- | --- | --- |
| Local | Development and tests | Allowed |
| Solana Devnet | Protocol rehearsal | Allowed for approved tests |
| MagicBlock development runtime | Auction execution rehearsal | Development evidence only |
| Amazon production | Existing live deployment | Not changed by repository commits |
| Current production database | Existing application state | Not changed by repository commits |
| Solana Mainnet | Production protocol | No auction deployment from this repository |

GitHub is used for source control and review. A push to GitHub is not an
Amazon deployment. Production release requires a separate reviewed deployment
step, environment configuration, migration plan, visual check, and rollback
plan.

## Evidence And Security

- Never commit `.env` files, PEM files, wallet keypairs, private keys, secrets,
  production receipts, or deployment state.
- Never treat a UI label, hash, metadata field, or documentation statement as
  runtime evidence.
- Keep private bid values and losing bids out of public Solana state and public
  receipts.
- Use the reports under `docs/magicblock/` for diagnostic evidence, not as
  public product claims.
- Review [`SECURITY.md`](SECURITY.md), [`NOTICE.md`](NOTICE.md), and
  [`TERMS_OF_REVIEW.md`](TERMS_OF_REVIEW.md) before redistribution.

## Known Repository Boundaries

This repository still contains historical static mirror output and older
operational integrations because other scripts and review checks reference
them. They are not automatically part of the current commercial product
surface. The cleanup plan classifies them before removal so generated release
artifacts, rollback evidence, and existing runtime paths are not confused with
canonical application source.

For current public availability, use the live site. For implementation
status, use the source tree, tests, and evidence files together.

## License And Brand

Core source remains subject to the applicable repository licenses. PrivateDAO
brand identity, official deployments, product design, protected evidence, and
commercial service packaging are reserved. See [`NOTICE.md`](NOTICE.md),
[`TERMS_OF_REVIEW.md`](TERMS_OF_REVIEW.md), and [`LICENSE`](LICENSE).
