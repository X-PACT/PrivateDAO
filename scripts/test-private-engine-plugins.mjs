import { provePlugin, verifyPlugin } from "../services/private-engine/src/proof.mjs";

const rootDir = process.env.PRIVATEDAO_ARTIFACT_ROOT || process.cwd();
const cases = [
  ["blind-kyc", { subjectId: "user-kyc-1", countryCode: "EG" }],
  ["blind-aml", { subjectId: "user-aml-1", riskScore: 12, maxRisk: 25 }],
  ["blind-employment", { employerId: "company-1", employeeId: "employee-1", tenureMonths: 24, minTenure: 6 }],
  ["blind-payroll", { payrollId: "payroll-1", batchId: "batch-1", variance: 20, maxVariance: 100 }],
  ["blind-underwriting", { applicantId: "applicant-1", assets: 100000, liabilities: 10000, coverage: 80, maxLiabilityBps: 3500, minCoverage: 60 }],
  ["blind-dao-voting", { proposalId: 7, daoId: "dao-1", voterId: "voter-1", vote: 1, weight: 10, minWeight: 1 }],
];

for (const [pluginId, privateInputs] of cases) {
  const result = await provePlugin({ rootDir, pluginId, privateInputs, workflowId: `plugin-test-${pluginId}` });
  const verification = await verifyPlugin({ rootDir, publicProofPackage: result.publicProofPackage });
  if (!result.ok || !verification.ok) throw new Error(`${pluginId} proof verification failed.`);
  console.log(`${pluginId}: PASS (${result.publicProofPackage.circuitId})`);
}

console.log(`Private engine plugin test: PASS (${cases.length} plugins)`);
process.exit(0);
