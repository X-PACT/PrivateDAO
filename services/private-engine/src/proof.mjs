import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPlugin } from "./plugins.mjs";

let poseidonPromise;

function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : stableStringify(value)).digest("hex");
}

function fieldFromString(value) {
  return BigInt(`0x${sha256(value).slice(0, 15)}`);
}

function toFieldString(value) {
  return value.toString();
}

async function poseidonHash(...items) {
  if (!poseidonPromise) {
    const { buildPoseidon } = await import("circomlibjs");
    poseidonPromise = buildPoseidon();
  }
  const poseidon = await poseidonPromise;
  return BigInt(poseidon.F.toString(poseidon(items)));
}

function normalizeInputs(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("privateInputs object is required.");
  if (typeof input.organizationId !== "string" || !input.organizationId.trim()) throw new Error("organizationId is required.");
  if (typeof input.subjectId !== "string" || !input.subjectId.trim()) throw new Error("subjectId is required.");
  if (input.membershipVerified !== true) throw new Error("Membership is not verified.");
  if (!Array.isArray(input.records) || input.records.length < 3) throw new Error("At least 3 private records are required.");
  const records = input.records.slice(0, 3).map((record, index) => {
    const amountUsd = Math.floor(Number(record?.amountUsd));
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) throw new Error(`records[${index}].amountUsd must be positive.`);
    return amountUsd;
  });
  const riskScore = Math.floor(Number(input.riskScore));
  const liabilitiesUsd = Math.floor(Number(input.liabilitiesUsd ?? 0));
  if (!Number.isFinite(riskScore) || riskScore <= 0) throw new Error("riskScore must be positive.");
  if (!Number.isFinite(liabilitiesUsd) || liabilitiesUsd < 0) throw new Error("liabilitiesUsd must be zero or positive.");
  const average = records.reduce((sum, amount) => sum + amount, 0) / records.length;
  const liabilityRatioBps = Math.floor((liabilitiesUsd * 10000) / Math.max(average, 1));
  if (average < 7500) throw new Error("Private capacity threshold is not satisfied.");
  if (liabilityRatioBps > 3500) throw new Error("Private liability policy is not satisfied.");
  if (riskScore < 72) throw new Error("Private risk policy is not satisfied.");
  return { records, riskScore, liabilitiesUsd, average };
}

async function artifactPaths(rootDir) {
  const circuit = "private_dao_blind_policy_overlay";
  return {
    circuit,
    wasm: join(rootDir, "zk", "build", `${circuit}_js`, `${circuit}.wasm`),
    zkey: join(rootDir, "zk", "setup", `${circuit}_final.zkey`),
    vkey: join(rootDir, "zk", "setup", `${circuit}_vkey.json`),
  };
}

async function artifactPathsForCircuit(rootDir, circuit) {
  return {
    circuit,
    wasm: join(rootDir, "zk", "build", `${circuit}_js`, `${circuit}.wasm`),
    zkey: join(rootDir, "zk", "setup", `${circuit}_final.zkey`),
    vkey: join(rootDir, "zk", "setup", `${circuit}_vkey.json`),
  };
}

