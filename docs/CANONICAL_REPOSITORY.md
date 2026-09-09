# PrivateDAO Canonical Repository

## Source of truth

`main` is the canonical source branch for PrivateDAO product development. The
GitHub repository is private and is used for source control and CI only. AWS /
EC2 remains the production deployment authority; merging to `main` does not
publish the website, APIs, or game automatically.

`canonical-live` is a synchronized reference branch. It must point to the same
commit as `main` after every approved repository release.

The live website and PDAO Worlds game are separate deployment surfaces. Their
runtime assets and secrets must not be replaced by repository cleanup or by
Kernel work.

## Active architecture

- `packages/privatedao-runtime/` is the provider-neutral Kernel and Protocol
  contract boundary.
- `packages/privatedao-runtime/src/catalog.ts` is the product capability
  catalog.
- `packages/privatedao-runtime/src/networks.ts` is the network capability
  matrix. A network is not advertised as available without a real adapter and
  independent evidence.
- `packages/privatedao-runtime/src/adapters.ts` is the injected transport
  boundary for network adapters. Product code must not contain direct RPC
  calls or private-key handling.
- `apps/web/` contains the commercial web surface and product entry points.
- `apps/web/src/lib/runtime-catalog.generated.ts` is a checked-in, generated
  projection of the Kernel catalog for the static web build. It is regenerated
  by `scripts/build-web-runtime-catalog.ts` and verified in CI so product
  selection cannot drift from the canonical product/network contract.
- `docs/generated/` contains execution evidence only; it is not a source of
  secrets or a substitute for an independent E2E test.

The active product families are Blind Verification, Record Verification,
Confidential Payroll, Private Treasury, Private Governance, Private Auctions,
and the Agent Marketplace. PDAO Worlds remains an independent game product.

## Archive policy

Old integration experiments and release states are preserved as immutable
`archive-*` tags. They are not active deployment sources. Dependabot branches
remain owned by automation and are not treated as product sources.

Before moving a reference branch, create an archive tag for its current commit,
verify the tag remotely, and only then fast-forward the reference branch to
`main`. Never delete a tag that is the only recovery copy of a release.

## Security boundary

Runtime secrets, wallet keypairs, provider credentials, tokens, and deployment
files stay outside Git. Only redacted examples may be committed. Cleanup must
be copy-first and must not touch the live host, game deployment, or secret
stores.

## Release gate

A product or network is release-ready only when its real adapter, lifecycle,
receipt/reconciliation path, failure behavior, privacy checks, and independent
Devnet/Testnet evidence are present. A planned network may remain in the
matrix, but it must not be presented as supported in the customer surface.
