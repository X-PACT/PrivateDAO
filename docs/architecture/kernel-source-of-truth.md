# Kernel Source Of Truth

## Canonical branch

`main` is the canonical development and integration branch for the PrivateDAO
Kernel and product contracts. `canonical-live` is kept synchronized with
`main` until the deployment cutover is separately verified. The immutable
pre-Kernel snapshot is preserved as the Git tag
`archive/legacy-integrations-20260909`.

## Runtime boundary

The provider-neutral source of truth is
`packages/privatedao-runtime/`. Product code must use the Kernel and Protocol
contracts for provider selection, authorization, lifecycle state, receipts,
reconciliation, retry/idempotency semantics, and normalized errors.

Provider-specific RPC, wallet, relay, and transaction construction belongs in
an adapter behind `KernelProvider`. A provider name in a document, route, or
catalog is not evidence of support.

## Product boundary

The declared product capabilities are catalogued in
`packages/privatedao-runtime/src/catalog.ts`. Application exposure is tracked
in `application-bindings.ts` and is intentionally classified as one of:

- `kernel-gateway`: routed through `ProductExecutionGateway`;
- `legacy-provider`: an existing route that is not Kernel evidence;
- `unbound`: not executable and must not be advertised as supported.

This classification is enforced by validation and CI. A product is not marked
Kernel-backed merely because a legacy endpoint exists.

The first Kernel-native application capabilities are `payroll.calculate`,
`treasury.policy.check`, and `verification.record.create` on Solana Devnet.
They produce deterministic receipts
with no wallet signature or settlement side effect: the former calculates a
payroll batch, while the latter evaluates bounded budget, transaction-limit,
recipient-limit, and asset-policy checks. Record creation produces a digest
and selected public fields without returning the source payload; it does not
create a public URL or on-chain anchor. Record verification now recomputes and
compares the digest, including a tamper-failure path, but it remains an
off-chain Kernel capability. Payroll approval, settlement, and the other
product actions remain explicitly classified until their real provider
lifecycle is wired and independently tested.

Agent discovery is also Kernel-backed as a read-only fetch. It returns only
the received Agent Card and fails on non-HTTPS, non-JSON, or non-2xx responses;
it does not fabricate agents, usage, payments, or adoption.

## Network truth

Only `solana-devnet` is currently an available runtime network in the Kernel
catalog. Other requested networks remain planned until each has a real
provider adapter, transaction lifecycle, receipt path, and independent tests.

## Migration rule

New product work starts from the Kernel contracts and adds an explicit
application binding plus evidence. Legacy integration code is retained only
while a live route or reproducibility requirement depends on it; it is not
copied into new product paths and is not promoted by discovery metadata.

The archive tag is a recovery point, not a second source of truth. Changes are
made on `main`, tested locally and in CI, then mirrored to `canonical-live`.