async function pluginWitness(pluginId, privateInputs, policyVersion) {
  const policyHash = fieldFromString(policyVersion || `${pluginId}:v1`);
  const salt = fieldFromString(`${pluginId}:${privateInputs.subjectId || privateInputs.applicantId || privateInputs.employeeId || privateInputs.userId || "subject"}`);
  const number = (value, fallback = 0) => {
    const parsed = Math.floor(Number(value ?? fallback));
    if (!Number.isFinite(parsed) || parsed < 0) throw new Error("Plugin numeric input is invalid.");
    return BigInt(parsed);
  };
  if (pluginId === "blind-kyc") {
    const subjectKey = fieldFromString(String(privateInputs.subjectId || "subject"));
    const jurisdictionKey = fieldFromString(String(privateInputs.countryCode || "jurisdiction"));
    const kycStatus = number(privateInputs.kycStatus, 1);
    if (kycStatus !== 1n) throw new Error("KYC status is not verified.");
    const subjectCommitment = await poseidonHash(subjectKey, salt, policyHash);
    const jurisdictionCommitment = await poseidonHash(jurisdictionKey, policyHash);
    return { circuit: "private_dao_blind_kyc", input: { policyHash: policyHash.toString(), subjectCommitment: subjectCommitment.toString(), jurisdictionCommitment: jurisdictionCommitment.toString(), verifiedClaim: "1", subjectKey: subjectKey.toString(), kycStatus: kycStatus.toString(), jurisdictionKey: jurisdictionKey.toString(), salt: salt.toString() } };
  }
  if (pluginId === "blind-aml") {
    const subjectKey = fieldFromString(String(privateInputs.subjectId || "subject"));
    const riskScore = number(privateInputs.riskScore, 0);
    const maxRisk = number(privateInputs.maxRisk, 25);
    if (riskScore > maxRisk) throw new Error("AML risk score exceeds the configured maximum.");
    const sanctionsClear = number(privateInputs.sanctionsClear, 1);
    if (sanctionsClear !== 1n) throw new Error("AML sanctions screening is not clear.");
    const subjectCommitment = await poseidonHash(subjectKey, BigInt(sanctionsClear), riskScore, salt);
    return { circuit: "private_dao_blind_aml", input: { policyHash: policyHash.toString(), subjectCommitment: subjectCommitment.toString(), maxRisk: maxRisk.toString(), clearClaim: "1", subjectKey: subjectKey.toString(), sanctionsClear: sanctionsClear.toString(), riskScore: riskScore.toString(), salt: salt.toString() } };
  }
  if (pluginId === "blind-employment") {
    const employerKey = fieldFromString(String(privateInputs.employerId || "employer"));
    const employeeKey = fieldFromString(String(privateInputs.employeeId || privateInputs.subjectId || "employee"));
    const active = number(privateInputs.active, 1);
    if (active !== 1n) throw new Error("Employment is not active.");
    const tenureMonths = number(privateInputs.tenureMonths, 12);
    const minTenure = number(privateInputs.minTenure, 6);
    if (tenureMonths < minTenure) throw new Error("Employment tenure does not satisfy policy.");
    const employerCommitment = await poseidonHash(employerKey, salt);
    const employeeCommitment = await poseidonHash(employeeKey, active, tenureMonths, employerKey);
    return { circuit: "private_dao_blind_employment", input: { employerCommitment: employerCommitment.toString(), employeeCommitment: employeeCommitment.toString(), minTenure: minTenure.toString(), verifiedClaim: "1", employerKey: employerKey.toString(), employeeKey: employeeKey.toString(), active: active.toString(), tenureMonths: tenureMonths.toString(), salt: salt.toString() } };
  }
  if (pluginId === "blind-payroll") {
    const payrollKey = fieldFromString(String(privateInputs.payrollId || "payroll"));
    const batchKey = fieldFromString(String(privateInputs.batchId || "batch"));
    const variance = number(privateInputs.variance, 0);
    const maxVariance = number(privateInputs.maxVariance, 100);
    if (variance > maxVariance) throw new Error("Payroll variance exceeds the configured maximum.");
    const approved = number(privateInputs.approved, 1);
    if (approved !== 1n) throw new Error("Payroll batch is not approved.");
    const payrollCommitment = await poseidonHash(payrollKey, approved, salt);
    const batchCommitment = await poseidonHash(batchKey, variance, payrollKey);
    return { circuit: "private_dao_blind_payroll", input: { payrollCommitment: payrollCommitment.toString(), batchCommitment: batchCommitment.toString(), maxVariance: maxVariance.toString(), approvedClaim: "1", payrollKey: payrollKey.toString(), batchKey: batchKey.toString(), variance: variance.toString(), approved: approved.toString(), salt: salt.toString() } };
  }
  if (pluginId === "blind-underwriting") {
    const applicantKey = fieldFromString(String(privateInputs.applicantId || privateInputs.subjectId || "applicant"));
    const assets = number(privateInputs.assets, 100000);
    const liabilities = number(privateInputs.liabilities, 10000);
    const coverage = number(privateInputs.coverage, 80);
    const maxLiabilityBps = number(privateInputs.maxLiabilityBps, 3500);
    const minCoverage = number(privateInputs.minCoverage, 60);
    if (liabilities * 10000n > assets * maxLiabilityBps || coverage < minCoverage) throw new Error("Underwriting policy is not satisfied.");
    const applicantCommitment = await poseidonHash(applicantKey, assets, liabilities, coverage, salt);
    return { circuit: "private_dao_blind_underwriting", input: { policyHash: policyHash.toString(), applicantCommitment: applicantCommitment.toString(), maxLiabilityBps: maxLiabilityBps.toString(), minCoverage: minCoverage.toString(), eligibleClaim: "1", applicantKey: applicantKey.toString(), assets: assets.toString(), liabilities: liabilities.toString(), coverage: coverage.toString(), salt: salt.toString() } };
  }
  if (pluginId === "blind-dao-voting") {
    const proposalId = number(privateInputs.proposalId, 1);
    const daoKey = fieldFromString(String(privateInputs.daoId || "dao"));
    const voterKey = fieldFromString(String(privateInputs.voterId || privateInputs.subjectId || "voter"));
    const vote = number(privateInputs.vote, 1);
    const weight = number(privateInputs.weight, 1);
    const minWeight = number(privateInputs.minWeight, 1);
    if (vote > 1 || weight < minWeight) throw new Error("DAO voting eligibility policy is not satisfied.");
    const commitment = await poseidonHash(vote, salt, voterKey, proposalId, daoKey);
    const nullifier = await poseidonHash(voterKey, proposalId, daoKey);
    const eligibilityHash = await poseidonHash(voterKey, weight, daoKey);
    return { circuit: "private_dao_vote_overlay", input: { proposalId: proposalId.toString(), daoKey: daoKey.toString(), minWeight: minWeight.toString(), commitment: commitment.toString(), nullifier: nullifier.toString(), eligibilityHash: eligibilityHash.toString(), vote: vote.toString(), salt: salt.toString(), voterKey: voterKey.toString(), weight: weight.toString() } };
  }
  throw new Error(`No proving adapter is installed for plugin ${pluginId}.`);
}

