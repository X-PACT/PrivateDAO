"use client";

const ARTIFACTS = {
  wasm: { url: "/zk/private_dao_blind_payroll.wasm", sha256: "e0c64f008f69a4e57f4d568f8b9aa36a4fb54326234433865b820b9fd68ed08c" },
  zkey: { url: "/zk/private_dao_blind_payroll_final.zkey", sha256: "3cc7b480db9f7b9d96beeca5862b9db6a30653edab5da4c7db783838954f3ecb" },
  vkey: { url: "/zk/private_dao_blind_payroll_vkey.json", sha256: "bd5066444543c819a220ed3497aa628c57528fea3158e57254cac21050da48b7" },
} as const;
const FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

async function digest(bytes: ArrayBuffer) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (byte) => byte.toString(16).padStart(2, "0")).join(""); }
async function fieldFromCommitment(value: string) { return (BigInt(`0x${value.slice(0, 62)}`) % FIELD).toString(); }

export async function provePayrollGroth16(input: { manifestCommitment: string; settlementRoot: string; policyHash: string }) {
  const [wasm, zkey, vkey] = await Promise.all(Object.values(ARTIFACTS).map((artifact) => fetch(artifact.url, { cache: "force-cache" }).then(async (response) => { if (!response.ok) throw new Error(`Payroll proving artifact unavailable: ${response.status}`); const bytes = await response.arrayBuffer(); if (await digest(bytes) !== artifact.sha256) throw new Error(`Payroll proving artifact integrity check failed: ${artifact.url}`); return bytes; })));
  const { poseidon3 } = await import("poseidon-lite/poseidon3");
  const hash = (...values: string[]) => poseidon3(values.map((value) => BigInt(value))).toString();
  const payrollKey = await fieldFromCommitment(input.manifestCommitment);
  const batchKey = await fieldFromCommitment(input.settlementRoot);
  const salt = await fieldFromCommitment(input.policyHash);
  const publicSignals = [hash(payrollKey, "1", salt), hash(batchKey, "0", payrollKey), "0", "1"];
  const { groth16 } = await import("snarkjs");
  const verificationKey = JSON.parse(new TextDecoder().decode(vkey));
  const { proof } = await groth16.fullProve({ payrollCommitment: publicSignals[0], batchCommitment: publicSignals[1], maxVariance: "0", approvedClaim: "1", payrollKey, batchKey, variance: "0", approved: "1", salt }, new Uint8Array(wasm), new Uint8Array(zkey));
  if (!(await groth16.verify(verificationKey, publicSignals, proof))) throw new Error("Payroll Groth16 proof failed local verification.");
  return { proof, publicSignals, proofType: "groth16-private-dao-blind-payroll-v1", verificationKeyHash: await digest(vkey) };
}
