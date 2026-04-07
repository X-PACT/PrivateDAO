# Mainnet Go-Live Checklist

This checklist is the shortest practical path to decide whether PrivateDAO is ready for a real mainnet cutover.

Use it as a go or no-go surface, not as marketing copy.

## 1. Repository Integrity

All repository-bound checks must pass first.

- `bash scripts/verify-all.sh`
- `npm run verify:frontend-surface`
- `npm run verify:submission-registry`
- `npm run verify:generated-artifacts`
- `npm run verify:cryptographic-manifest`

Required outcome:

- reviewer artifacts are fresh
- proof registries are aligned
- runtime and operational evidence are current
- no stale generated files remain

## 2. Program And Authority Controls

Before mainnet, authority handling must be explicit and hardened.

- upgrade authority is moved to an explicit multisig or governance-owned path
- treasury operator path is documented
- token admin path is documented
- authority rotation procedure is documented and rehearsed
- emergency ownership and veto authority are understood by operators

Blocking condition:

- do not cut over while a single personal key still acts as an unchecked production authority

## 3. External Security Review

Repository quality is not a substitute for an external audit.

- external audit is completed
- findings are reviewed and closed or accepted with explicit residual-risk notes
- critical and high findings are not left unresolved
- the audit scope covers the deployed program version intended for mainnet

Blocking condition:

- do not call the system mainnet-ready while external audit status is still effectively pending

## 4. Wallet And Runtime Validation

Mainnet readiness requires real signer environments, not repo-only confidence.

- Phantom runtime capture recorded
- Solflare runtime capture recorded
- Backpack runtime capture recorded
- Glow runtime capture recorded
- Android runtime capture recorded when Android is a supported path

Canonical evidence:

- `docs/runtime/real-device.generated.md`
- `docs/runtime/real-device-captures.json`

Blocking condition:

- do not claim production readiness while real-device runtime evidence is still missing

## 5. RPC And Monitoring Readiness

The protocol depends on RPC infrastructure. Treat that dependency as part of production design.

- primary and fallback RPCs are selected
- rate-limit behavior is understood
- transaction failure alerts are routed
- proposal lifecycle alerts are routed
- operational diagnostics are tested against the chosen providers

Required outcome:

- operators know which RPC is primary, which one is fallback, and what to do when either degrades

## 6. Treasury Safety

Treasury movement is the highest-consequence path and must be reviewed separately.

- recipient validation paths are reviewed
- token mint and ownership assumptions are reviewed
- treasury funding and execution runbooks are rehearsed
- rollback, pause, or containment procedures are written

Blocking condition:

- do not cut over while treasury recovery or emergency handling remains undocumented

## 7. ZK Boundary Decision

The current stack anchors proposal-bound proof material on-chain, records parallel on-chain verification receipts in the legacy path, and keeps Groth16 witness generation and proving off-chain. The V2 strict security layer adds `DaoSecurityPolicy`, `ProposalExecutionPolicySnapshot`, `ProposalProofVerification`, threshold-attested proof records, canonical payload binding, and expiry checks.

Before mainnet, be explicit about what is and is not claimed.

- on-chain proof anchors are verified
- on-chain parallel verification receipts are reviewed
- V2 strict proof policy is initialized for the target DAO when strict finalization is required
- any policy change after initialization is performed through `update_dao_security_policy_v2` and reviewed as monotonic, not a rollback
- `ProposalExecutionPolicySnapshot` exists for proposals that will use V2 strict finalization
- proposal policy snapshots are treated as immutable object-level records once captured
- off-chain proof generation and proving flow are reviewed
- explorer-visible anchor path is documented
- operator messaging does not overstate the enforcement boundary

Required outcome:

- the team can state clearly which path is active: legacy proof anchoring, threshold-attested V2 strict finalization, or future cryptographic verifier CPI. Do not describe threshold attestation as cryptographic verification.

## 8. Confidential Settlement V2 Boundary

Strict confidential payout execution is only mainnet-candidate when the V2 evidence path is active.

- `SettlementEvidence` exists for every strict confidential payout execution
- `SettlementEvidence.status == Verified`
- settlement evidence binds to the DAO, proposal, payout plan, payout fields, and source-specific evidence kind
- `SettlementConsumptionRecord` is created exactly once per evidence account
- evidence TTL and attestor policy are reviewed
- REFHE and MagicBlock trust boundaries are described as attested unless a cryptographic receipt or verifier CPI is integrated

Blocking condition:

- do not claim cryptographic settlement verification when the active mode is threshold-attested settlement evidence

## 9. Release Ceremony

Mainnet cutover should be treated as an operational ceremony, not an ad hoc deploy.

- release ceremony is reviewed
- release drill evidence is current
- go-live attestation is regenerated
- deployment attestation is regenerated
- acceptance matrix and proof package are current

Canonical evidence:

- `docs/release-ceremony.md`
- `docs/release-drill.generated.md`
- `docs/deployment-attestation.generated.json`
- `docs/go-live-attestation.generated.json`
- `docs/mainnet-acceptance-matrix.generated.md`
- `docs/mainnet-proof-package.generated.md`

## 10. Final Decision Rule

PrivateDAO is ready for mainnet cutover only when all of the following are true:

- repository verification passes
- authority handling is hardened
- external security review is complete
- real-device wallet evidence exists
- RPC and monitoring operations are prepared
- treasury procedures are documented and rehearsed
- ZK boundary language is honest and stable
- release ceremony artifacts are current

If any of these remain open, the correct state is:

- devnet-proven
- internally hardened
- reviewable
- not yet cleared for mainnet cutover
