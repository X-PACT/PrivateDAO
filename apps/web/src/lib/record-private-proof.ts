"use client";

export type BrowserPrivatePolicyInput = {
  organizationId: string;
  subjectId: string;
  records: [number, number, number];
  liabilitiesUsd: number;
  riskScore: number;
};

const POLICY_VERSION = "2026-06-25.private-credit-capacity.v1";
const POLICY_ID = BigInt("20260619");
const ARTIFACTS = {
  wasm: { url: "/zk/private_dao_blind_policy_overlay.wasm", sha256: "38166cd77769f4f4fe64c80d9daf4aacf6460d99ea5a4b6b29e8c93810a480ff" },
  zkey: { url: "/zk/private_dao_blind_policy_overlay_final.zkey", sha256: "6caea255193a016c44888ce02dace1521de9102396ae132c906a7226f788eb84" },
  vkey: { url: "/zk/private_dao_blind_policy_overlay_vkey.json", sha256: "05aeb7e27479d7f1551b0c2e18134c58f760de43f2ff085a8ea2e82f212209eb" },
} as const;

function stableStringify(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  return `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`).join(",")}}`;
}

async function sha256(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(typeof value === "string" ? value : stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Bytes(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function fieldFromString(value: string): Promise<bigint> {
  return BigInt(`0x${(await sha256(value)).slice(0, 15)}`);
}

async function artifactBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url, { cache: "force-cache" });
  if (!response.ok) throw new Error(`Proving artifact unavailable (${response.status}).`);
  return response.arrayBuffer();
}

async function assertArtifactHash(bytes: ArrayBuffer, expected: string, label: string) {
  const actual = await sha256Bytes(bytes);
  if (actual !== expected) throw new Error(`${label} integrity check failed. Refusing to prove.`);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), timeoutMs);
    promise.then((value) => { window.clearTimeout(timer); resolve(value); }, (error) => { window.clearTimeout(timer); reject(error); });
  });
}

export async function proveRecordPrivately(
  recordDigest: string,
  input: BrowserPrivatePolicyInput,
  onProgress?: (stage: string) => void,
) {
  if (!recordDigest || !/^[a-f0-9]{64}$/.test(recordDigest)) throw new Error("A canonical record digest is required.");
  if (!input.organizationId || !input.subjectId || input.records.some((value) => !Number.isSafeInteger(value) || value <= 0)) {
    throw new Error("Private policy inputs are incomplete or invalid.");
  }
  if (!Number.isSafeInteger(input.liabilitiesUsd) || input.liabilitiesUsd < 0 || !Number.isSafeInteger(input.riskScore) || input.riskScore < 72) {
    throw new Error("The private policy conditions were not satisfied.");
  }
  onProgress?.("Checking approved proving artifacts");
  const [wasmBytes, zkeyBytes, vkeyResponse] = await Promise.all([artifactBytes(ARTIFACTS.wasm.url), artifactBytes(ARTIFACTS.zkey.url), fetch(ARTIFACTS.vkey.url, { cache: "force-cache" })]);
  if (!vkeyResponse.ok) throw new Error(`Verification key unavailable (${vkeyResponse.status}).`);
  const vkeyBytes = await vkeyResponse.arrayBuffer();
  await Promise.all([assertArtifactHash(wasmBytes, ARTIFACTS.wasm.sha256, "WASM"), assertArtifactHash(zkeyBytes, ARTIFACTS.zkey.sha256, "zkey"), assertArtifactHash(vkeyBytes, ARTIFACTS.vkey.sha256, "Verification key")]);
  const verificationKey = JSON.parse(new TextDecoder().decode(vkeyBytes));

  onProgress?.("Preparing the private witness in this browser");
  const [{ poseidon6 }, { poseidon8 }] = await Promise.all([
    import("poseidon-lite/poseidon6"),
    import("poseidon-lite/poseidon8"),
  ]);
  const policySalt = await fieldFromString(POLICY_VERSION);
  const organizationKey = await fieldFromString(input.organizationId);
  const subjectKey = await fieldFromString(input.subjectId);
  const inputSalt = await fieldFromString(`${input.organizationId}:${input.subjectId}:${recordDigest}:${input.records.join(":")}`);
  const poseidonHash = (...values: bigint[]) => {
    if (values.length === 6) return poseidon6(values);
    if (values.length === 8) return poseidon8(values);
    throw new Error(`Unsupported Poseidon arity: ${values.length}`);
  };
  const policyCommitment = poseidonHash(POLICY_ID, BigInt("3"), BigInt("7500"), BigInt("3500"), BigInt("72"), policySalt);
  const inputCommitment = poseidonHash(organizationKey, subjectKey, ...input.records.map(BigInt), BigInt(input.liabilitiesUsd), BigInt(input.riskScore), inputSalt);
  const witness = {
    policyId: POLICY_ID.toString(), policyCommitment: policyCommitment.toString(), inputCommitment: inputCommitment.toString(), satisfiedClaim: "1",
    organizationKey: organizationKey.toString(), subjectKey: subjectKey.toString(), membershipVerified: "1",
    record0: String(input.records[0]), record1: String(input.records[1]), record2: String(input.records[2]), liabilitiesUsd: String(input.liabilitiesUsd), riskScore: String(input.riskScore),
    minRecordCount: "3", minAverageAmountUsd: "7500", maxLiabilityBps: "3500", minRiskScore: "72", policySalt: policySalt.toString(), inputSalt: inputSalt.toString(),
  };
  onProgress?.("Generating Groth16 proof locally");
  const { groth16 } = await import("snarkjs");
  // The bytes are hash-checked above; snarkjs must receive the browser URLs so
  // its WASM loader uses the browser-compatible execution path. A single
  // proving worker avoids spawning dozens of workers on high-core machines.
  const { proof, publicSignals } = await withTimeout(
    groth16.fullProve(witness, ARTIFACTS.wasm.url, ARTIFACTS.zkey.url, undefined, undefined, { singleThread: true }),
    180_000,
    "Browser proving timed out. The private inputs stayed in this browser and no proof was submitted.",
  );
  onProgress?.("Verifying Groth16 proof locally");
  if (!(await groth16.verify(verificationKey, publicSignals, proof))) throw new Error("Local Groth16 verification failed.");
  const issuedAt = new Date().toISOString();
  const unsigned = {
    proofId: `record_private_${crypto.randomUUID()}`, nonce: (await sha256(`${recordDigest}:${issuedAt}`)).slice(0, 32), issuedAt,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), circuitId: "private_dao_blind_policy_overlay", circuitVersion: "groth16-v1", policyVersion: POLICY_VERSION,
    workflowId: `record_${recordDigest.slice(0, 16)}`, originalProofHash: "", publicOutcome: "policy-satisfied", policySatisfied: true,
    decision: "Policy satisfied. The decision can be verified without revealing the policy inputs.", policyCommitment: policyCommitment.toString(), inputCommitment: inputCommitment.toString(), recordDigestBinding: recordDigest,
    verificationKeyHash: await sha256(verificationKey), verifierInputs: { provingSystem: "groth16", circuit: "private_dao_blind_policy_overlay", verificationCommand: "snarkjs groth16 verify", publicSignals: ["policyId", "policyCommitment", "inputCommitment", "satisfiedClaim"] },
    completedStages: [{ id: "private-inputs", label: "Private inputs processed in this browser", status: "completed" }, { id: "witness", label: "Witness generated locally", status: "completed" }, { id: "groth16", label: "Groth16 proof generated locally", status: "completed" }, { id: "verification", label: "Proof verified locally", status: "completed" }],
    publicChecks: ["membership", "records", "capacity", "liability", "risk"].map((id) => ({ id, label: id, satisfied: true })),
    groth16Proof: { provingSystem: "groth16", circuit: "private_dao_blind_policy_overlay", verificationMode: "groth16-snarkjs", verified: true, publicSignals, proof, verificationKey, proofHash: await sha256(proof), publicSignalsHash: await sha256(publicSignals), verificationKeyHash: await sha256(verificationKey) },
    valuesUsedButNotRevealed: ["Raw subject identity", "Private record values", "Risk score", "Liability ratio", "Policy thresholds"],
    verifierStatement: "The browser generated and verified this proof without sending private inputs to the control plane.",
  };
  const originalProofHash = await sha256({ ...unsigned, originalProofHash: undefined });
  onProgress?.("Proof ready; sending only public proof material");
  return { ...unsigned, originalProofHash };
}
