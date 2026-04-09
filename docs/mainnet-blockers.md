# Mainnet Production Blocker Register

This register is intentionally conservative. It separates repository readiness from real-funds mainnet approval.

Current decision:

- `blocked-external-steps`

Current claim boundary:

- PrivateDAO is devnet-proven, internally hardened, and reviewer-ready.
- PrivateDAO is not cleared for real-funds mainnet production until the blockers below are closed with evidence.

Canonical machine-readable source:

- `docs/mainnet-blockers.json`

## Open Blockers

| Blocker | Category | Severity | Status | Required Before |
| --- | --- | --- | --- | --- |
| `external-audit-completion` | security | critical | pending-external | mainnet-real-funds |
| `upgrade-authority-multisig` | custody | critical | pending-external | mainnet-real-funds |
| `production-monitoring-alerts` | operations | high | pending-external | mainnet-real-funds |
| `real-device-wallet-runtime` | runtime | high | pending-runtime-captures | mainnet-real-funds |
| `magicblock-refhe-source-receipts` | privacy-settlement | high | pending-integration | mainnet-real-funds |
| `mainnet-cutover-ceremony` | release | high | pending-external | mainnet-real-funds |

## Closure Standard

Each blocker can only move to `complete` when the evidence is recorded in repository-linked artifacts or a named external audit or operations packet.

Minimum closure evidence:

- `external-audit-completion`: external audit report, finding disposition, and deployed candidate version binding.
- `upgrade-authority-multisig`: multisig or governance-owned authority path, signer policy, and rotation rehearsal record.
- `production-monitoring-alerts`: alert destinations, runtime monitors, incident owners, and tested failure signals.
- `real-device-wallet-runtime`: wallet/device/browser captures for the supported production matrix.
- `magicblock-refhe-source-receipts`: source-verifiable settlement receipt path or documented threshold-attested residual trust model.
- `mainnet-cutover-ceremony`: final deployment hash, authority state, monitoring links, audit result, and go/no-go record.

## Evidence Index

- `external-audit-completion`: `docs/audit-handoff.md`, `docs/external-audit-engagement.md`, `docs/zk-external-audit-scope.md`, `docs/mainnet-readiness.generated.md`, `docs/launch-trust-packet.generated.md`
- `upgrade-authority-multisig`: `docs/authority-hardening.md`, `docs/authority-transfer-runbook.md`, `docs/production-custody-ceremony.md`, `docs/multisig-setup-intake.json`, `docs/multisig-setup-intake.md`, `docs/launch-ops-checklist.json`, `docs/launch-ops-checklist.md`, `docs/mainnet-cutover-runbook.md`, `docs/launch-trust-packet.generated.md`
- `production-monitoring-alerts`: `docs/launch-ops-checklist.json`, `docs/launch-ops-checklist.md`, `docs/monitoring-alert-rules.json`, `docs/monitoring-alert-rules.md`, `docs/monitoring-alerts.md`, `docs/production-operations.md`, `docs/incident-response.md`
- `real-device-wallet-runtime`: `docs/runtime/real-device.md`, `docs/runtime/real-device.generated.md`, `docs/wallet-e2e-test-plan.md`, `docs/launch-ops-checklist.json`, `docs/launch-ops-checklist.md`, `docs/launch-trust-packet.generated.md`
- `magicblock-refhe-source-receipts`: `docs/magicblock/runtime-evidence.md`, `docs/refhe-security-model.md`, `docs/canonical-verifier-boundary-decision.md`
- `mainnet-cutover-ceremony`: `docs/release-ceremony.md`, `docs/release-drill.generated.md`, `docs/launch-ops-checklist.json`, `docs/launch-ops-checklist.md`, `docs/mainnet-cutover-runbook.md`

## Verification

Run:

```bash
npm run verify:mainnet-blockers
```

The verifier does not fail because blockers are open. It fails if the blockers are missing, vague, inconsistent with the honest mainnet boundary, or missing evidence pointers.
