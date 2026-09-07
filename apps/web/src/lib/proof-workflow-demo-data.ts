export const demoProofId = "demo-proof-id";

export const creditLimitDemoStages = [
  {
    id: "membership-verification",
    label: "Verify Pro Membership",
    completedLabel: "Membership verified",
    proofHash: "9c17a62f93b86d14b1a8f4c53d2e9072d83bf2c669c1f4e4e54d4722d1b9a601",
  },
  {
    id: "earnings-validation",
    label: "Fetch Earnings",
    completedLabel: "Earnings retrieved",
    proofHash: "c815f4ab0d2a4fb8a9749b29a5f3e0af72e6f7ac305c8e1d1f69f45513d9b7c2",
  },
  {
    id: "threshold-calculation",
    label: "Calculate Threshold",
    completedLabel: "Threshold calculated",
    proofHash: "f0a2bb43e536c77c5c81a8a66c0c9e226d7b21b53d0f64998fb80176b87af9d4",
  },
  {
    id: "limit-issuance",
    label: "Issue Credit Limit",
    completedLabel: "Limit issued",
    proofHash: "5b9185f15f4a7d222f512e7a7fd4c8a51170a963f50f67f72b10f9f2db9db7bc",
  },
  {
    id: "proof-generation",
    label: "Generate Proof",
    completedLabel: "Workflow verified",
    proofHash: "7c830f2d8e03425ad1eb7cdd6e3d594ae67392f66c856ed8351765ef4e31c0a9",
  },
] as const;

export const creditLimitDemoProofHash = "0f3c66b1bd0ad271d6d73cfb2f6a89136e54f9f79d904d45df9cc9f2687c9b28";

export const creditLimitPrivateFields = [
  "User earnings",
  "Internal thresholds",
  "Internal formulas",
  "Reviewer notes",
  "Risk model",
] as const;

export const creditLimitVerifiableFields = [
  "Process executed",
  "Required steps completed",
  "Correct sequence followed",
  "Decision produced",
  "Proof generated",
] as const;

export const creditLimitCustomerValues = [
  ["Lending", "Prove underwriting happened."],
  ["Grant Programs", "Prove reviews happened."],
  ["Treasury", "Prove approvals happened."],
  ["Compliance", "Prove checks happened."],
] as const;
