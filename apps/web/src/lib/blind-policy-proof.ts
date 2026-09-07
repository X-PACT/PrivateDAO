import { createHash } from "crypto";

import { stableStringify } from "./proof-workflow-proof-package";

export type BlindPolicyPrivateInputs = {
  organizationId: string;
  subjectId: string;
  membershipVerified: boolean;
  records: Array<{ amountUsd: number }>;
  riskScore: number;
  liabilitiesUsd: number;
};

export type BlindPolicyRules = {
  policyId: string;
  policyVersion: string;
  policyLabel: string;
  minRecordCount: number;
  minAverageAmountUsd: number;
  maxLiabilityRatio: number;
  minRiskScore: number;
};

export type BlindPolicyProviderLane = {
  id: "zk-policy-proof" | "refhe-encrypted-evaluation" | "ika-encrypt-2pc-boundary" | "magicblock-fast-session";
  label: string;
  status: "verified" | "committed";
  evidenceClass: "groth16-verified" | "commitment-boundary";
  publicCommitment: string;
  verifierNote: string;
};

export type BlindPolicyGroth16Proof = {
  provingSystem: "groth16";
  circuit: "private_dao_blind_policy_overlay";
  verificationMode: "groth16-snarkjs";
  verified: true;
  publicSignals: string[];
  proof: unknown;
  verificationKey?: unknown;
  proofHash: string;
  publicSignalsHash: string;
  verificationKeyHash: string;
};

export type BlindPolicyProofPackage = {
  proofId: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
  circuitId: "private_dao_blind_policy_overlay";
  circuitVersion: "groth16-v1";
  policyVersion: string;
  workflowId: string;
  originalProofHash: string;
  publicOutcome: "policy-satisfied";
  policySatisfied: true;
  decision: string;
  policyCommitment: string;
  inputCommitment: string;
  verificationKeyHash: string;
  verifierInputs: {
    provingSystem: "groth16";
    circuit: "private_dao_blind_policy_overlay";
    verificationCommand: "snarkjs groth16 verify";
    publicSignals: ["policyId", "policyCommitment", "inputCommitment", "satisfiedClaim"];
  };
  completedStages: Array<{
    id: string;
    label: string;
    status: "completed";
  }>;
  publicChecks: Array<{
    id: string;
    label: string;
    satisfied: true;
  }>;
  groth16Proof: BlindPolicyGroth16Proof;
  providerLanes: BlindPolicyProviderLane[];
  valuesUsedButNotRevealed: string[];
  verifierStatement: string;
};

export type BlindPolicyVerification =
  | {
      ok: true;
      status: "verified";
      match: true;
      originalHash: string;
      recomputedHash: string;
      circuitVersion: string;
      message: string;
    }
  | {
      ok: false;
      status:
        | "policy-not-satisfied"
        | "missing-original-proof-hash"
        | "invalid-proof-package"
        | "mismatch"
        | "expired-proof"
        | "unsupported-circuit-version";
      match: false;
      originalHash: string | null;
      recomputedHash: string | null;
      message: string;
    };

export const defaultBlindPolicyRules: BlindPolicyRules = {
  policyId: "private-credit-capacity-v1",
  policyVersion: "2026-06-25.private-credit-capacity.v1",
  policyLabel: "Private credit capacity policy",
  minRecordCount: 3,
  minAverageAmountUsd: 7500,
  maxLiabilityRatio: 0.35,
  minRiskScore: 72,
};

export const sampleBlindPolicyInputs: BlindPolicyPrivateInputs = {
  organizationId: "sample-lender-001",
  subjectId: "customer-redacted-4381",
  membershipVerified: true,
  records: [{ amountUsd: 8800 }, { amountUsd: 9400 }, { amountUsd: 9200 }],
  riskScore: 84,
  liabilitiesUsd: 2400,
};

