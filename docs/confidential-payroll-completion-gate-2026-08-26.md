<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
# Confidential Payroll Completion Gate

Date: 2026-08-26

This is the delivery boundary for PrivateDAO Confidential Payroll. It separates
implemented, locally verified capabilities from capabilities that require a
real backend, provider authorization, wallet signature, or independent review.

## Delivered Now

- Browser-local payroll calculation using integer cents and tax basis points.
- Gross, tax, deductions, net, budget, duplicate payout-key, arithmetic, and
  policy checks.
- Browser-local AES-256-GCM encryption with PBKDF2-SHA256 key derivation.
- Only commitments, hashes, and approved aggregate claims are sent to the
  Record Verification API.
- Portable public payroll verification route:
  `/verify/payroll?receiptId=<receipt>`.
- Existing Record Verification integration now uses the canonical public API
  base, which is required for the static frontend.
- A payroll-specific Circom circuit and Groth16 artifacts exist in `zk/`:
  source, R1CS, WASM, proving keys, verification key, witness tooling, and
  sample proof artifacts.
- Devnet-only Umbra intent workflow with explicit lifecycle and privacy-tier
  metadata.

## Not Yet Complete

### 1. Real payroll control plane

The current browser flow does not persist an encrypted payroll manifest,
organization, employee directory, approval chain, or immutable payroll batch in
the production backend. A complete product needs tenant isolation, roles,
maker-checker approvals, policy versions, idempotent batch state, audit events,
and encrypted manifest storage outside the browser.

### 2. Tax and deductions engine

The current calculator supports a configurable tax rate and deductions, not
jurisdictional payroll compliance. Production completion requires versioned
country/state rules, effective dates, withholding categories, benefits,
garnishments, bonuses, rounding rules, payroll-calendar handling, and a clear
employer compliance boundary. The rule source and legal review must be named.

### 3. Umbra settlement

The current workflow is Devnet-only and returns an intent/relay receipt. It is
not a completed per-recipient Umbra payout. Full closure requires the current
official Umbra SDK flow, wallet-side proof generation, UTXO/slot data, explicit
user signing, finalized provider confirmation, recipient reconciliation, and a
provider receipt bound to the payroll batch. No Mainnet claim is made.

### 4. Payroll Groth16 binding

The payroll circuit artifact exists, but the browser payroll flow currently
does not generate and verify a payroll Groth16 proof. The circuit must be
reviewed for the actual payroll claims, compiled from pinned sources, proven and
verified in the backend or approved local engine, and bound to the public
payroll receipt and policy commitment. The current circuit must not be marketed
as proving arbitrary payroll correctness.

### 5. Blind/Record Verification proof link

The public Record Verification certificate path works as a public claims
receipt, subject to the deployed API being reachable. It currently proves the
submitted aggregate claims and commitments; it does not independently prove
that Umbra settled every employee payout until settlement evidence is attached.
Expiry, revocation, scoped auditor access, and selective disclosure are still
needed for an enterprise-grade proof link.

### 6. Reconciliation and operations

Required before commercial launch: per-recipient payout status, retries,
partial-failure handling, duplicate prevention across batches, provider
reconciliation, exportable audit pack, webhooks, alerting, retention policy,
backup/restore, and operator controls.

### 7. Enterprise assurance

KMS integration exists as a runtime signing path for enterprise licensing, but
an active production KMS key policy and deployment evidence were not found in
the source tree. External security audit completion is not documented. The
repository contains internal reviews, independent-verification material, and an
audit handoff package; these are not a third-party audit opinion.

### 8. SDK and commercial packaging

The Blind Policy TypeScript SDK path is pilot-ready. Rust and Python SDKs,
versioned payroll SDKs, public package release, tenant billing, support policy,
SLA, and production pricing are not closed as a single payroll product.

## Release Decision

`NOT READY FOR REAL-FUNDS PAYROLL`

The safe deliverable today is a Devnet/browser demonstration plus public
aggregate Record Verification. It is not safe to describe the product as a
complete payroll processor or to accept production payroll funds until the
control plane, jurisdictional rules, provider settlement, proof binding, and
external security review gates are closed.
