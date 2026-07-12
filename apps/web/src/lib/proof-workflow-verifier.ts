import { createHash } from "crypto";

import {
  assertCreditLimitProofPackage,
  buildCreditLimitProofPayload,
  buildDemoCreditLimitProofPackage,
  stableStringify,
  type CreditLimitProofVerification,
  type CreditLimitPublicProofPackage,
} from "./proof-workflow-proof-package";

export function computeCreditLimitProofHash(proofPackage: CreditLimitPublicProofPackage) {
  return createHash("sha256").update(stableStringify(buildCreditLimitProofPayload(proofPackage))).digest("hex");
}

export function buildDemoCreditLimitProofPackageWithHash() {
  const unsigned = buildDemoCreditLimitProofPackage("");
  const originalProofHash = computeCreditLimitProofHash(unsigned);
  return buildDemoCreditLimitProofPackage(originalProofHash);
}

export function verifyCreditLimitProofPackage(value: unknown): CreditLimitProofVerification {
  try {
    const proofPackage = assertCreditLimitProofPackage(value);
    const recomputedHash = computeCreditLimitProofHash(proofPackage);
    const originalHash = proofPackage.originalProofHash?.trim() || null;

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
        message: "Mismatch. The proof package was changed after the original hash was created.",
      };
    }

    return {
      ok: true,
      status: "verified",
      match: true,
      originalHash,
      recomputedHash,
      message: "Verified. The recomputed proof matches the original hash.",
    };
  } catch (error) {
    return {
      ok: false,
      status: "invalid-proof-package",
      match: false,
      originalHash: null,
      recomputedHash: null,
      message: error instanceof Error ? error.message : "Invalid proof package.",
    };
  }
}
