# GitHub Security Remediation - 2026-06-30

This note records the safe dependency-security pass applied after syncing the live PrivateDAO AWS/static/API release back into the public GitHub repository.

## Action Taken

The repository was audited with `npm audit` against the current `package-lock.json`.

Before remediation:

- total vulnerabilities: 29
- high: 10
- moderate: 3
- low: 16
- critical: 0

Safe remediation applied:

- `npm audit fix --package-lock-only --ignore-scripts`
- package overrides for safe transitive updates:
  - `esbuild` -> `^0.28.1`
  - `serialize-javascript` -> `^7.0.6`
  - `underscore` -> `^1.13.8`
- `npm install --package-lock-only --ignore-scripts`

After remediation:

- total vulnerabilities: 19
- high: 4
- moderate: 0
- low: 15
- critical: 0

## Remaining Boundary

The remaining high-severity audit path is tied to `bigint-buffer` through Solana/Squads dependencies:

- `bigint-buffer`
- `@solana/buffer-layout-utils`
- `@solana/spl-token`
- `@sqds/multisig`

`npm audit` proposes `--force` changes that would install older or breaking package lines, including downgrading Solana/Squads-related dependencies. That was intentionally not applied because this repository contains Solana wallet, token, custody, and governance code where forced dependency downgrades can create a larger operational risk than the audit warning.

The remaining low-severity path is tied to `elliptic` through `circomlibjs` / `ethers` dependency chains. `elliptic` was already at the latest npm version observed during this pass, and the audit-proposed fix requires a breaking `circomlibjs` downgrade. That was also not forced.

## Next Security Step

The next safe remediation should be a dependency-compatibility branch that tests:

- current `@solana/spl-token` and `@sqds/multisig` replacement paths
- whether Squads/Solana upstreams publish a non-breaking `bigint-buffer` remediation
- whether the ZK/circom tooling can move away from the vulnerable ethers v5 dependency path without breaking proof generation
- full `npm run typecheck`
- focused Solana client tests and ZK proof scripts

No secrets, private keys, Supabase service-role keys, AWS credentials, QuickNode credentials, TxLINE tokens, or wallet keypairs were committed as part of this remediation.
