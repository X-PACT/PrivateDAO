# @privatedao/blind-policy

Typed client for PrivateDAO Blind Policy Verification.

Blind Policy Verification proves that a private policy was satisfied without revealing the policy inputs, internal thresholds, formulas, or sensitive customer records.

## Install

This package is currently prepared for private pilot distribution from the repository or a private registry. Do not claim public npm availability until it is actually published.

```bash
npm install @privatedao/blind-policy
```

For local repository testing:

```bash
npm --prefix packages/blind-policy-sdk run build
node packages/blind-policy-sdk/examples/prove-verify-tamper.mjs
```

## Prove and Verify

```ts
import { createBlindPolicyClient } from "@privatedao/blind-policy";

const client = createBlindPolicyClient({
  // Local mode is the default. The browser or application talks to the
  // Private Engine inside the organization's network.
  baseUrl: "http://127.0.0.1:8787/v1",
  mode: "local",
  controlPlaneBaseUrl: "https://api.privatedao.org/api/v1",
});

const result = await client.prove({
  workflowId: "customer-credit-case-001",
  privateInputs: {
    organizationId: "northstar-credit",
    subjectId: "customer-redacted-4381",
    membershipVerified: true,
    records: [{ amountUsd: 8800 }, { amountUsd: 9400 }, { amountUsd: 9200 }],
    riskScore: 84,
    liabilitiesUsd: 2400,
  },
});

if (result.ok) {
  const verification = await client.verify(result.publicProofPackage);
  console.log(verification.message);

  const localReceipt = await client.storeLocalReceipt(result.publicProofPackage);
  const onchain = await client.submitOnchainReceipt(result.publicProofPackage);
  console.log(onchain.ok ? onchain.onchainReceipt.receiptAccountExplorerUrl : onchain.error);
}
```

## Tamper Check

```ts
if (result.ok) {
  const tampered = structuredClone(result.publicProofPackage);
  tampered.publicChecks[0].label = "changed";

  const verification = await client.verify(tampered);
  console.log(verification.status); // mismatch
  console.log(verification.originalHash);
  console.log(verification.recomputedHash);
}
```

## Public Proof Package

The public proof package exposes:

- proof id
- nonce
- issued at
- expires at
- circuit id
- circuit version
- policy version
- Groth16 proof
- public signals
- verification key
- verification key hash
- policy commitment
- input commitment
- original proof hash
- public checks

It does not expose raw earnings, subject identity, risk score, liabilities, or private policy thresholds.

## Current Technical Boundary

Live now:

- Groth16 circuit proof generation
- `snarkjs groth16 prove`
- `snarkjs groth16 verify`
- public proof package verification
- tamper mismatch detection
- Solana receipt submission for verified proof receipt hashes
- On-premise Local Engine with local witness generation and local `snarkjs groth16.fullProve`
- Signed offline license verification with organization-bound activation
- Anchor PDA receipt path with Solana Memo receipt fallback when the Anchor path is unavailable

Not claimed as live yet:

- PLONK
- STARK
- recursive proofs
- full Groth16 pairing verification on Solana
- final Ika dWallet DKG / 2PC-MPC signing
- final REFHE execution

REFHE, Ika / Encrypt, and MagicBlock are represented as commitment/provider-readiness lanes in the Blind Policy proof package unless a separate provider receipt is attached.

This package is prepared for PrivateDAO pilot deployments and private registry distribution. Public npm publishing should only be claimed after the package is actually published. The default client mode is local so private inputs are not accidentally sent to the hosted control plane.
