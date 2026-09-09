# PrivateDAO Integration Boundary

`packages/privatedao-runtime/` is the source of truth for product
capabilities, network availability, provider selection, authorization,
execution lifecycle, receipts, and reconciliation. This document is an
orientation map only; a provider name or page is not evidence that a product
is executable.

## Current executable boundary

The Kernel catalog currently exposes the following products on Solana Devnet:

| Product | Kernel capabilities | Application exposure |
|---|---|---|
| Blind Verification | `verification.blind.prove` | legacy provider route |
| Record Verification | `verification.record.create`, `verification.record.verify` | create unbound; verify legacy provider route |
| Confidential Payroll | `payroll.calculate`, `payroll.approve`, `payroll.settle` | calculate/approve unbound; settlement legacy provider route |
| Private Treasury | `treasury.policy.check` | unbound |
| Private Governance | `governance.proposal.execute` | unbound |
| Private Auctions | `auction.bid.commit`, `auction.settle` | legacy provider routes |
| Agent Marketplace | `agent.discover`, `agent.invoke` | hosted outside this web boundary |

The application binding ledger is authoritative for whether a route is
`kernel-gateway`, `legacy-provider`, or `unbound`. Only a `kernel-gateway`
binding with an injected, tested provider may be advertised as Kernel-backed.

## Provider and historical evidence

Umbra, MagicBlock, Ika/Encrypt, Cloak, Jupiter, QVAC, GoldRush, PUSD,
AUDD, Zerion, Torque, Txline, and related pages remain as provider-specific
implementation or evidence surfaces where current source references require
them. They must not be copied into new product paths or treated as a unified
network adapter without independent execution evidence.

Historical generated route snapshots are archived under
`docs/archive/legacy-routes/20260909/` and retain redirect stubs at their old
paths. The archive is for recovery and provenance, not product discovery.

## Verification rule

Claims about signatures, settlement, or proof must point to a current receipt,
explorer record, or independently rerunnable test. Static marketing pages,
provider metadata, and old generated snapshots do not establish live support.
