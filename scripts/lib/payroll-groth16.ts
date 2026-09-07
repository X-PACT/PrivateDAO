// SPDX-License-Identifier: AGPL-3.0-or-later
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const require = createRequire(resolve(process.cwd(), "package.json"));
function loadDependency(name: string) {
  try { return require(name); } catch { return require(`${process.cwd()}/apps/web/node_modules/${name}`); }
}

const FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

function fieldFromSha256(hex: string) {
  return (BigInt(`0x${hex.slice(0, 62)}`) % FIELD).toString();
}

function sha256(value: unknown) {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

export async function expectedPayrollPublicSignals(input: { manifestCommitment: string; settlementRoot: string; policyHash: string }) {
  const { buildPoseidon } = loadDependency("circomlibjs");
  const poseidon = await buildPoseidon();
  const hash = (...values: string[]) => poseidon.F.toString(poseidon(values.map((value) => BigInt(value))));
  const payrollKey = fieldFromSha256(input.manifestCommitment);
  const batchKey = fieldFromSha256(input.settlementRoot);
  const salt = fieldFromSha256(input.policyHash);
  return [hash(payrollKey, "1", salt), hash(batchKey, "0", payrollKey), "0", "1"];
}

export async function verifyPayrollGroth16(input: {
  manifestCommitment: string;
  settlementRoot: string;
  policyHash: string;
  proof: unknown;
  publicSignals: unknown;
  verificationKeyPath: string;
}) {
  if (!input.proof || typeof input.proof !== "object" || !Array.isArray(input.publicSignals)) throw new Error("A Groth16 proof and public signals are required.");
  const expected = await expectedPayrollPublicSignals(input);
  const received = input.publicSignals.map(String);
  if (received.length !== expected.length || received.some((value, index) => value !== expected[index])) throw new Error("Payroll Groth16 public signals do not match the approved batch commitments.");
  const { groth16 } = loadDependency("snarkjs");
  const verificationKey = JSON.parse(await readFile(input.verificationKeyPath, "utf8"));
  const verified = await groth16.verify(verificationKey, received, input.proof);
  if (!verified) throw new Error("Payroll Groth16 proof verification failed.");
  const proofHash = sha256({ proof: input.proof, publicSignals: received });
  return { verified: true, proofHash, publicSignalsHash: sha256(received), proofType: "groth16-private-dao-blind-payroll-v1" };
}