function pluginPackage({ pluginId, workflowId, policyVersion, paths, proof, publicSignals, verificationKey }) {
  const plugin = getPlugin(pluginId);
  const issuedAt = new Date().toISOString();
  const unsigned = {
    proofId: `${workflowId}_${sha256(publicSignals).slice(0, 16)}`,
    workflowId,
    pluginId,
    circuitId: plugin.circuitId,
    circuitVersion: plugin.circuitVersion,
    policyVersion,
    issuedAt,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    publicOutcome: "policy-satisfied",
    policySatisfied: true,
    policyCommitment: publicSignals[0],
    inputCommitment: sha256(publicSignals),
    verificationKeyHash: sha256(verificationKey),
    groth16Proof: { provingSystem: "groth16", circuit: paths.circuit, verificationMode: "groth16-snarkjs", verified: true, publicSignals, proof, verificationKey, proofHash: sha256(proof), publicSignalsHash: sha256(publicSignals), verificationKeyHash: sha256(verificationKey) },
    verifierInputs: { provingSystem: "groth16", circuit: paths.circuit, verificationCommand: "snarkjs groth16 verify", publicSignals: ["plugin policy outputs"] },
    completedStages: [{ id: "private-inputs", label: "Private inputs processed locally", status: "completed" }, { id: "witness", label: "Witness generated locally", status: "completed" }, { id: "groth16", label: "Groth16 proof generated locally", status: "completed" }, { id: "verification", label: "Proof verified locally", status: "completed" }],
    valuesUsedButNotRevealed: ["Subject identity", "Private records", "Policy inputs", "Threshold values"],
    verifierStatement: "The customer deployment generated and verified this plugin proof without sending private inputs to the control plane.",
  };
  return { ...unsigned, originalProofHash: sha256({ ...unsigned, originalProofHash: undefined }) };
}

export async function provePlugin({ rootDir, pluginId, privateInputs, workflowId = `local_${pluginId}_${Date.now()}`, policyVersion = `${pluginId}.v1` }) {
  const plugin = getPlugin(pluginId);
  if (!plugin) throw new Error(`Unknown proof plugin ${pluginId}.`);
  const { circuit, input } = await pluginWitness(pluginId, privateInputs, policyVersion);
  const paths = await artifactPathsForCircuit(rootDir, circuit);
  const { groth16 } = await import("snarkjs");
  const { proof, publicSignals } = await groth16.fullProve(input, paths.wasm, paths.zkey);
  const verificationKey = JSON.parse(await readFile(paths.vkey, "utf8"));
  const verified = await groth16.verify(verificationKey, publicSignals, proof);
  if (!verified) throw new Error(`${plugin.name} Groth16 verification failed.`);
  const publicProofPackage = pluginPackage({ pluginId, workflowId, policyVersion, paths, proof, publicSignals, verificationKey });
  return { ok: true, status: "proof-issued-local", workflowId, pluginId, publicProofPackage, verification: { ok: true, status: "verified", match: true, originalHash: publicProofPackage.originalProofHash, recomputedHash: publicProofPackage.originalProofHash, circuitVersion: plugin.circuitVersion, message: `Verified locally with ${plugin.name}.` } };
}