function sha256Hex(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function addHoursIso(base: Date, hours: number): string {
  return new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function assertFinitePositiveNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
  return value;
}

function normalizeBlindPolicyInputs(input: BlindPolicyPrivateInputs) {
  if (!input || typeof input !== "object") throw new Error("Private policy input is required.");
  if (!input.organizationId || typeof input.organizationId !== "string") throw new Error("organizationId is required.");
  if (!input.subjectId || typeof input.subjectId !== "string") throw new Error("subjectId is required.");
  if (input.membershipVerified !== true) throw new Error("Membership is not verified.");
  if (!Array.isArray(input.records) || input.records.length === 0) throw new Error("At least one private record is required.");

  const amounts = input.records.map((record, index) => assertFinitePositiveNumber(record?.amountUsd, `records[${index}].amountUsd`));
  const riskScore = assertFinitePositiveNumber(input.riskScore, "riskScore");
  const liabilitiesUsd = typeof input.liabilitiesUsd === "number" && Number.isFinite(input.liabilitiesUsd) ? Math.max(0, input.liabilitiesUsd) : 0;
  const averageAmountUsd = amounts.reduce((sum, value) => sum + value, 0) / amounts.length;
  const liabilityRatio = liabilitiesUsd / Math.max(averageAmountUsd, 1);

  return {
    organizationCommitment: sha256Hex(input.organizationId).slice(0, 32),
    subjectCommitment: sha256Hex(input.subjectId).slice(0, 32),
    membershipVerified: input.membershipVerified,
    recordCount: amounts.length,
    averageAmountUsd,
    riskScore,
    liabilityRatio,
  };
}

function evaluateBlindPolicy(input: BlindPolicyPrivateInputs, rules: BlindPolicyRules) {
  const normalized = normalizeBlindPolicyInputs(input);
  const checks = [
    {
      id: "membership",
      label: "Membership verified",
      satisfied: normalized.membershipVerified === true,
      privateReason: "The subject must be a verified member before a policy proof can be issued.",
    },
    {
      id: "records",
      label: "Required private records imported",
      satisfied: normalized.recordCount >= rules.minRecordCount,
      privateReason: "The workflow needs enough records to evaluate the policy.",
    },
    {
      id: "capacity",
      label: "Capacity policy satisfied",
      satisfied: normalized.averageAmountUsd >= rules.minAverageAmountUsd,
      privateReason: "The private average amount must satisfy the policy threshold.",
    },
    {
      id: "liability",
      label: "Liability policy satisfied",
      satisfied: normalized.liabilityRatio <= rules.maxLiabilityRatio,
      privateReason: "The private liability ratio must remain within the policy envelope.",
    },
    {
      id: "risk",
      label: "Risk policy satisfied",
      satisfied: normalized.riskScore >= rules.minRiskScore,
      privateReason: "The private risk score must satisfy the policy floor.",
    },
  ];
  const failedChecks = checks.filter((check) => !check.satisfied);
  return { normalized, checks, failedChecks };
}

export function buildBlindPolicyProofPayload(proofPackage: BlindPolicyProofPackage) {
  const payload: Omit<BlindPolicyProofPackage, "originalProofHash"> & { originalProofHash?: string } = {
    ...proofPackage,
  };
  delete payload.originalProofHash;
  return payload;
}

export function computeBlindPolicyProofHash(proofPackage: BlindPolicyProofPackage): string {
  return sha256Hex(buildBlindPolicyProofPayload(proofPackage));
}

export function buildBlindPolicyProofPackage(input: {
  workflowId?: string;
  proofId?: string;
  nonce?: string;
  issuedAt?: string;
  expiresAt?: string;
  circuitVersion?: "groth16-v1";
  privateInputs: BlindPolicyPrivateInputs;
  rules?: Partial<BlindPolicyRules>;
  groth16Proof?: BlindPolicyGroth16Proof;
}): BlindPolicyProofPackage {
  const rules = { ...defaultBlindPolicyRules, ...(input.rules ?? {}) };
  const { normalized, checks, failedChecks } = evaluateBlindPolicy(input.privateInputs, rules);

  if (failedChecks.length > 0) {
    throw new Error(`Policy proof was not issued: ${failedChecks.map((check) => check.label).join(", ")}.`);
  }

  const workflowId = input.workflowId ?? `blind_policy_${sha256Hex({ normalized, rules }).slice(0, 18)}`;
  const proofId = input.proofId ?? "blind-policy-demo";
  const issuedAt = input.issuedAt ?? new Date().toISOString();
  const expiresAt = input.expiresAt ?? addHoursIso(new Date(issuedAt), 24);
  const circuitId = "private_dao_blind_policy_overlay" as const;
  const circuitVersion = input.circuitVersion ?? ("groth16-v1" as const);
  const nonce = input.nonce ?? sha256Hex({ workflowId, proofId, issuedAt, normalized }).slice(0, 32);
  const policyCommitment = sha256Hex({
    policyId: rules.policyId,
    policyVersion: rules.policyVersion,
    minRecordCount: rules.minRecordCount,
    minAverageAmountUsd: rules.minAverageAmountUsd,
    maxLiabilityRatio: rules.maxLiabilityRatio,
    minRiskScore: rules.minRiskScore,
  });
  const inputCommitment = sha256Hex({
    organizationCommitment: normalized.organizationCommitment,
    subjectCommitment: normalized.subjectCommitment,
    recordCount: normalized.recordCount,
    averageAmountCommitment: sha256Hex(normalized.averageAmountUsd),
    riskCommitment: sha256Hex(normalized.riskScore),
    liabilityCommitment: sha256Hex(normalized.liabilityRatio),
  });
  const publicChecks = checks.map((check) => ({
    id: check.id,
    label: check.label,
    satisfied: true as const,
  }));
  const laneSeed = {
    workflowId,
    proofId,
    policyCommitment,
    inputCommitment,
    checks: publicChecks,
  };
  if (!input.groth16Proof?.verified) {
    throw new Error("Groth16 proof is required before a blind policy proof package can be issued.");
  }
  const groth16Proof = input.groth16Proof;
  const unsigned: BlindPolicyProofPackage = {
    proofId,
    nonce,
    issuedAt,
    expiresAt,
    circuitId,
    circuitVersion,
    policyVersion: rules.policyVersion,
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
      { id: "data-import", label: "Private data imported", status: "completed" },
      { id: "policy-evaluation", label: "Blind policy evaluated", status: "completed" },
      { id: "zk-policy-proof", label: "ZK policy proof generated", status: "completed" },
      { id: "public-verification", label: "Public verifier package created", status: "completed" },
    ],
    publicChecks,
    groth16Proof,
    providerLanes: [
      {
        id: "zk-policy-proof",
        label: "ZK policy proof",
        status: "verified",
        evidenceClass: "groth16-verified",
        publicCommitment: sha256Hex({
          lane: "zk",
          ...laneSeed,
          proofHash: groth16Proof.proofHash,
          publicSignalsHash: groth16Proof.publicSignalsHash,
          verificationKeyHash: groth16Proof.verificationKeyHash,
        }),
        verifierNote:
          "Groth16 verifies the private witness against public signals: policy id, policy commitment, input commitment, and satisfied claim.",
      },
      {
        id: "refhe-encrypted-evaluation",
        label: "REFHE encrypted evaluation lane",
        status: "committed",
        evidenceClass: "commitment-boundary",
        publicCommitment: sha256Hex({ lane: "refhe", encryptedAggregate: inputCommitment, policyCommitment }),
        verifierNote:
          "Commitment boundary only: this package commits encrypted-evaluation metadata. It does not claim a separate live REFHE proof unless a REFHE receipt is attached.",
      },
      {
        id: "ika-encrypt-2pc-boundary",
        label: "Ika / Encrypt 2PC-MPC boundary",
        status: "committed",
        evidenceClass: "commitment-boundary",
        publicCommitment: sha256Hex({ lane: "ika-encrypt", workflowId, policyCommitment }),
        verifierNote:
          "Commitment boundary only: this package binds encrypted authorization metadata. It does not claim final Ika dWallet DKG or 2PC-MPC signing without a separate Ika receipt.",
      },
      {
        id: "magicblock-fast-session",
        label: "MagicBlock fast policy session",
        status: "committed",
        evidenceClass: "commitment-boundary",
        publicCommitment: sha256Hex({ lane: "magicblock", workflowId, publicChecks }),
        verifierNote:
          "Commitment boundary only: this package binds the fast-session intent. It does not claim MagicBlock rollup execution unless a MagicBlock receipt is attached.",
      },
    ],
    valuesUsedButNotRevealed: [
      "Raw subject identity",
      "Private record values",
      "Average private amount",
      "Risk score",
      "Liability ratio",
      "Policy thresholds",
      "Internal policy formula",
    ],
    verifierStatement:
      "We recompute the proof package and compare it with the original hash. If the policy result, commitments, or provider lanes change, verification fails.",
  };

  return {
    ...unsigned,
    originalProofHash: computeBlindPolicyProofHash(unsigned),
  };
}

