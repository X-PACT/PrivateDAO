# Private Service Split Plan

Goal: keep public protocol code open, while moving commercially sensitive logic to a private service.

## Recommended Split

- Keep public:
  - on-chain program
  - CLI scripts for baseline operations
  - public docs and demo frontend
- Move private:
  - advanced policy engines
  - premium analytics/alerting
  - operational automation and keeper orchestration
  - customer-specific integrations and dashboards

## Repository Strategy

- Public repo: protocol and baseline developer tooling
- Private repo: production orchestrator + premium services
- Private repo consumes public IDL and SDK, not the opposite

## Security Controls for Private Layer

- Secrets only in private infra, never in this repo
- Isolated RPC credentials per environment
- Strict access control and audit logging
- Signed release process for private services

## Interface Contract

Define explicit API boundaries:

- input: proposal metadata, account addresses, policy profiles
- output: execution recommendations, alerts, workflow actions
- no private business rules embedded in public frontend

## Migration Order

1. Identify sensitive modules currently in scripts/frontend.
2. Extract those modules behind APIs in private repo.
3. Keep public docs focused on protocol behavior, not private automation internals.
4. Add commercial terms in private product contracts.

