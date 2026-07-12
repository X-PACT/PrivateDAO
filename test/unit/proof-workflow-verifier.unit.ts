import { assert } from "chai";

import {
  buildDemoCreditLimitProofPackageWithHash,
  computeCreditLimitProofHash,
  verifyCreditLimitProofPackage,
} from "../../apps/web/src/lib/proof-workflow-verifier";

describe("proof workflow verifier", () => {
  it("same proof package recomputes the same hash", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const recomputedHash = computeCreditLimitProofHash(proofPackage);

    assert.equal(recomputedHash, proofPackage.originalProofHash);
  });

  it("modified issuedLimit fails verification", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const verification = verifyCreditLimitProofPackage({
      ...proofPackage,
      issuedLimitUsd: proofPackage.issuedLimitUsd + 50,
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.equal(verification.match, false);
    assert.isString(verification.originalHash);
    assert.isString(verification.recomputedHash);
    assert.notEqual(verification.originalHash, verification.recomputedHash);
  });

  it("modified completed stage fails verification", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const verification = verifyCreditLimitProofPackage({
      ...proofPackage,
      completedStages: proofPackage.completedStages.map((stage) =>
        stage.id === "limit-issuance" ? { ...stage, label: "Changed Limit Issuance" } : stage,
      ),
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
  });

  it("missing originalProofHash fails safely", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const verification = verifyCreditLimitProofPackage({
      ...proofPackage,
      originalProofHash: "",
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "missing-original-proof-hash");
    assert.equal(verification.match, false);
  });

  it("invalid proof package returns safe error", () => {
    const verification = verifyCreditLimitProofPackage({
      proofId: "invalid",
      issuedLimitUsd: "2250",
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "invalid-proof-package");
    assert.equal(verification.match, false);
  });

  it("private fields are not exposed", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const serialized = JSON.stringify(proofPackage).toLowerCase();

    assert.notInclude(serialized, "customer-live-demo-001");
    assert.notInclude(serialized, "9200");
    assert.notInclude(serialized, "8800");
    assert.notInclude(serialized, "9400");
    assert.notInclude(serialized, "advance");
    assert.notInclude(serialized, "threshold formula inputs");
  });

  it("demo proof verifies successfully", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const verification = verifyCreditLimitProofPackage(proofPackage);

    assert.equal(verification.ok, true);
    assert.equal(verification.status, "verified");
    assert.equal(verification.match, true);
  });

  it("invalid demo proof does not verify", () => {
    const proofPackage = buildDemoCreditLimitProofPackageWithHash();
    const verification = verifyCreditLimitProofPackage({
      ...proofPackage,
      originalProofHash: "0".repeat(64),
    });

    assert.equal(verification.ok, false);
    assert.equal(verification.status, "mismatch");
    assert.equal(verification.match, false);
  });
});
