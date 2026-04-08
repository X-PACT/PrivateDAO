# Launch Operations Checklist

This checklist maps the final practical work before real-funds mainnet. It is intentionally strict: repository-defined means the procedure exists; pending-external means it still needs a real production action outside Git.

Canonical machine-readable source:

- `docs/launch-ops-checklist.json`

## Current Decision

- `blocked-external-steps`
- Production mainnet claim allowed: `false`

## Checklist

| Item | Category | Status | Required Before |
| --- | --- | --- | --- |
| `create-production-multisig` | custody | pending-external | mainnet-real-funds |
| `transfer-program-upgrade-authority` | custody | pending-external | mainnet-real-funds |
| `configure-production-timelock` | governance | repo-documented | mainnet-real-funds |
| `backup-and-recovery-procedures` | operations | repo-documented | mainnet-real-funds |
| `monitoring-setup` | operations | pending-external | mainnet-real-funds |
| `alerting-rules` | operations | repo-defined | mainnet-real-funds |
| `operator-runbooks` | operations | repo-documented | mainnet-real-funds |
| `emergency-procedures` | operations | repo-documented | mainnet-real-funds |
| `real-device-testing` | runtime | pending-runtime-captures | mainnet-real-funds |
| `wallet-integration` | runtime | repo-documented | mainnet-real-funds |
| `end-to-end-flows` | runtime | devnet-proven | mainnet-real-funds |

## Evidence Index

- `create-production-multisig`: `docs/multisig-setup-intake.json`, `docs/multisig-setup-intake.md`, `docs/authority-transfer-runbook.md`, `docs/authority-hardening.md`
- `transfer-program-upgrade-authority`: `docs/multisig-setup-intake.json`, `docs/multisig-setup-intake.md`, `docs/authority-transfer-runbook.md`, `docs/mainnet-cutover-runbook.md`
- `configure-production-timelock`: `docs/multisig-setup-intake.json`, `docs/multisig-setup-intake.md`, `docs/authority-transfer-runbook.md`, `docs/mainnet-go-live-checklist.md`
- `backup-and-recovery-procedures`: `docs/multisig-setup-intake.json`, `docs/multisig-setup-intake.md`, `docs/authority-transfer-runbook.md`, `docs/incident-response.md`
- `monitoring-setup`: `docs/monitoring-alerts.md`, `docs/monitoring-alert-rules.json`, `docs/monitoring-alert-rules.md`
- `alerting-rules`: `docs/monitoring-alert-rules.json`, `docs/monitoring-alert-rules.md`
- `operator-runbooks`: `docs/production-operations.md`, `docs/mainnet-cutover-runbook.md`, `docs/incident-response.md`
- `emergency-procedures`: `docs/incident-response.md`, `docs/authority-transfer-runbook.md`
- `real-device-testing`: `docs/runtime/real-device.md`, `docs/runtime/real-device.generated.md`, `docs/wallet-e2e-test-plan.md`
- `wallet-integration`: `docs/wallet-runtime.md`, `docs/wallet-compatibility-matrix.generated.md`, `docs/wallet-e2e-test-plan.md`
- `end-to-end-flows`: `docs/load-test-report.md`, `docs/devnet-resilience-report.md`, `docs/wallet-e2e-test-plan.md`

## Completion Rule

Do not mark an item complete unless the completion evidence exists and is named in the checklist. For custody items, a written runbook is not enough; the actual authority address and transfer signature must be retained.

## Verification

```bash
npm run verify:launch-ops
```