export function buildDemoBlindPolicyProofPackage(groth16Proof: BlindPolicyGroth16Proof): BlindPolicyProofPackage {
  return buildBlindPolicyProofPackage({
    proofId: "blind-policy-demo",
    workflowId: "blind_policy_customer_capacity_demo",
    privateInputs: sampleBlindPolicyInputs,
    rules: defaultBlindPolicyRules,
    groth16Proof,
  });
}

export function assertBlindPolicyProofPackage(value: unknown): BlindPolicyProofPackage {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Proof package must be an object.");
  const proofPackage = value as Partial<BlindPolicyProofPackage>;
  if (!proofPackage.proofId || typeof proofPackage.proofId !== "string") throw new Error("proofId is required.");
  if (!proofPackage.nonce || typeof proofPackage.nonce !== "string") throw new Error("nonce is required.");
  if (!proofPackage.issuedAt || typeof proofPackage.issuedAt !== "string") throw new Error("issuedAt is required.");
  if (!proofPackage.expiresAt || typeof proofPackage.expiresAt !== "string") throw new Error("expiresAt is required.");
  if (proofPackage.circuitId !== "private_dao_blind_policy_overlay") throw new Error("circuitId is invalid.");
  if (!proofPackage.circuitVersion || typeof proofPackage.circuitVersion !== "string") throw new Error("circuitVersion is required.");
  if (!proofPackage.policyVersion || typeof proofPackage.policyVersion !== "string") throw new Error("policyVersion is required.");
  if (!proofPackage.workflowId || typeof proofPackage.workflowId !== "string") throw new Error("workflowId is required.");
  if (typeof proofPackage.originalProofHash !== "string") throw new Error("originalProofHash is required.");
  if (proofPackage.publicOutcome !== "policy-satisfied") throw new Error("publicOutcome is invalid.");
  if (proofPackage.policySatisfied !== true) throw new Error("policySatisfied must be true.");
  if (!proofPackage.decision || typeof proofPackage.decision !== "string") throw new Error("decision is required.");
  if (!proofPackage.policyCommitment || typeof proofPackage.policyCommitment !== "string") {
    throw new Error("policyCommitment is required.");
  }
  if (!proofPackage.inputCommitment || typeof proofPackage.inputCommitment !== "string") {
    throw new Error("inputCommitment is required.");
  }
  if (!proofPackage.verificationKeyHash || typeof proofPackage.verificationKeyHash !== "string") {
    throw new Error("verificationKeyHash is required.");
  }
  if (!proofPackage.verifierInputs || proofPackage.verifierInputs.provingSystem !== "groth16") {
    throw new Error("groth16 verifierInputs are required.");
  }
  if (!Array.isArray(proofPackage.completedStages) || proofPackage.completedStages.length < 1) {
    throw new Error("completedStages are required.");
  }
  for (const stage of proofPackage.completedStages) {
    if (!stage || typeof stage !== "object") throw new Error("completedStages are invalid.");
    if (typeof stage.id !== "string" || typeof stage.label !== "string" || stage.status !== "completed") {
      throw new Error("completedStages are invalid.");
    }
  }
  if (!Array.isArray(proofPackage.publicChecks) || proofPackage.publicChecks.length < 1) {
    throw new Error("publicChecks are required.");
  }
  for (const check of proofPackage.publicChecks) {
    if (!check || typeof check !== "object") throw new Error("publicChecks are invalid.");
    if (typeof check.id !== "string" || typeof check.label !== "string" || check.satisfied !== true) {
      throw new Error("publicChecks are invalid.");
    }
  }
  if (!proofPackage.groth16Proof || typeof proofPackage.groth16Proof !== "object") {
    throw new Error("groth16Proof is required.");
  }
  if (proofPackage.groth16Proof.provingSystem !== "groth16") throw new Error("groth16 proving system is invalid.");
  if (proofPackage.groth16Proof.circuit !== "private_dao_blind_policy_overlay") {
    throw new Error("groth16 circuit is invalid.");
  }
  if (proofPackage.groth16Proof.verificationMode !== "groth16-snarkjs") {
    throw new Error("groth16 verification mode is invalid.");
  }
  if (proofPackage.groth16Proof.verified !== true) throw new Error("groth16 proof must be verified.");
  if (!Array.isArray(proofPackage.groth16Proof.publicSignals)) throw new Error("groth16 public signals are required.");
  if (!proofPackage.groth16Proof.proof || typeof proofPackage.groth16Proof.proof !== "object") {
    throw new Error("groth16 proof object is required.");
  }
  if (!proofPackage.groth16Proof.verificationKey || typeof proofPackage.groth16Proof.verificationKey !== "object") {
    throw new Error("groth16 verification key is required.");
  }
  if (typeof proofPackage.groth16Proof.proofHash !== "string") throw new Error("groth16 proof hash is required.");
  if (typeof proofPackage.groth16Proof.publicSignalsHash !== "string") {
    throw new Error("groth16 public signals hash is required.");
  }
  if (typeof proofPackage.groth16Proof.verificationKeyHash !== "string") {
    throw new Error("groth16 verification key hash is required.");
  }
  if (proofPackage.verificationKeyHash !== proofPackage.groth16Proof.verificationKeyHash) {
    throw new Error("verificationKeyHash does not match groth16 proof material.");
  }
  if (!Array.isArray(proofPackage.providerLanes) || proofPackage.providerLanes.length < 4) {
    throw new Error("providerLanes are required.");
  }
  for (const lane of proofPackage.providerLanes) {
    if (!lane || typeof lane !== "object") throw new Error("providerLanes are invalid.");
    if (
      typeof lane.id !== "string" ||
      typeof lane.label !== "string" ||
      (lane.status !== "verified" && lane.status !== "committed") ||
      (lane.evidenceClass !== "groth16-verified" && lane.evidenceClass !== "commitment-boundary")
    ) {
      throw new Error("providerLanes are invalid.");
    }
    if (typeof lane.publicCommitment !== "string" || lane.publicCommitment.length < 32) {
      throw new Error("provider lane commitment is invalid.");
    }
  }
  if (!Array.isArray(proofPackage.valuesUsedButNotRevealed)) {
    throw new Error("valuesUsedButNotRevealed are required.");
  }
  if (typeof proofPackage.verifierStatement !== "string") throw new Error("verifierStatement is required.");

  return proofPackage as BlindPolicyProofPackage;
}