export async function verifyPlugin({ rootDir, publicProofPackage }) {
  if (!publicProofPackage?.pluginId || !publicProofPackage?.groth16Proof) throw new Error("Plugin proof package is required.");
  if (publicProofPackage.expiresAt && Date.parse(publicProofPackage.expiresAt) < Date.now()) return { ok: false, status: "expired", match: false, pluginId: publicProofPackage.pluginId, message: "Proof package has expired." };
  const plugin = getPlugin(publicProofPackage.pluginId);
  if (!plugin) throw new Error("Unknown proof plugin.");
  const paths = await artifactPathsForCircuit(rootDir, publicProofPackage.groth16Proof.circuit);
  const { groth16 } = await import("snarkjs");
  const verificationKey = JSON.parse(await readFile(paths.vkey, "utf8"));
  const validGroth16 = await groth16.verify(verificationKey, publicProofPackage.groth16Proof.publicSignals, publicProofPackage.groth16Proof.proof);
  const { originalProofHash, ...unsigned } = publicProofPackage;
  const recomputedHash = sha256({ ...unsigned, originalProofHash: undefined });
  const match = originalProofHash === recomputedHash;
  return { ok: validGroth16 && match, status: validGroth16 && match ? "verified" : "mismatch", match: validGroth16 && match, originalHash: originalProofHash || null, recomputedHash, circuitVersion: publicProofPackage.circuitVersion, pluginId: publicProofPackage.pluginId, message: validGroth16 && match ? `Verified locally with ${plugin.name}.` : "Local plugin verification failed." };
}

function buildPackage({ proofId, workflowId, issuedAt, expiresAt, policyVersion, policyCommitment, inputCommitment, groth16Proof }) {
  const publicChecks = [
    { id: "membership", label: "Membership verified", satisfied: true },
    { id: "records", label: "Required private records imported", satisfied: true },
    { id: "capacity", label: "Capacity policy satisfied", satisfied: true },
    { id: "liability", label: "Liability policy satisfied", satisfied: true },
    { id: "risk", label: "Risk policy satisfied", satisfied: true },
  ];
  const unsigned = {
    proofId,
    nonce: sha256(`${workflowId}:${proofId}:${issuedAt}`).slice(0, 32),
    issuedAt,
    expiresAt,
    circuitId: "private_dao_blind_policy_overlay",
    circuitVersion: "groth16-v1",
    policyVersion,
    workflowId,
    originalProofHash: "",
    publicOutcome: "policy-satisfied",
    policySatisfied: true,
    decision: "Policy satisfied. The decision can be verified without revealing the policy inputs.",
    policyCommitment,
    inputCommitment,
    verificationKeyHash: groth16Proof.verificationKeyHash,
    verifierInputs: {
      provingSystem: "groth16",
      circuit: "private_dao_blind_policy_overlay",
      verificationCommand: "snarkjs groth16 verify",
      publicSignals: ["policyId", "policyCommitment", "inputCommitment", "satisfiedClaim"],
    },
    completedStages: [
      { id: "private-inputs", label: "Private inputs processed locally", status: "completed" },
      { id: "witness", label: "Witness generated locally", status: "completed" },
      { id: "groth16", label: "Groth16 proof generated locally", status: "completed" },
      { id: "verification", label: "Proof verified locally", status: "completed" },
    ],
    publicChecks,
    groth16Proof,
    valuesUsedButNotRevealed: ["Raw subject identity", "Private record values", "Risk score", "Liability ratio", "Policy thresholds"],
    verifierStatement: "The customer deployment generated and verified this proof without sending private inputs to the control plane.",
  };
  return { ...unsigned, originalProofHash: sha256({ ...unsigned, originalProofHash: undefined }) };
}

