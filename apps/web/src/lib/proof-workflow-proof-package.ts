import { creditLimitDemoStages, demoProofId } from "./proof-workflow-demo-data";

export type CreditLimitPublicProofStage = {
  id: string;
  label: string;
  status: "completed";
};

export type CreditLimitPublicProofPackage = {
  proofId: string;
  workflowId: string;
  originalProofHash: string;
  publicOutcome: "credit-limit-issued";
  issuedLimitUsd: number;
  currency: string;
  completedStages: CreditLimitPublicProofStage[];
  publicMetrics: {
    proMembershipVerified: boolean;
    importedRecordCount: number;
    riskBand: string;
  };
  valuesUsedButNotRevealed: string[];
  verifierStatement: string;
};

export type CreditLimitProofVerification =
  | {
      ok: true;
      status: "verified";
      match: true;
      originalHash: string;
      recomputedHash: string;
      message: string;
    }
  | {
      ok: false;
      status: "missing-original-proof-hash" | "invalid-proof-package" | "mismatch";
      match: false;
      originalHash: string | null;
      recomputedHash: string | null;
      message: string;
    };

export const creditLimitHiddenDecisionValues = [
  "Customer earnings",
  "Internal thresholds",
  "Internal formulas",
  "Reviewer notes",
  "Risk model",
] as const;

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));

  return `{${entries.map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`).join(",")}}`;
}

export function buildCreditLimitProofPayload(proofPackage: CreditLimitPublicProofPackage) {
  const payload: Omit<CreditLimitPublicProofPackage, "originalProofHash"> & { originalProofHash?: string } = {
    ...proofPackage,
  };
  delete payload.originalProofHash;
  return payload;
}

export function buildDemoCreditLimitProofPackage(originalProofHash: string): CreditLimitPublicProofPackage {
  return {
    proofId: demoProofId,
    workflowId: "customer_credit_demo_verified",
    originalProofHash,
    publicOutcome: "credit-limit-issued",
    issuedLimitUsd: 2250,
    currency: "USD",
    completedStages: creditLimitDemoStages.map((stage) => ({
      id: stage.id,
      label: stage.label,
      status: "completed",
    })),
    publicMetrics: {
      proMembershipVerified: true,
      importedRecordCount: 3,
      riskBand: "strong",
    },
    valuesUsedButNotRevealed: [...creditLimitHiddenDecisionValues],
    verifierStatement:
      "We recompute the proof from the public proof package and compare it with the original hash.",
  };
}

export function assertCreditLimitProofPackage(value: unknown): CreditLimitPublicProofPackage {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Proof package must be an object.");
  }
  const proofPackage = value as Partial<CreditLimitPublicProofPackage>;
  if (!proofPackage.proofId || typeof proofPackage.proofId !== "string") throw new Error("proofId is required.");
  if (!proofPackage.workflowId || typeof proofPackage.workflowId !== "string") throw new Error("workflowId is required.");
  if (typeof proofPackage.originalProofHash !== "string") throw new Error("originalProofHash is required.");
  if (proofPackage.publicOutcome !== "credit-limit-issued") throw new Error("publicOutcome is invalid.");
  if (typeof proofPackage.issuedLimitUsd !== "number" || !Number.isFinite(proofPackage.issuedLimitUsd)) {
    throw new Error("issuedLimitUsd is invalid.");
  }
  if (!proofPackage.currency || typeof proofPackage.currency !== "string") throw new Error("currency is required.");
  if (!Array.isArray(proofPackage.completedStages) || proofPackage.completedStages.length === 0) {
    throw new Error("completedStages are required.");
  }
  for (const stage of proofPackage.completedStages) {
    if (!stage || typeof stage !== "object") throw new Error("completedStages are invalid.");
    if (typeof stage.id !== "string" || typeof stage.label !== "string" || stage.status !== "completed") {
      throw new Error("completedStages are invalid.");
    }
  }
  if (!proofPackage.publicMetrics || typeof proofPackage.publicMetrics !== "object") {
    throw new Error("publicMetrics are required.");
  }
  if (typeof proofPackage.publicMetrics.proMembershipVerified !== "boolean") {
    throw new Error("publicMetrics.proMembershipVerified is invalid.");
  }
  if (
    typeof proofPackage.publicMetrics.importedRecordCount !== "number" ||
    !Number.isInteger(proofPackage.publicMetrics.importedRecordCount) ||
    proofPackage.publicMetrics.importedRecordCount < 1
  ) {
    throw new Error("publicMetrics.importedRecordCount is invalid.");
  }
  if (typeof proofPackage.publicMetrics.riskBand !== "string") throw new Error("publicMetrics.riskBand is invalid.");
  if (!Array.isArray(proofPackage.valuesUsedButNotRevealed)) {
    throw new Error("valuesUsedButNotRevealed are required.");
  }
  if (typeof proofPackage.verifierStatement !== "string") throw new Error("verifierStatement is required.");

  return proofPackage as CreditLimitPublicProofPackage;
}
