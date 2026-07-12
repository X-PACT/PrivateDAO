# Blind Policy Verification Enterprise Readiness

PrivateDAO Blind Policy Verification is a product line for proving that a private policy was satisfied without exposing the policy inputs, internal thresholds, formulas, or sensitive customer records.

## What Is Live Now

| Capability | Status | Evidence |
| --- | --- | --- |
| Groth16 proof generation | Live | The backend generates a witness, runs `snarkjs groth16 prove`, then verifies before issuing a receipt. |
| Groth16 verification | Live | `/api/v1/proof-workflows/blind-policy/verify` verifies the proof package and fails on tampering. |
| Public proof package | Live | Includes proof, public signals, verification key, verification key hash, policy commitment, and input commitment. |
| Tamper detection | Live | Any changed public proof package produces mismatch with original and recomputed hashes. |
| TypeScript SDK | Pilot-ready | `packages/blind-policy-sdk` provides a typed client for status, sample, prove, and verify. |
| Browser API console | Live | `/developers/blind-policy-api` lets a buyer test the flow from the browser. |
| Benchmarks | Local evidence | `npm run benchmark:blind-policy` measures package creation, hash recomputation, receipt verification, and Groth16 verification over the checked-in fixture. |
| On-premise Local Engine | Local implementation | `services/private-engine` runs witness generation, `snarkjs groth16.fullProve`, local Groth16 verification, and local receipts without sending private inputs to the control plane. |
| Signed offline license | Local implementation | Ed25519-signed `enterprise-license.v1` envelopes support organization binding, expiry, and offline grace. |

## Truth Boundary

The current production claim is Groth16 Blind Policy Verification.

REFHE, Ika / Encrypt, and MagicBlock are currently commitment and provider-readiness lanes inside this product unless a separate provider receipt is attached. They must not be described as final funded Ika dWallet DKG, final 2PC-MPC signing, final REFHE execution, or final MagicBlock settlement inside Blind Policy Verification without separate evidence.

PLONK, STARK, recursive proofs, and Solana on-chain verification are not claimed as live in this product yet.

## Enterprise Gaps To Close

| Enterprise requirement | Current status | Required next step |
| --- | --- | --- |
| Solana on-chain verification | Not live | Build a Solana verifier program or verification-record program that stores proof commitments and verification result references. |
| Blind Compliance circuit | Not live | Add circuit template for compliance checks with private documents and public compliance claim. |
| Blind KYC circuit | Not live | Add circuit template for KYC provider result commitments without exposing identity attributes. |
| Treasury Limits circuit | Not live | Add circuit template proving spend limits were respected without exposing private treasury policy. |
| DAO Voting Rules circuit | Not live | Add circuit template proving voting eligibility/rule satisfaction without exposing voter intent. |
| Multi-policy proofs | Not live | Add aggregation layer that binds multiple policy commitments into one public proof package. |
| HSM/KMS key management | Not live | Add AWS KMS/HSM-backed signing/encryption boundaries for enterprise deployments. |
| External security audit | Not complete | Commission circuit and backend audit; publish scope, report, and remediation log. |
| Rust SDK | Not live | Implement typed Rust client for prove/verify and proof package parsing. |
| Python SDK | Not live | Implement typed Python client for prove/verify and audit workflow integration. |
| Public npm release | Not live | Publish `@privatedao/blind-policy` only after registry, versioning, and support policy are ready. |

The local engine closes the deployment boundary for the Blind Policy workflow. The remaining commercial control-plane work is payment-provider integration, production license issuance policy, KMS/HSM custody for the signing key, observability, and an independent security review.

## Customer Integration Path

1. Call `GET /api/v1/proof-workflows/blind-policy/status` to confirm live proof status.
2. Call `GET /api/v1/proof-workflows/blind-policy/sample` for a safe payload.
3. Call `POST /api/v1/proof-workflows/blind-policy/prove` with private inputs.
4. Store the returned public proof package.
5. Call `POST /api/v1/proof-workflows/blind-policy/verify` with the public package.
6. If any public package field changes, verification returns mismatch with original and recomputed hashes.

## Architecture

```text
Client
  |
Private Data
  |
Blind Policy
  |
Groth16 Circuit
  |
Proof Package
  |
Public Verification
```

## Benchmarks

Run:

```bash
npm run benchmark:blind-policy
```

The current benchmark measures package creation, hash recomputation, receipt verification, and Groth16 verification over the checked-in proof fixture. It does not measure full witness generation.
