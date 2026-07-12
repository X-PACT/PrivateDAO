export const PLUGIN_REGISTRY = [
  {
    id: "blind-policy",
    name: "Blind Policy",
    category: "policy",
    description: "Generic private policy proof using the current Groth16 circuit.",
    circuitId: "private_dao_blind_policy_overlay",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["local-witness", "groth16", "local-verification", "local-receipt"],
  },
  {
    id: "blind-kyc",
    name: "Blind KYC",
    category: "compliance",
    description: "Prove KYC eligibility without exposing identity records.",
    circuitId: "private_dao_blind_kyc",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["identity-claims", "document-status", "jurisdiction"],
  },
  {
    id: "blind-aml",
    name: "Blind AML",
    category: "compliance",
    description: "Prove AML screening policy outcomes without exposing screening data.",
    circuitId: "private_dao_blind_aml",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["sanctions-screening", "risk-score", "case-status"],
  },
  {
    id: "blind-employment",
    name: "Blind Employment",
    category: "hr",
    description: "Prove employment conditions without exposing employee records.",
    circuitId: "private_dao_blind_employment",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["employment-status", "tenure", "role-claims"],
  },
  {
    id: "blind-payroll",
    name: "Blind Payroll",
    category: "finance",
    description: "Prove payroll approval rules without revealing salary data.",
    circuitId: "private_dao_blind_payroll",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["payroll-threshold", "approval-chain", "private-compensation"],
  },
  {
    id: "blind-underwriting",
    name: "Blind Underwriting",
    category: "risk",
    description: "Prove underwriting eligibility without exposing financial records.",
    circuitId: "private_dao_blind_underwriting",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["capacity", "liability", "risk-policy"],
  },
  {
    id: "blind-dao-voting",
    name: "Blind DAO Voting",
    category: "governance",
    description: "Prove voting eligibility and aggregate outcomes without revealing voter intent.",
    circuitId: "private_dao_vote_overlay",
    circuitVersion: "groth16-v1",
    status: "active",
    proofReady: true,
    capabilities: ["eligibility", "private-ballot", "tally-commitment"],
  },
];

export const MARKETPLACE_TEMPLATES = [
  { id: "kyc-eligibility", name: "Know Your Customer", pluginId: "blind-kyc", description: "Verify identity and jurisdiction requirements privately.", conditions: [{ field: "kyc", operator: "equals", value: "verified" }, { field: "country", operator: "not_in", value: "OFAC" }] },
  { id: "age-verification", name: "Age Verification", pluginId: "blind-kyc", description: "Prove a subject meets an age threshold without revealing date of birth.", conditions: [{ field: "age", operator: "greater_than", value: 18 }] },
  { id: "employment-verification", name: "Employment Verification", pluginId: "blind-employment", description: "Verify employment status and tenure privately.", conditions: [{ field: "employment", operator: "equals", value: "verified" }, { field: "tenure_months", operator: "greater_than_or_equal", value: 6 }] },
  { id: "payroll-approval", name: "Payroll Approval", pluginId: "blind-payroll", description: "Approve payroll batches against private thresholds and roles.", conditions: [{ field: "payroll", operator: "equals", value: "within_policy" }, { field: "approver", operator: "equals", value: "authorized" }] },
  { id: "insurance-underwriting", name: "Insurance Underwriting", pluginId: "blind-underwriting", description: "Apply underwriting capacity and risk rules privately.", conditions: [{ field: "risk", operator: "less_than_or_equal", value: 72 }, { field: "capacity", operator: "equals", value: "satisfied" }] },
  { id: "credit-approval", name: "Credit Approval", pluginId: "blind-policy", description: "Use the active Groth16 circuit to prove a private credit policy outcome.", conditions: [{ field: "kyc", operator: "equals", value: "verified" }, { field: "age", operator: "greater_than", value: 18 }, { field: "country", operator: "not_in", value: "OFAC" }], proofReady: true },
  { id: "dao-voting-eligibility", name: "DAO Voting", pluginId: "blind-dao-voting", description: "Create a private voting eligibility and tally workflow.", conditions: [{ field: "membership", operator: "equals", value: "verified" }, { field: "voting_power", operator: "greater_than", value: 0 }] },
];

export const CONDITION_FIELDS = [
  { id: "kyc", label: "KYC", operators: ["equals"] },
  { id: "age", label: "Age", operators: ["greater_than", "less_than_or_equal"] },
  { id: "country", label: "Country", operators: ["equals", "not_in"] },
  { id: "employment", label: "Employment", operators: ["equals"] },
  { id: "tenure_months", label: "Tenure (months)", operators: ["greater_than_or_equal"] },
  { id: "payroll", label: "Payroll", operators: ["equals"] },
  { id: "approver", label: "Approver", operators: ["equals"] },
  { id: "risk", label: "Risk score", operators: ["less_than_or_equal", "greater_than"] },
  { id: "capacity", label: "Capacity", operators: ["equals"] },
  { id: "membership", label: "Membership", operators: ["equals"] },
  { id: "voting_power", label: "Voting power", operators: ["greater_than"] },
];

export function getPlugin(pluginId) {
  return PLUGIN_REGISTRY.find((plugin) => plugin.id === pluginId) || null;
}

export function getTemplate(templateId) {
  return MARKETPLACE_TEMPLATES.find((template) => template.id === templateId) || null;
}

export function compilePolicy({ conditions = [], logic = "AND", action = "issue_proof" }) {
  if (!Array.isArray(conditions) || conditions.length === 0) throw new Error("At least one policy condition is required.");
  const normalized = conditions.map((condition) => {
    if (!condition?.field || !condition?.operator || condition.value === undefined || condition.value === "") throw new Error("Each policy condition needs a field, operator, and value.");
    return { field: String(condition.field), operator: String(condition.operator), value: condition.value };
  });
  return {
    type: "policy-ast",
    logic: logic === "OR" ? "OR" : "AND",
    conditions: normalized,
    action: action === "issue_receipt" ? "issue_receipt" : "issue_proof",
    generatedAt: new Date().toISOString(),
  };
}
