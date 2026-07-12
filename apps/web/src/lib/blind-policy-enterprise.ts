export const blindPolicyBenchmark = {
  generatedAt: "2026-06-25T15:42:48.623Z",
  runs: 3,
  environment: "Node v24.15.0 on linux x64",
  proofPackageBuildMs: 612.25,
  proofHashRecomputeAvgMs: 6.4,
  localReceiptVerificationAvgMs: 13.5,
  groth16VerificationAvgMs: 6867.52,
  maxProofsPerSecondEstimate: 0.15,
  note:
    "Measured locally with the checked-in Groth16 blind-policy proof fixture. This measures package creation, hash recomputation, receipt verification, and Groth16 verification, not full witness generation.",
} as const;

export const blindPolicyArchitectureSteps = [
  ["Client", "Customer or case data is entered by the organization."],
  ["Private data", "Sensitive inputs stay out of the public proof."],
  ["Blind policy", "The policy is applied without revealing thresholds or formulas."],
  ["Groth16", "A ZK proof confirms the private policy was satisfied."],
  ["Proof receipt", "The public package contains commitments, checks, and a hash."],
  ["Public verification", "Anyone can recompute the hash and verify the package was not changed."],
] as const;

export const blindPolicyAdoptionSignals = [
  ["Internal Pilot", "Used as the PrivateDAO proof workflow reference path for customer-ready verification."],
  ["PrivateDAO Treasury", "Mapped as a reusable proof trail for approvals, decisions, and audit-ready receipts."],
  ["Test Organizations", "Prepared for fintech, grant, treasury, compliance, and review workflow pilots."],
  ["Research Deployment", "Connected to the checked-in Groth16 circuit and verification artifacts for reviewer inspection."],
] as const;