export function verifyBlindPolicyProofPackage(value: unknown): BlindPolicyVerification {
  try {
    const proofPackage = assertBlindPolicyProofPackage(value);
    const recomputedHash = computeBlindPolicyProofHash(proofPackage);
    const originalHash = proofPackage.originalProofHash.trim() || null;

    if (!originalHash) {
      return {
        ok: false,
        status: "missing-original-proof-hash",
        match: false,
        originalHash,
        recomputedHash,
        message: "Missing original proof hash.",
      };
    }

    if (originalHash !== recomputedHash) {
      return {
        ok: false,
        status: "mismatch",
        match: false,
        originalHash,
        recomputedHash,
        message: "Mismatch. The blind policy proof package was changed after the original hash was created.",
      };
    }

    if (proofPackage.circuitVersion !== "groth16-v1") {
      return {
        ok: false,
        status: "unsupported-circuit-version",
        match: false,
        originalHash,
        recomputedHash,
        message: `Unsupported circuit version: ${proofPackage.circuitVersion}.`,
      };
    }

    if (Number.isNaN(Date.parse(proofPackage.expiresAt)) || Date.parse(proofPackage.expiresAt) <= Date.now()) {
      return {
        ok: false,
        status: "expired-proof",
        match: false,
        originalHash,
        recomputedHash,
        message: "The proof package has expired.",
      };
    }

    if (proofPackage.policySatisfied !== true || proofPackage.publicChecks.some((check) => check.satisfied !== true)) {
      return {
        ok: false,
        status: "policy-not-satisfied",
        match: false,
        originalHash,
        recomputedHash,
        message: "Policy proof is not satisfied.",
      };
    }

    return {
      ok: true,
      status: "verified",
      match: true,
      originalHash,
      recomputedHash,
      circuitVersion: proofPackage.circuitVersion,
      message: "Verified. The recomputed blind policy proof matches the original hash.",
    };
  } catch (error) {
    return {
      ok: false,
      status: "invalid-proof-package",
      match: false,
      originalHash: null,
      recomputedHash: null,
      message: error instanceof Error ? error.message : "Invalid blind policy proof package.",
    };
  }
}
