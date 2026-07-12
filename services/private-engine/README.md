# PrivateDAO Private Engine

This is the on-premise Blind Verification Engine. It exposes a web-facing workflow API, a marketplace of policy templates, a visual policy-builder contract, plugin registration, local Groth16 proving, receipts, audit timelines, organization/RBAC metadata, and a license center.

Production storage uses SQLite with WAL by default on Node 22+ or PostgreSQL when `PRIVATEDAO_DATABASE_URL` is configured. JSON storage is development-only and is not the production customer storage path.

The browser sends private inputs only to this local service. The service runs witness generation, Circom-compatible WASM execution, `snarkjs groth16.fullProve`, and Groth16 verification inside the customer deployment. The PrivateDAO control plane receives license metadata only.

## Local run

```bash
npm install --prefix services/private-engine
PRIVATEDAO_ALLOW_DEV_LICENSE=true npm --prefix services/private-engine start
```

The engine exposes:

- `GET /health`
- `GET /v1/privacy`
- `GET /v1/license/status`
- `GET /v1/license/center`
- `GET /v1/license/usage`
- `POST /v1/license/activate`
- `GET /v1/admin/overview`
- `GET /v1/plugins`
- `GET /v1/marketplace`
- `GET /v1/policies`
- `POST /v1/policies`
- `POST /v1/policies/:policyId/versions`
- `POST /v1/policies/:policyId/approve`
- `GET /v1/audit/timeline`
- `GET /v1/organizations`
- `POST /v1/organizations`
- `POST /v1/organizations/users`
- `GET /v1/rbac`
- `GET /v1/workflows`
- `POST /v1/workflows`
- `POST /v1/workflows/:workflowId/run`
- `POST /v1/workflows/:workflowId/archive`
- `GET /v1/receipts`
- `GET /v1/receipts/:proofId`
- `POST /v1/prove`
- `POST /v1/verify`
- `POST /v1/receipt`
- `POST /v1/license/sync`

`POST /v1/prove` is deliberately a local endpoint. It must not be pointed at `api.privatedao.org`.

The plugin registry includes Blind KYC, Blind AML, Blind Employment, Blind Payroll, Blind Underwriting, and Blind DAO Voting. Each plugin has its own Circom source, WASM witness artifact, Groth16 proving key, and verification key. DAO Voting uses the existing `private_dao_vote_overlay`; the other plugins use dedicated circuits. A workflow using an unknown or unavailable plugin is rejected instead of silently proving the wrong statement.

## Docker

```bash
docker build -f services/private-engine/Dockerfile -t privatedao/private-engine:local .
docker run --rm -p 8787:8787 -v "$PWD/services/private-engine/data:/data" \
  -e PRIVATEDAO_ALLOW_DEV_LICENSE=true privatedao/private-engine:local
```

For production, mount a signed `license.json` and set `PRIVATEDAO_LICENSE_PUBLIC_KEY_PEM`. Do not put the license signing private key in this image or in the customer deployment.

## Install and operate

```bash
npm run private-engine:preflight
npm run private-engine:install
npm run private-engine:backup -- backups/customer-before-upgrade.tar.gz
npm run private-engine:upgrade
npm run private-engine:restore -- backups/customer-before-upgrade.tar.gz
```

The installer creates `.env`, validates the ZK artifacts, builds both containers, and starts the web application. License activation is completed from the Admin License Center or `POST /v1/license/activate`. The control plane issues signed licenses; the deployment contains only public verification keys. Key rotation uses `PRIVADAO_LICENSE_PUBLIC_KEYS_JSON`, and revocation uses `PRIVADAO_LICENSE_REVOKED_IDS`.

## Commercial payment and licensing

The production control plane follows `prepare order -> verify Solana transaction -> create organization -> issue Ed25519 license -> deliver package -> activate deployment`. An order has a unique id, exact atomic amount, treasury, expiry, and order memo. Verification requires a real Solana Mainnet transaction, the configured USDC mint or SOL transfer, the exact treasury destination, the required confirmation state, a successful transaction, and a matching memo. A payment signature cannot be reused for another order.

The legacy hash-only checkout verifier is disabled. Use `POST /api/v1/commercial/orders/prepare`, `POST /api/v1/commercial/orders/verify`, `POST /api/v1/commercial/orders/renew`, and `GET /api/v1/commercial/orders/{orderId}/package`. Configure `PD_SOLANA_TREASURY`, `PD_SOLANA_USDC_MINT`, and `PD_PAYMENT_MIN_CONFIRMATIONS` on the control plane before accepting funds.

Production license issuance must use `PRIVADAO_LICENSE_SIGNER_PROVIDER=aws-kms` with `PRIVADAO_LICENSE_KMS_KEY_ID` and a least-privilege IAM role allowing only `kms:Sign`. The Node process must not receive the private key. `env-ed25519` is a development fallback only. The customer deployment contains the public key ring, supports key rotation and revocation, and never receives a signing key.

## Authentication and data handling

Set `PRIVADAO_AUTH_MODE=oidc` behind an authenticated reverse proxy or OIDC gateway before production use. Mutating endpoints enforce roles server-side (`admin`, `compliance`, `operator`); audit reads require `admin`, `auditor`, or `compliance`. The default development mode is intentionally permissive for local first-run only and must not be used for an internet-facing deployment.

Private inputs and witnesses are processed in the engine deployment. They are not sent to the control plane, not written to telemetry, and are not included in the license package. Restrict container egress, mount `/data` with customer-managed disk encryption, set a retention policy, and verify backups before enabling production workflows. No software can be made impossible to reverse engineer; signed licenses, server-side gates, key isolation, and artifact integrity are the enforceable commercial controls.

## Security boundary

This service proves that the local execution path does not send private inputs to the control plane by construction: the only control-plane request is `/v1/license/sync`, which contains installation and license metadata. Network egress should still be restricted at the container or host firewall and audited by the customer.

No software delivered to an organization can be made mathematically impossible to reverse engineer. The commercial protection is signed organization-bound licensing, fail-closed feature gates, minimal exposed secrets, container hardening, reproducible artifact hashes, and optional customer-managed KMS/HSM for signing operations.
