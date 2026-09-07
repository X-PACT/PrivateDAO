import { createBlindPolicyClient } from "../dist/index.js";

const client = createBlindPolicyClient({
  baseUrl: process.env.PRIVATEDAO_API_BASE_URL ?? "https://api.privatedao.org/api/v1",
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

if (!result.ok) {
  console.error("Proof not issued:", result);
  process.exit(1);
}

console.log("Proof issued");
console.log("Proof hash:", result.proofHash);
console.log("Verification key hash:", result.publicProofPackage.groth16Proof.verificationKeyHash);
console.log("Policy commitment:", result.publicProofPackage.policyCommitment);
console.log("Input commitment:", result.publicProofPackage.inputCommitment);

const verification = await client.verify(result.publicProofPackage);
console.log("Valid receipt verification:", verification.status, verification.match);

const tampered = structuredClone(result.publicProofPackage);
tampered.publicChecks[0].label = `${tampered.publicChecks[0].label} changed`;

const tamperVerification = await client.verify(tampered);
console.log("Tampered receipt verification:", tamperVerification.status, tamperVerification.match);
console.log("Original hash:", tamperVerification.originalHash);
console.log("Recomputed hash:", tamperVerification.recomputedHash);
