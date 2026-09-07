import { readFile } from "node:fs/promises";
import { provePlugin, verifyPlugin } from "../services/private-engine/src/proof.mjs";

const rootDir = process.env.PRIVADAO_ARTIFACT_ROOT || process.cwd();
const positive = { subjectId: "adversarial-kyc", countryCode: "EG", kycStatus: 1 };
const proof = (await provePlugin({ rootDir, pluginId: "blind-kyc", privateInputs: positive, workflowId: "adversarial-kyc" })).publicProofPackage;

const tamperedSignals = structuredClone(proof);
tamperedSignals.groth16Proof.publicSignals[0] = String(BigInt(tamperedSignals.groth16Proof.publicSignals[0]) + 1n);
if ((await verifyPlugin({ rootDir, publicProofPackage: tamperedSignals })).ok) throw new Error("Tampered public signals were accepted.");

const wrongPlugin = structuredClone(proof);
wrongPlugin.pluginId = "blind-aml";
if ((await verifyPlugin({ rootDir, publicProofPackage: wrongPlugin })).ok) throw new Error("Wrong plugin/circuit was accepted.");

const expired = structuredClone(proof);
expired.expiresAt = new Date(Date.now() - 1000).toISOString();
if ((await verifyPlugin({ rootDir, publicProofPackage: expired })).status !== "expired") throw new Error("Expired proof was accepted.");

const negativeCases = [
  ["blind-kyc", { subjectId: "bad", countryCode: "EG", kycStatus: 0 }],
  ["blind-aml", { subjectId: "bad", riskScore: 30, maxRisk: 25 }],
  ["blind-employment", { employerId: "e", employeeId: "x", tenureMonths: 2, minTenure: 6 }],
  ["blind-payroll", { payrollId: "p", batchId: "b", variance: 120, maxVariance: 100 }],
  ["blind-underwriting", { applicantId: "a", assets: 1000, liabilities: 900, coverage: 20, maxLiabilityBps: 3500, minCoverage: 60 }],
  ["blind-dao-voting", { proposalId: 1, daoId: "d", voterId: "v", vote: 2, weight: 1, minWeight: 1 }],
];
for (const [pluginId, privateInputs] of negativeCases) {
  let rejected = false;
  try { await provePlugin({ rootDir, pluginId, privateInputs, workflowId: `negative-${pluginId}` }); } catch { rejected = true; }
  if (!rejected) throw new Error(`${pluginId} invalid witness was accepted.`);
}

for (const pluginId of ["blind-kyc", "blind-aml", "blind-employment", "blind-payroll", "blind-underwriting"]) {
  const circuit = { "blind-kyc": "private_dao_blind_kyc", "blind-aml": "private_dao_blind_aml", "blind-employment": "private_dao_blind_employment", "blind-payroll": "private_dao_blind_payroll", "blind-underwriting": "private_dao_blind_underwriting" }[pluginId];
  const vkey = JSON.parse(await readFile(`${rootDir}/zk/setup/${circuit}_vkey.json`, "utf8"));
  if (!Number.isInteger(vkey.nPublic) || vkey.nPublic < 1) throw new Error(`${pluginId} has no public constraints.`);
}

console.log("Private engine adversarial tests: PASS (tamper, wrong plugin, expiry, six negative witnesses, public constraints)");
process.exit(0);