export async function proveBlindPolicy({ rootDir, privateInputs, workflowId = `local_blind_policy_${Date.now()}`, policyVersion = "2026-06-25.private-credit-capacity.v1" }) {
  const normalized = normalizeInputs(privateInputs);
  const { groth16 } = await import("snarkjs");
  const paths = await artifactPaths(rootDir);
  const policyId = 20260619n;
  const policySalt = fieldFromString(policyVersion);
  const organizationKey = fieldFromString(privateInputs.organizationId);
  const subjectKey = fieldFromString(privateInputs.subjectId);
  const inputSalt = fieldFromString(`${privateInputs.organizationId}:${privateInputs.subjectId}:${normalized.records.join(":")}`);
  const policyCommitment = await poseidonHash(policyId, 3n, 7500n, 3500n, 72n, policySalt);
  const inputCommitment = await poseidonHash(organizationKey, subjectKey, ...normalized.records.map(BigInt), BigInt(normalized.liabilitiesUsd), BigInt(normalized.riskScore), inputSalt);
  const witnessInput = {
    policyId: toFieldString(policyId),
    policyCommitment: toFieldString(policyCommitment),
    inputCommitment: toFieldString(inputCommitment),
    satisfiedClaim: "1",
    organizationKey: toFieldString(organizationKey),
    subjectKey: toFieldString(subjectKey),
    membershipVerified: "1",
    record0: String(normalized.records[0]),
    record1: String(normalized.records[1]),
    record2: String(normalized.records[2]),
    liabilitiesUsd: String(normalized.liabilitiesUsd),
    riskScore: String(normalized.riskScore),
    minRecordCount: "3",
    minAverageAmountUsd: "7500",
    maxLiabilityBps: "3500",
    minRiskScore: "72",
    policySalt: toFieldString(policySalt),
    inputSalt: toFieldString(inputSalt),
  };
  const { proof, publicSignals } = await groth16.fullProve(witnessInput, paths.wasm, paths.zkey);
  const verificationKey = JSON.parse(await readFile(paths.vkey, "utf8"));
  const verified = await groth16.verify(verificationKey, publicSignals, proof);
  if (!verified) throw new Error("Local Groth16 verification failed.");
  const proofId = `${workflowId}_${sha256(publicSignals).slice(0, 16)}`;
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const groth16Proof = {
    provingSystem: "groth16",
    circuit: paths.circuit,
    verificationMode: "groth16-snarkjs",
    verified: true,
    publicSignals,
    proof,
    verificationKey,
    proofHash: sha256(proof),
    publicSignalsHash: sha256(publicSignals),
    verificationKeyHash: sha256(verificationKey),
  };
  const publicProofPackage = buildPackage({
    proofId,
    workflowId,
    issuedAt,
    expiresAt,
    policyVersion,
    policyCommitment: toFieldString(policyCommitment),
    inputCommitment: toFieldString(inputCommitment),
    groth16Proof,
  });
  return { ok: true, status: "proof-issued-local", workflowId, publicProofPackage, verification: { ok: true, status: "verified", match: true, originalHash: publicProofPackage.originalProofHash, recomputedHash: publicProofPackage.originalProofHash, circuitVersion: "groth16-v1", message: "Verified locally in the customer deployment." } };
}

export async function verifyBlindPolicy({ rootDir, publicProofPackage }) {
  if (!publicProofPackage || typeof publicProofPackage !== "object") throw new Error("publicProofPackage is required.");
  if (publicProofPackage.expiresAt && Date.parse(publicProofPackage.expiresAt) < Date.now()) return { ok: false, status: "expired", match: false, message: "Proof package has expired." };
  const { groth16 } = await import("snarkjs");
  const paths = await artifactPaths(rootDir);
  const verificationKey = JSON.parse(await readFile(paths.vkey, "utf8"));
  const validGroth16 = await groth16.verify(verificationKey, publicProofPackage.groth16Proof.publicSignals, publicProofPackage.groth16Proof.proof);
  const { originalProofHash, ...unsigned } = publicProofPackage;
  const recomputedHash = sha256({ ...unsigned, originalProofHash: undefined });
  const match = originalProofHash === recomputedHash;
  return { ok: validGroth16 && match, status: validGroth16 && match ? "verified" : "mismatch", match: validGroth16 && match, originalHash: originalProofHash || null, recomputedHash, circuitVersion: publicProofPackage.circuitVersion, message: validGroth16 && match ? "Verified locally. Groth16 and receipt hash both match." : "Local verification failed." };
}
