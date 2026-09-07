# PrivateDAO Local Enterprise Engine

PrivateDAO Blind Policy Verification is delivered as a deployable web application plus a local proof engine. The customer operates both inside its own infrastructure.

```text
Employee
   |
   v
Company Web App  ---- local same-origin proxy ---->  PrivateDAO Engine
                                                      |
                                                      +-- private inputs
                                                      +-- witness generation
                                                      +-- Circom WASM
                                                      +-- snarkjs Groth16
                                                      +-- local verification
                                                      +-- local receipt store
                                                      |
                                                      +-- public proof only --> Solana / verifier / audit system

PrivateDAO Control Plane <---- license metadata only ---- PrivateDAO Engine
```

## Data boundary

The local engine accepts private inputs and returns a public proof package. It runs `groth16.fullProve` and Groth16 verification against the checked-in circuit artifacts. The hosted control plane is limited to organization-bound license metadata: installation id, license id, plan, engine version, and enabled features.

The control plane must never receive private inputs, raw records, witness files, subject identity, risk score, liability values, or policy thresholds.

## Commercial license lifecycle

Paid activation uses the control-plane order endpoints:

```text
POST /api/v1/commercial/orders/prepare
    -> orderId, exact atomic amount, treasury, token mint, memo
POST /api/v1/commercial/orders/verify
    -> Solana RPC transaction lookup, exact treasury/mint/amount/memo checks,
       confirmation threshold, replay protection
    -> organization, Ed25519 license, activation code, package and guide links
```

The legacy hash-only checkout verifier is disabled for license issuance. The signing private key is never shipped to the web app or local engine. Production issuance must use a separately managed control-plane secret/KMS/HSM integration; the customer deployment verifies only the public key/keyring. Revoked key ids and license ids fail closed. After expiry plus grace, historical reads remain available while new mutations are blocked.

## Offline behavior

The engine can prove, verify, and create local receipt files without network access. License envelopes are Ed25519-signed and include an expiry plus an explicit offline grace window. Online license synchronization is optional and sends metadata only.

When a license expires beyond its grace window, the deployment remains readable: existing workflows, receipts, and verification stay available. Creating new workflows, proofs, or receipts is blocked until a new signed license is installed.

## Enterprise limits

The signed license carries the organization id, plan, expiry, seat limit, organization limit, and feature list. The engine enforces organization binding and exposes the state through the local Admin Dashboard at `/admin/private-engine`.

## Air-gapped release

Build a release manifest before transferring the image or bundle into the isolated network:

```bash
npm run private-engine:manifest
```

The manifest records SHA-256 digests for the circuit, WASM, R1CS, proving key, verification key, engine, license, and database modules. The air-gapped environment installs a signed license file manually and never needs to contact the control plane to generate or verify proofs.

## Commercial protection

The engine verifies a signed license and fails closed when the license is missing, modified, expired beyond grace, or bound to another installation. The signing private key remains on the PrivateDAO control plane and is never shipped to customers.

Absolute anti-reverse-engineering protection is not technically possible for software delivered to a customer-controlled machine. The defensible controls are signed licenses, organization binding, artifact hashes, minimal secrets, container hardening, egress policy, audit logs, support contracts, and a commercial license that controls redistribution and branding.

## Run locally

```bash
npm install --prefix services/private-engine
npm run private-engine:license -- northstar-credit ENTERPRISE 31
PRIVATEDAO_LICENSE_PUBLIC_KEY_PEM="$(cat services/private-engine/data/license-public.pem)" \
  npm run private-engine:start
```

For the web app, use server mode with `NEXT_PUBLIC_PROOF_EXECUTION_MODE=local` and set `NEXT_PUBLIC_PRIVATE_ENGINE_URL=http://127.0.0.1:8787`. In a remote internal deployment, use the internal HTTPS hostname of the Private Engine and configure its CORS origin for the customer web app.

## Product surfaces

The local Admin route `/admin/private-engine` is organized around six operator tasks:

1. **Marketplace:** choose KYC, age, employment, payroll, underwriting, credit, or DAO voting templates.
2. **Policy Builder:** edit human-readable conditions such as `KYC = verified AND Age > 18` without writing JSON.
3. **Policy Versions:** create drafts, approve versions, and retain author/approval timestamps.
4. **Audit Timeline:** record workflow creation, policy approval, proof generation, verification, receipt issuance, anchoring, and archive events.
5. **Organization:** represent organizations, departments, teams, users, roles, and permissions.
6. **License Center:** activate signed licenses, view usage, seats, organizations, renewal state, offline mode, and expiry behavior.

The plugin registry is deliberately explicit about cryptographic readiness. Blind KYC, Blind AML, Blind Employment, Blind Payroll, Blind Underwriting, and Blind DAO Voting now have dedicated plugin adapters and Groth16 artifacts. DAO Voting uses the existing vote circuit; the other five use dedicated Circom circuits. The engine maps each plugin to its own circuit id and verification key and rejects unknown plugins instead of routing them through the wrong circuit.
